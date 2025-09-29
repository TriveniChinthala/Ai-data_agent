import express from 'express';
import multer from 'multer';
import XLSX from 'xlsx';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

// ES6 module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const express= require("express");
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.xlsx', '.xls', '.csv'];
    const fileExt = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(fileExt)) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel and CSV files are allowed'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Initialize Gemini AI
let genAI;
let model;

const initializeGemini = () => {
  if (process.env.GEMINI_API_KEY) {
    try {
      genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
      console.log('Gemini AI initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Gemini AI:', error);
    }
  } else {
    console.log('GEMINI_API_KEY not found. AI features will use mock responses.');
  }
};

initializeGemini();

// In-memory storage for processed files (in production, use a database)
const processedFiles = new Map();

// Helper function to analyze data quality
const analyzeDataQuality = (data) => {
  if (!data || data.length === 0) return { quality: 'poor', issues: ['No data found'] };
  
  const totalCells = data.length * Object.keys(data[0]).length;
  let emptyCells = 0;
  let issues = [];
  
  // Count empty cells and identify issues
  data.forEach((row, index) => {
    Object.entries(row).forEach(([key, value]) => {
      if (value === null || value === undefined || value === '') {
        emptyCells++;
      }
    });
  });
  
  const completeness = ((totalCells - emptyCells) / totalCells) * 100;
  
  if (emptyCells > 0) {
    issues.push(`${emptyCells} empty cells found (${(100 - completeness).toFixed(1)}% missing data)`);
  }
  
  // Check for duplicate rows
  const uniqueRows = new Set(data.map(row => JSON.stringify(row)));
  if (uniqueRows.size < data.length) {
    issues.push(`${data.length - uniqueRows.size} duplicate rows detected`);
  }
  
  // Determine quality based on completeness
  let quality;
  if (completeness >= 95) quality = 'excellent';
  else if (completeness >= 85) quality = 'good';
  else if (completeness >= 70) quality = 'fair';
  else quality = 'poor';
  
  return { quality, issues, completeness: completeness.toFixed(1) };
};

// Helper function to detect column types
const detectColumnTypes = (data) => {
  if (!data || data.length === 0) return {};
  
  const columnTypes = {};
  const columns = Object.keys(data[0]);
  
  columns.forEach(column => {
    const values = data.map(row => row[column]).filter(val => val !== null && val !== undefined && val !== '');
    
    if (values.length === 0) {
      columnTypes[column] = 'unknown';
      return;
    }
    
    // Check if all values are numbers
    const numericValues = values.filter(val => !isNaN(val) && !isNaN(parseFloat(val)));
    if (numericValues.length === values.length) {
      columnTypes[column] = 'number';
      return;
    }
    
    // Check if all values are dates
    const dateValues = values.filter(val => !isNaN(Date.parse(val)));
    if (dateValues.length === values.length) {
      columnTypes[column] = 'date';
      return;
    }
    
    columnTypes[column] = 'text';
  });
  
  return columnTypes;
};

// Helper function to clean and normalize data
const cleanData = (data) => {
  return data.map(row => {
    const cleanedRow = {};
    Object.entries(row).forEach(([key, value]) => {
      // Clean column names
      const cleanKey = key.trim().replace(/\s+/g, ' ');
      
      // Clean values
      if (typeof value === 'string') {
        cleanedRow[cleanKey] = value.trim();
      } else if (typeof value === 'number') {
        cleanedRow[cleanKey] = value;
      } else {
        cleanedRow[cleanKey] = value;
      }
    });
    return cleanedRow;
  });
};

// API Routes

// Upload and process Excel file
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileId = uuidv4();
    const filePath = req.file.path;
    
    // Read Excel file
    let workbook;
    let data = [];
    
    if (req.file.originalname.endsWith('.csv')) {
      // Handle CSV files
      const csvData = fs.readFileSync(filePath, 'utf8');
      workbook = XLSX.read(csvData, { type: 'string' });
    } else {
      // Handle Excel files
      workbook = XLSX.readFile(filePath);
    }
    
    // Get the first worksheet
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    data = XLSX.utils.sheet_to_json(worksheet);
    
    if (data.length === 0) {
      return res.status(400).json({ error: 'No data found in the file' });
    }
    
    // Clean and normalize data
    const cleanedData = cleanData(data);
    
    // Analyze data quality
    const qualityAnalysis = analyzeDataQuality(cleanedData);
    
    // Detect column types
    const columnTypes = detectColumnTypes(cleanedData);
    
    // Store processed file data
    const processedFile = {
      id: fileId,
      originalName: req.file.originalname,
      fileName: req.file.filename,
      size: req.file.size,
      uploadedAt: new Date(),
      processed: true,
      data: cleanedData,
      columns: Object.keys(cleanedData[0]),
      columnTypes: columnTypes,
      summary: {
        rows: cleanedData.length,
        columns: Object.keys(cleanedData[0]).length,
        dataQuality: qualityAnalysis.quality,
        issues: qualityAnalysis.issues,
        completeness: qualityAnalysis.completeness
      }
    };
    
    processedFiles.set(fileId, processedFile);
    
    // Clean up uploaded file
    fs.unlinkSync(filePath);
    
    res.json({
      success: true,
      file: {
        id: processedFile.id,
        name: processedFile.originalName,
        size: processedFile.size,
        uploadedAt: processedFile.uploadedAt,
        processed: processedFile.processed,
        columns: processedFile.columns,
        summary: processedFile.summary
      }
    });
    
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to process file: ' + error.message });
  }
});

// Get file data
app.get('/api/files/:fileId', (req, res) => {
  const { fileId } = req.params;
  const file = processedFiles.get(fileId);
  
  if (!file) {
    return res.status(404).json({ error: 'File not found' });
  }
  
  res.json({
    success: true,
    file: {
      id: file.id,
      name: file.originalName,
      size: file.size,
      uploadedAt: file.uploadedAt,
      processed: file.processed,
      data: file.data.slice(0, 100), // Return first 100 rows for preview
      columns: file.columns,
      columnTypes: file.columnTypes,
      summary: file.summary
    }
  });
});

// Query data with AI
app.post('/api/query', async (req, res) => {
  try {
    const { fileId, query } = req.body;
    
    if (!fileId || !query) {
      return res.status(400).json({ error: 'File ID and query are required' });
    }
    
    const file = processedFiles.get(fileId);
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    // Prepare data context for AI
    const dataContext = {
      columns: file.columns,
      columnTypes: file.columnTypes,
      rowCount: file.data.length,
      sampleData: file.data.slice(0, 5), // First 5 rows as sample
      summary: file.summary
    };
    
    let aiResponse = '';
    let chartData = null;
    let chartType = 'bar';
    
    if (model && process.env.GEMINI_API_KEY) {
      try {
        // Create a comprehensive prompt for Gemini
        const prompt = `
You are a data analyst AI. Analyze the following dataset and answer the user's question.

Dataset Information:
- Columns: ${file.columns.join(', ')}
- Column Types: ${JSON.stringify(file.columnTypes)}
- Total Rows: ${file.data.length}
- Data Quality: ${file.summary.dataQuality}

Sample Data (first 5 rows):
${JSON.stringify(dataContext.sampleData, null, 2)}

User Question: "${query}"

Please provide:
1. A detailed analysis answering the user's question
2. Key insights from the data
3. Specific numbers and trends where relevant
4. Actionable recommendations if applicable

Keep your response conversational but informative, and focus on the specific question asked. The response should be plain text with no code or markdown.
`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        aiResponse = response.text();
        
      } catch (error) {
        console.error('Gemini AI error:', error);
        aiResponse = generateMockResponse(query, file.data);
      }
    } else {
      aiResponse = generateMockResponse(query, file.data);
    }
    
    // Generate chart data based on query
    const chartResult = generateChartData(query, file.data, file.columns);
    chartData = chartResult.data;
    chartType = chartResult.type;
    
    // Filter relevant data for the response
    const relevantData = filterRelevantData(query, file.data, file.columns);
    
    const queryResult = {
      id: uuidv4(),
      query: query,
      answer: aiResponse,
      data: relevantData,
      chartType: chartType,
      chartData: chartData,
      timestamp: new Date()
    };
    
    res.json({
      success: true,
      result: queryResult
    });
    
  } catch (error) {
    console.error('Query error:', error);
    res.status(500).json({ error: 'Failed to process query: ' + error.message });
  }
});

// Helper function to generate mock responses when AI is not available
const generateMockResponse = (query, data) => {
  const lowerQuery = query.toLowerCase();
  
  if (lowerQuery.includes('sales') && lowerQuery.includes('region')) {
    return `Based on the analysis of ${data.length} records, I can see regional sales performance varies significantly. The data shows different patterns across regions, with some showing stronger performance than others. Key metrics indicate opportunities for optimization in underperforming areas.`;
  }
  
  if (lowerQuery.includes('profit') || lowerQuery.includes('margin')) {
    return `Profit analysis reveals interesting patterns across the dataset. With ${data.length} records analyzed, there are clear variations in profitability across different segments. The data suggests several factors contributing to profit margins that could be optimized.`;
  }
  
  if (lowerQuery.includes('trend') || lowerQuery.includes('time')) {
    return `Time-based analysis of the ${data.length} records shows evolving patterns over the period covered. There are notable trends that indicate both growth opportunities and areas requiring attention. The temporal data reveals seasonal or cyclical patterns worth investigating further.`;
  }
  
  return `Analysis of your ${data.length} records reveals several interesting insights. The data shows various patterns and relationships that could inform business decisions. Key metrics indicate both strengths and opportunities for improvement across different dimensions of your dataset.`;
};

// Helper function to generate chart data
const generateChartData = (query, data, columns) => {
  const lowerQuery = query.toLowerCase();
  
  // Determine chart type based on query
  let chartType = 'bar';
  if (lowerQuery.includes('trend') || lowerQuery.includes('time') || lowerQuery.includes('quarter') || lowerQuery.includes('month')) {
    chartType = 'line';
  } else if (lowerQuery.includes('share') || lowerQuery.includes('percentage') || lowerQuery.includes('distribution')) {
    chartType = 'pie';
  }
  
  // Find relevant columns for aggregation
  let groupByColumn = null;
  let valueColumn = null;
  
  // Look for categorical columns for grouping
  const categoricalColumns = columns.filter(col => {
    const values = data.map(row => row[col]);
    const uniqueValues = [...new Set(values)];
    return uniqueValues.length < data.length * 0.5 && uniqueValues.length > 1;
  });
  
  // Look for numeric columns for values
  const numericColumns = columns.filter(col => {
    const values = data.map(row => row[col]).filter(val => val !== null && val !== undefined);
    return values.length > 0 && values.every(val => !isNaN(val) && !isNaN(parseFloat(val)));
  });
  
  // Select appropriate columns based on query
  if (lowerQuery.includes('region') && columns.some(col => col.toLowerCase().includes('region'))) {
    groupByColumn = columns.find(col => col.toLowerCase().includes('region'));
  } else if (lowerQuery.includes('category') && columns.some(col => col.toLowerCase().includes('category'))) {
    groupByColumn = columns.find(col => col.toLowerCase().includes('category'));
  } else if (lowerQuery.includes('product') && columns.some(col => col.toLowerCase().includes('product'))) {
    groupByColumn = columns.find(col => col.toLowerCase().includes('product'));
  } else if (categoricalColumns.length > 0) {
    groupByColumn = categoricalColumns[0];
  }
  
  if (lowerQuery.includes('sales') && columns.some(col => col.toLowerCase().includes('sales'))) {
    valueColumn = columns.find(col => col.toLowerCase().includes('sales'));
  } else if (lowerQuery.includes('profit') && columns.some(col => col.toLowerCase().includes('profit'))) {
    valueColumn = columns.find(col => col.toLowerCase().includes('profit'));
  } else if (lowerQuery.includes('revenue') && columns.some(col => col.toLowerCase().includes('revenue'))) {
    valueColumn = columns.find(col => col.toLowerCase().includes('revenue'));
  } else if (numericColumns.length > 0) {
    valueColumn = numericColumns[0];
  }
  
  if (!groupByColumn || !valueColumn) {
    return { type: chartType, data: null };
  }
  
  // Aggregate data
  const aggregated = {};
  data.forEach(row => {
    const group = row[groupByColumn];
    const value = parseFloat(row[valueColumn]) || 0;
    
    if (group) {
      aggregated[group] = (aggregated[group] || 0) + value;
    }
  });
  
  // Sort by value and take top 10
  const sortedEntries = Object.entries(aggregated)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10);
  
  const labels = sortedEntries.map(([label]) => label);
  const values = sortedEntries.map(([, value]) => value);
  
  const chartData = {
    labels: labels,
    datasets: [{
      label: `${valueColumn} by ${groupByColumn}`,
      data: values,
      backgroundColor: [
        '#2563EB', '#0D9488', '#EA580C', '#7C3AED', '#DC2626',
        '#059669', '#7C2D12', '#1E40AF', '#BE185D', '#0F766E'
      ],
      borderColor: chartType === 'line' ? '#2563EB' : undefined,
      tension: chartType === 'line' ? 0.4 : undefined
    }]
  };
  
  return { type: chartType, data: chartData };
};

// Helper function to filter relevant data
const filterRelevantData = (query, data, columns) => {
  // Return a sample of relevant data (first 20 rows)
  return data.slice(0, 20);
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date(),
    aiEnabled: !!process.env.GEMINI_API_KEY
  });
});

app.get("/api/models", async (req, res) => {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Google API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    const models = (data.models || []).map((m) => ({
      name: m.name,
      displayName: m.displayName,
      description: m.description,
      supportedMethods: m.supportedGenerationMethods,
    }));

    res.json({ success: true, models });
  } catch (error) {
    console.error("Error listing models:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});


// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`AI Status: ${process.env.GEMINI_API_KEY ? 'Enabled' : 'Mock responses only'}`);
});