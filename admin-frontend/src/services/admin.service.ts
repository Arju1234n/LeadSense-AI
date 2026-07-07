import { api } from './api';
import { APIResponse, AdminStats, ImportHistory, Lead, UserStats } from '../types';

export const adminService = {
  /**
   * Get overall admin panel stats (dashboard cards)
   */
  async getStats(): Promise<APIResponse<AdminStats>> {
    const response = await api.get<APIResponse<AdminStats>>('/admin/stats');
    return response.data;
  },

  /**
   * Get all imports from the system (with page, limit, filtering, search)
   */
  async getAllImports(
    page = 1,
    limit = 10,
    search = '',
    status = ''
  ): Promise<APIResponse<ImportHistory[]>> {
    const response = await api.get<APIResponse<ImportHistory[]>>('/admin/imports', {
      params: { page, limit, search, status },
    });
    return response.data;
  },

  /**
   * Search leads across the entire platform
   */
  async searchLeads(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    country?: string;
    dataSource?: string;
    startDate?: string;
    endDate?: string;
    userId?: string;
  }): Promise<APIResponse<Lead[]>> {
    const response = await api.get<APIResponse<Lead[]>>('/admin/leads', {
      params,
    });
    return response.data;
  },

  /**
   * Get a single lead by ID
   */
  async getLeadById(id: string): Promise<APIResponse<Lead>> {
    const response = await api.get<APIResponse<Lead>>(`/admin/leads/${id}`);
    return response.data;
  },

  /**
   * Delete a lead by ID
   */
  async deleteLead(id: string): Promise<APIResponse<{ success: boolean }>> {
    const response = await api.delete<APIResponse<{ success: boolean }>>(`/admin/leads/${id}`);
    return response.data;
  },

  /**
   * Get import metrics per user
   */
  async getUserStats(userId: string): Promise<APIResponse<UserStats>> {
    const response = await api.get<APIResponse<UserStats>>(`/admin/users/${userId}/stats`);
    return response.data;
  },

  /**
   * Get all platform users list
   */
  async getAllUsers(): Promise<APIResponse<any[]>> {
    const response = await api.get<APIResponse<any[]>>('/admin/users');
    return response.data;
  },

  /**
   * Get export leads download URL
   */
  getExportLeadsUrl(params: {
    search?: string;
    status?: string;
    country?: string;
    dataSource?: string;
    startDate?: string;
    endDate?: string;
  }): string {
    const query = new URLSearchParams(params as any).toString();
    return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/admin/leads/export?${query}`;
  },

  /**
   * Log in admin user
   */
  async login(credentials: any): Promise<APIResponse<{ token: string; user: any }>> {
    const response = await api.post<APIResponse<{ token: string; user: any }>>('/auth/login', credentials);
    return response.data;
  }
};
