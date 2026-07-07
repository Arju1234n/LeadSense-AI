import { CRMStatus } from '../constants/crmStatus';
import { DataSource } from '../constants/dataSource';

/**
 * CRM Lead Interface
 */
export interface CRMLead {
  created_at: Date;
  name: string;
  email?: string;
  country_code?: string;
  mobile_without_country_code?: string;
  company?: string;
  city?: string;
  state?: string;
  country?: string;
  lead_owner?: string;
  crm_status: CRMStatus;
  crm_note?: string;
  data_source: DataSource;
  possession_time?: Date;
  description?: string;
}

/**
 * Import Result Interface
 */
export interface ImportResult {
  success: boolean;
  totalRows: number;
  successfulRows: number;
  skippedRows: number;
  processingTime: number;
  importId: string;
  leads: CRMLead[];
  skippedRecords: SkippedRecord[];
  aiProvider?: string;
  batchCount?: number;
}

/**
 * Skipped Record Interface
 */
export interface SkippedRecord {
  row: number;
  reason: string;
  data: Record<string, any>;
}

/**
 * Import Summary Interface
 */
export interface ImportSummary {
  totalImports: number;
  totalLeads: number;
  totalSkipped: number;
  averageProcessingTime: number;
  lastImportDate?: Date;
}

/**
 * CRM Lead Validation Error
 */
export interface CRMValidationError {
  field: string;
  value: any;
  message: string;
}

/**
 * CRM Lead Validation Result
 */
export interface CRMValidationResult {
  isValid: boolean;
  errors: CRMValidationError[];
  warnings: string[];
}

/**
 * Normalized CRM Lead (before DB save)
 */
export interface NormalizedCRMLead extends CRMLead {
  _normalized: boolean;
  _validationErrors?: CRMValidationError[];
  _warnings?: string[];
}
