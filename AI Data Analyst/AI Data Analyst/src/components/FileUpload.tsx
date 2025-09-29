import React, { useCallback, useState } from 'react';
import { Upload, File, X, CheckCircle, AlertCircle } from 'lucide-react';

interface FileUploadProps {
  onFileUpload: (files: File[]) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.name.endsWith('.xlsx') || 
      file.name.endsWith('.xls') || 
      file.name.endsWith('.csv')
    );
    
    if (files.length > 0) {
      setUploadedFiles(files);
      onFileUpload(files);
    }
  }, [onFileUpload]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setUploadedFiles(files);
      onFileUpload(files);
    }
  }, [onFileUpload]);

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
          isDragOver 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50'
        }`}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
      >
        <input
          type="file"
          multiple
          accept=".xlsx,.xls,.csv"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="space-y-4">
          <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center ${
            isDragOver ? 'bg-blue-100' : 'bg-gray-100'
          }`}>
            <Upload className={`h-8 w-8 ${isDragOver ? 'text-blue-600' : 'text-gray-600'}`} />
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Drop your Excel files here
            </h3>
            <p className="text-gray-600 mb-4">
              or <span className="text-blue-600 font-medium">browse</span> to choose files
            </p>
            <p className="text-sm text-gray-500">
              Supports .xlsx, .xls, and .csv files up to 10MB
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-2 text-xs text-gray-500">
            <span className="flex items-center space-x-1">
              <CheckCircle className="h-3 w-3 text-green-500" />
              <span>Handles messy data</span>
            </span>
            <span className="flex items-center space-x-1">
              <CheckCircle className="h-3 w-3 text-green-500" />
              <span>Multiple sheets</span>
            </span>
            <span className="flex items-center space-x-1">
              <CheckCircle className="h-3 w-3 text-green-500" />
              <span>Auto-cleanup</span>
            </span>
          </div>
        </div>
      </div>

      {uploadedFiles.length > 0 && (
        <div className="mt-6 space-y-3">
          <h4 className="text-sm font-medium text-gray-900">Uploaded Files</h4>
          {uploadedFiles.map((file, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <File className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{file.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-xs font-medium">Ready</span>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};