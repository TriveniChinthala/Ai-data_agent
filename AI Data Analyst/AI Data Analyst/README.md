# Excel Data AI Insights Platform

A powerful web application that allows users to upload Excel files and query their data using natural language powered by Google's Gemini AI.

## Features

- **Excel File Upload**: Support for .xlsx, .xls, and .csv files
- **AI-Powered Queries**: Ask questions about your data in natural language
- **Smart Data Processing**: Automatic data cleaning, type detection, and quality analysis
- **Interactive Charts**: Auto-generated visualizations based on your queries
- **Real-time Analysis**: Get instant insights from your data

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Get your Gemini API key:
   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Copy the key

3. Update the `.env` file:
```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
PORT=3001
```

### 3. Start the Application

#### Option 1: Start both frontend and backend together
```bash
npm run dev:full
```

#### Option 2: Start them separately
Terminal 1 (Backend):
```bash
npm run dev:server
```

Terminal 2 (Frontend):
```bash
npm run dev
```

### 4. Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## Usage

1. **Upload Excel File**: Drag and drop or browse to select your Excel/CSV file
2. **Wait for Processing**: The system will automatically clean and analyze your data
3. **Ask Questions**: Use natural language to query your data:
   - "What are the top 5 products by sales?"
   - "Show me quarterly trends"
   - "Which regions have the highest profit margins?"
4. **View Results**: Get AI-generated insights with interactive charts and data tables

## API Endpoints

- `POST /api/upload` - Upload and process Excel files
- `GET /api/files/:fileId` - Get processed file data
- `POST /api/query` - Query data with natural language
- `GET /api/health` - Health check endpoint

## Supported File Formats

- Excel (.xlsx, .xls)
- CSV (.csv)
- Maximum file size: 10MB

## Data Processing Features

- **Automatic Data Cleaning**: Removes empty rows, standardizes formats
- **Type Detection**: Automatically identifies numbers, dates, and text
- **Quality Analysis**: Provides data completeness and quality scores
- **Column Standardization**: Normalizes column names and formats

## AI Capabilities

- Natural language query processing
- Intelligent chart type selection
- Data relationship analysis
- Trend identification
- Statistical insights generation

## Technology Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Vite
- **Backend**: Node.js, Express
- **AI**: Google Gemini Pro
- **File Processing**: SheetJS (xlsx)
- **Charts**: Custom CSS-based visualizations

## Development

### Project Structure

```
├── src/                    # Frontend React application
│   ├── components/         # React components
│   ├── services/          # API service layer
│   └── ...
├── server/                # Backend Node.js server
│   └── index.js          # Main server file
├── uploads/              # Temporary file storage
└── ...
```

### Adding New Features

1. **New Query Types**: Extend the query processing logic in `server/index.js`
2. **Chart Types**: Add new visualization types in `ChartDisplay.tsx`
3. **File Formats**: Extend file processing in the upload endpoint
4. **AI Prompts**: Customize Gemini prompts for better responses

## Troubleshooting

### Common Issues

1. **Upload Fails**: Check file format and size limits
2. **AI Not Working**: Verify GEMINI_API_KEY is set correctly
3. **Server Won't Start**: Ensure port 3001 is available
4. **CORS Errors**: Make sure both frontend and backend are running

### Error Messages

- "No file uploaded": Select a valid Excel/CSV file
- "File not found": The uploaded file may have been processed incorrectly
- "Query failed": Check your internet connection and API key

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details