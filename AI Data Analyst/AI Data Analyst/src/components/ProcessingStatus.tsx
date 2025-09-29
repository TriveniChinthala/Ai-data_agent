import React from 'react';
import { Brain, Loader2, CheckCircle } from 'lucide-react';

interface ProcessingStatusProps {
  status: string;
}

export const ProcessingStatus: React.FC<ProcessingStatusProps> = ({ status }) => {
  const isCompleted = status.includes('Ready');

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-3 mb-4">
        <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg">
          {isCompleted ? (
            <CheckCircle className="h-5 w-5 text-green-600" />
          ) : (
            <Brain className="h-5 w-5 text-blue-600" />
          )}
        </div>
        <h3 className="text-lg font-semibold text-gray-900">
          {isCompleted ? 'Processing Complete' : 'Processing Data'}
        </h3>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          {!isCompleted && (
            <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
          )}
          <p className={`text-sm font-medium ${
            isCompleted ? 'text-green-700' : 'text-blue-700'
          }`}>
            {status}
          </p>
        </div>

        {!isCompleted && (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }} />
          </div>
        )}

        <div className="text-xs text-gray-600 bg-gray-50 rounded-lg p-3">
          <p className="font-medium mb-2">AI Processing Features:</p>
          <ul className="space-y-1">
            <li>• Automatic data type detection</li>
            <li>• Missing value imputation</li>
            <li>• Column standardization</li>
            <li>• Relationship mapping</li>
          </ul>
        </div>
      </div>
    </div>
  );
};