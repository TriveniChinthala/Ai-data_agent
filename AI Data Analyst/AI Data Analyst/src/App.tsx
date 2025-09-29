import React, { useState } from 'react';
import { apiService } from './services/api';
import { FileUpload } from './components/FileUpload';
import { DataPreview } from './components/DataPreview';
import { QueryInterface } from './components/QueryInterface';
import { ChartDisplay } from './components/ChartDisplay';
import { ProcessingStatus } from './components/ProcessingStatus';
import { Header } from './components/Header';
import { Database, MessageSquare, BarChart3 } from 'lucide-react';

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  uploadedAt: Date;
  processed: boolean;
  data?: any[];
  columns?: string[];
  columnTypes?: Record<string, string>;
  summary?: {
    rows: number;
    columns: number;
    dataQuality: 'excellent' | 'good' | 'fair' | 'poor';
    issues?: string[];
    completeness?: string;
  };
}

export interface QueryResult {
  id: string;
  query: string;
  answer: string;
  data?: any[];
  chartType?: 'bar' | 'line' | 'pie' | 'scatter';
  chartData?: any;
  timestamp: Date;
}

function App() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null);
  const [queryHistory, setQueryHistory] = useState<QueryResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleFileUpload = async (files: File[]) => {
    setError('');
    
    for (const file of files) {
      try {
        setIsProcessing(true);
        setProcessingStatus('Uploading file...');
        
        const response = await apiService.uploadFile(file);
        
        const uploadedFile: UploadedFile = {
          id: response.file.id,
          name: response.file.name,
          size: response.file.size,
          uploadedAt: new Date(response.file.uploadedAt),
          processed: response.file.processed,
          columns: response.file.columns,
          summary: response.file.summary,
        };
        
        setUploadedFiles(prev => [...prev, uploadedFile]);
        
        // Load full file data
        setProcessingStatus('Loading file data...');
        const fileData = await apiService.getFileData(response.file.id);
        
        const completeFile: UploadedFile = {
          ...uploadedFile,
          data: fileData.data,
          columnTypes: fileData.columnTypes,
          summary: fileData.summary,
        };
        
        setUploadedFiles(prev => 
          prev.map(f => f.id === response.file.id ? completeFile : f)
        );
        setSelectedFile(completeFile);
        
      } catch (error) {
        console.error('Upload error:', error);
        setError(error instanceof Error ? error.message : 'Upload failed');
      } finally {
        setIsProcessing(false);
        setProcessingStatus('');
      }
    }
  };

  const handleQuery = async (query: string) => {
    if (!selectedFile) return;

    setError('');
    setIsProcessing(true);
    setProcessingStatus('AI is analyzing your question...');
    
    try {
      const response = await apiService.queryData(selectedFile.id, query);
      
      const result: QueryResult = {
        id: response.result.id,
        query: response.result.query,
        answer: response.result.answer,
        data: response.result.data,
        chartType: response.result.chartType,
        chartData: response.result.chartData,
        timestamp: new Date(response.result.timestamp)
      };

      setQueryHistory(prev => [result, ...prev]);
    } catch (error) {
      console.error('Query error:', error);
      setError(error instanceof Error ? error.message : 'Query failed');
    } finally {
      setIsProcessing(false);
      setProcessingStatus('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}
        
        {uploadedFiles.length === 0 ? (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <Database className="mx-auto h-16 w-16 text-blue-600 mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                AI Data Agent
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Upload any Excel file and ask complex business questions in natural language. 
                Our AI analyzes your data and provides insights with interactive charts and tables.
              </p>
            </div>
            
            <FileUpload onFileUpload={handleFileUpload} />
            
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-white rounded-lg shadow-sm">
                <MessageSquare className="mx-auto h-12 w-12 text-blue-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Natural Language Queries</h3>
                <p className="text-gray-600">Ask questions like "What are our top selling products?" or "Show me quarterly trends"</p>
              </div>
              
              <div className="text-center p-6 bg-white rounded-lg shadow-sm">
                <BarChart3 className="mx-auto h-12 w-12 text-teal-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Visualizations</h3>
                <p className="text-gray-600">Automatically generates the best charts and graphs for your data insights</p>
              </div>
              
              <div className="text-center p-6 bg-white rounded-lg shadow-sm">
                <Database className="mx-auto h-12 w-12 text-orange-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Any Excel Format</h3>
                <p className="text-gray-600">Handles messy data, unnamed columns, and inconsistent formatting automatically</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <QueryInterface 
                onQuery={handleQuery}
                queryHistory={queryHistory}
                isProcessing={isProcessing}
                selectedFile={selectedFile}
                processingStatus={processingStatus}
              />
              
              {queryHistory.length > 0 && queryHistory[0].chartData && (
                <ChartDisplay 
                  chartType={queryHistory[0].chartType || 'bar'}
                  data={queryHistory[0].chartData}
                  title="Query Results"
                />
              )}
            </div>
            
            <div className="space-y-6">
              {isProcessing && (
                <ProcessingStatus status={processingStatus} />
              )}
              
              {selectedFile && (
                <DataPreview 
                  file={selectedFile}
                  onFileSelect={setSelectedFile}
                  allFiles={uploadedFiles}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;