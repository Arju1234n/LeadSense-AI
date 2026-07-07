import { Lead, ImportHistory, APIResponse, Pagination } from '../../../user-frontend/src/types';

export * from '../../../user-frontend/src/types';

export interface AdminStats {
  totalUsers: number;
  totalImports: number;
  totalLeads: number;
  successRate: number;
  skippedRate: number;
  processingTimeAvg: number;
  aiCostEstimates: number;
  activeUsers: number;
  pendingImports: number;
}

export interface RecentActivity {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  filename: string;
  totalRows: number;
  successfulRows: number;
  skippedRows: number;
  status: string;
  timestamp: string;
}

export interface AdminLeadSearchFilters {
  search?: string;
  status?: string;
  country?: string;
  dataSource?: string;
  startDate?: string;
  endDate?: string;
  userId?: string;
}

export interface UserStats {
  userId: string;
  name: string;
  email: string;
  role: string;
  totalImports: number;
  totalLeads: number;
  successRate: number;
  lastImportAt: string | null;
}
