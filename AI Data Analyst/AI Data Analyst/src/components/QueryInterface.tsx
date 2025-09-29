import React, { useState } from 'react';
import { Send, MessageSquare, Brain, Clock } from 'lucide-react';
import type { UploadedFile, QueryResult } from '../App';
import ReactMarkdown from 'react-markdown';

interface QueryInterfaceProps {
  onQuery: (query: string) => void;
  queryHistory: QueryResult[];
  isProcessing: boolean;
  selectedFile: UploadedFile | null;
  processingStatus?: string;
}

export const QueryInterface: React.FC<QueryInterfaceProps> = ({
  onQuery,
  queryHistory,
  isProcessing,
  selectedFile,
  processingStatus
}) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isProcessing && selectedFile) {
      onQuery(query.trim());
      setQuery('');
    }
  };

  const suggestedQueries = [
    "What are the top 5 performing products by sales?",
    "Show me quarterly sales trends",
    "Which regions have the highest profit margins?",
    "Compare sales performance across categories",
    "What's the correlation between sales and profit?"
  ];

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg">
            <MessageSquare className="h-5 w-5 text-blue-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Ask Your Data Questions</h2>
          {selectedFile && (
            <span className="text-sm text-gray-500">
              • {selectedFile.name}
            </span>
          )}
        </div>

        <form onSubmit={handleSubmit} className="mb-6">
          <div className="relative">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={selectedFile ? "Ask anything about your data..." : "Upload a file first to start querying"}
              disabled={!selectedFile || isProcessing}
              rows={3}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:bg-gray-50 disabled:text-gray-500"
            />
            <button
              type="submit"
              disabled={!query.trim() || !selectedFile || isProcessing}
              className="absolute bottom-3 right-3 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </form>

        {selectedFile && queryHistory.length === 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Try asking:</h3>
            <div className="space-y-2">
              {suggestedQueries.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => setQuery(suggestion)}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {isProcessing && (
          <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg mb-6">
            <Brain className="h-5 w-5 text-blue-600 animate-pulse" />
            <div>
              <p className="text-sm font-medium text-blue-900">
                {processingStatus || 'AI is analyzing your question...'}
              </p>
              <p className="text-xs text-blue-700">This may take a few moments</p>
            </div>
          </div>
        )}

        {queryHistory.length > 0 && (
          <div className="space-y-6">
            <h3 className="text-sm font-medium text-gray-900 flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>Query History</span>
            </h3>
            
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {queryHistory.map((result) => (
                <div key={result.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="mb-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                          {result.query}
                        </p>
                      </div>
                      <span className="text-xs text-gray-500 ml-3 mt-2">
                        {formatTimestamp(result.timestamp)}
                      </span>
                    </div>
                    
                    <div className="mt-3 p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <Brain className="h-5 w-5 text-blue-600 mt-0.5" />
                        {/* <div>
                          <p className="text-sm text-blue-900 leading-relaxed">
                            {result.answer}
                          </p>
                        </div> */}
                        <div className="text-sm text-blue-900 leading-relaxed prose max-w-none">
                          <ReactMarkdown>{result.answer}</ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};