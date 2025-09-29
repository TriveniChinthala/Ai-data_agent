const API_BASE_URL = 'http://localhost:3001/api';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface UploadResponse {
  file: {
    id: string;
    name: string;
    size: number;
    uploadedAt: string;
    processed: boolean;
    columns: string[];
    summary: {
      rows: number;
      columns: number;
      dataQuality: 'excellent' | 'good' | 'fair' | 'poor';
      issues: string[];
      completeness: string;
    };
  };
}

export interface FileData {
  id: string;
  name: string;
  size: number;
  uploadedAt: string;
  processed: boolean;
  data: any[];
  columns: string[];
  columnTypes: Record<string, string>;
  summary: {
    rows: number;
    columns: number;
    dataQuality: 'excellent' | 'good' | 'fair' | 'poor';
    issues: string[];
    completeness: string;
  };
}

export interface QueryResponse {
  result: {
    id: string;
    query: string;
    answer: string;
    data: any[];
    chartType: 'bar' | 'line' | 'pie' | 'scatter';
    chartData: any;
    timestamp: string;
  };
}

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  async uploadFile(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Upload failed');
    }

    return await response.json();
  }

  async getFileData(fileId: string): Promise<FileData> {
    const response = await this.request<{ file: FileData }>(`/files/${fileId}`);
    return response.file;
  }

  async queryData(fileId: string, query: string): Promise<QueryResponse> {
    return await this.request<QueryResponse>('/query', {
      method: 'POST',
      body: JSON.stringify({ fileId, query }),
    });
  }

  async healthCheck(): Promise<{ status: string; timestamp: string; aiEnabled: boolean }> {
    return await this.request<{ status: string; timestamp: string; aiEnabled: boolean }>('/health');
  }
}

export const apiService = {
  uploadFile: async (file: File) => { /* ... */ },
  getFileData: async (id: string) => { /* ... */ },
  queryData: async (id: string, query: string) => { /* ... */ },
};