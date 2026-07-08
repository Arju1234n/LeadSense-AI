import { api } from './api';
import type {
  APIResponse,
  CSVPreviewResponse,
  ImportResultResponse,
  ImportStatusResponse,
  ImportHistory,
  Pagination,
} from '@/types';

/**
 * CSV Import Service
 */
export const importService = {
  /**
   * Upload CSV file
   */
  async uploadCSV(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<APIResponse<CSVPreviewResponse>> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.upload<APIResponse<CSVPreviewResponse>>(
      '/csv/upload',
      formData,
      onProgress
    );
    return response.data;
  },

  /**
   * Get CSV row count
   */
  async getRowCount(importId: string): Promise<APIResponse<{ count: number }>> {
    const response = await api.get<APIResponse<{ count: number }>>(`/csv/count/${importId}`);
    return response.data;
  },

  /**
   * Process import
   */
  async processImport(importId: string): Promise<APIResponse<ImportResultResponse>> {
    const response = await api.post<APIResponse<ImportResultResponse>>(`/import/${importId}`);
    return response.data;
  },

  /**
   * Get import status
   */
  async getImportStatus(importId: string): Promise<APIResponse<ImportStatusResponse>> {
    const response = await api.get<APIResponse<ImportStatusResponse>>(
      `/import/${importId}/status`
    );
    return response.data;
  },

  /**
   * Get import results
   */
  async getImportResults(
    importId: string,
    page = 1,
    limit = 50
  ): Promise<APIResponse<{ import: ImportHistory; leads: any[] }>> {
    const response = await api.get<APIResponse<{ import: ImportHistory; leads: any[] }>>(
      `/import/${importId}/results`,
      {
        params: { page, limit },
      }
    );
    return response.data;
  },

  /**
   * Get import history
   */
  async getImportHistory(
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder: 'asc' | 'desc' = 'desc'
  ): Promise<APIResponse<ImportHistory[]>> {
    const response = await api.get<APIResponse<ImportHistory[]>>('/import/history', {
      params: { page, limit, sortBy, sortOrder },
    });
    return response.data;
  },

  /**
   * Login user
   */
  async login(credentials: any): Promise<APIResponse<{ token: string; user: any }>> {
    const response = await api.post<APIResponse<{ token: string; user: any }>>('/auth/login', credentials);
    return response.data;
  },

  /**
   * Register user
   */
  async register(data: any): Promise<APIResponse<{ user: any }>> {
    const response = await api.post<APIResponse<{ user: any }>>('/auth/register', data);
    return response.data;
  },
};
