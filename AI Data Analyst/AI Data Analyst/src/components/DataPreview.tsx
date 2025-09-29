import React from 'react';
import { Database, FileText, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import type { UploadedFile } from '../App';

interface DataPreviewProps {
  file: UploadedFile;
  onFileSelect: (file: UploadedFile) => void;
  allFiles: UploadedFile[];
}

export const DataPreview: React.FC<DataPreviewProps> = ({ 
  file, 
  onFileSelect, 
  allFiles 
}) => {
  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'fair': return 'text-yellow-600 bg-yellow-100';
      case 'poor': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {allFiles.length > 1 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Files</span>
          </h3>
          
          <div className="space-y-2">
            {allFiles.map((f) => (
              <button
                key={f.id}
                onClick={() => onFileSelect(f)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  f.id === file.id 
                    ? 'bg-blue-50 border border-blue-200' 
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {f.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(f.size)}
                    </p>
                  </div>
                  {f.processed ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <Database className="h-5 w-5" />
          <span>Data Overview</span>
        </h3>

        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">File Information</h4>
            <div className="bg-gray-50 rounded-lg p-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Name:</span>
                <span className="font-medium text-gray-900">{file.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Size:</span>
                <span className="font-medium text-gray-900">{formatFileSize(file.size)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Uploaded:</span>
                <span className="font-medium text-gray-900">
                  {file.uploadedAt.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {file.processed && file.summary && (
            <>
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Data Summary</h4>
                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Rows:</span>
                    <span className="font-medium text-gray-900">
                      {file.summary.rows.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Columns:</span>
                    <span className="font-medium text-gray-900">{file.summary.columns}</span>
                  </div>
                  {file.summary.completeness && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Completeness:</span>
                      <span className="font-medium text-gray-900">{file.summary.completeness}%</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm items-center">
                    <span className="text-gray-600">Data Quality:</span>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getQualityColor(file.summary.dataQuality)}`}>
                      {file.summary.dataQuality}
                    </span>
                  </div>
                </div>
              </div>

              {file.columns && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Columns Detected</h4>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex flex-wrap gap-2">
                      {file.columns.map((column, index) => (
                        <div
                          key={index}
                          className="inline-flex flex-col items-start px-2.5 py-1.5 rounded-lg text-xs bg-blue-50 border border-blue-200"
                        >
                          <span className="font-medium text-blue-900">{column}</span>
                          {file.columnTypes && file.columnTypes[column] && (
                            <span className="text-blue-600 text-xs">
                              {file.columnTypes[column]}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {file.summary.issues && file.summary.issues.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center space-x-2">
                    <Info className="h-4 w-4 text-blue-600" />
                    <span>Data Processing Notes</span>
                  </h4>
                  <div className="bg-blue-50 rounded-lg p-3">
                    <ul className="space-y-1">
                      {file.summary.issues.map((issue, index) => (
                        <li key={index} className="text-sm text-blue-800 flex items-start space-x-2">
                          <span className="text-blue-600 mt-0.5">•</span>
                          <span>{issue}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </>
          )}

          {!file.processed && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">Processing...</p>
                  <p className="text-xs text-yellow-700">
                    Your file is being analyzed and prepared for queries.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {file.processed && file.data && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Preview</h3>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {file.columns?.map((column, index) => (
                    <th
                      key={index}
                      className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {file.data.slice(0, 5).map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    {file.columns?.map((column, colIndex) => (
                      <td
                        key={colIndex}
                        className="px-3 py-2 text-sm text-gray-900"
                      >
                        {typeof row[column] === 'number' 
                          ? row[column].toLocaleString() 
                          : row[column]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <p className="text-xs text-gray-500 mt-3">
            Showing first 5 rows of {file.summary?.rows.toLocaleString()} total rows
          </p>
        </div>
      )}
    </div>
  );
};