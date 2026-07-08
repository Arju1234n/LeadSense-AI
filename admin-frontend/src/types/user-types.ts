/**
 * CRM Status Types
 */
export const CRM_STATUSES = {
  NEW: 'new',
  CONTACTED: 'contacted',
  QUALIFIED: 'qualified',
  PROPOSAL: 'proposal',
  NEGOTIATION: 'negotiation',
  WON: 'won',
  LOST: 'lost',
  NURTURING: 'nurturing',
} as const;

export type CRMStatus = typeof CRM_STATUSES[keyof typeof CRM_STATUSES];

/**
 * Data Source Types
 */
export const DATA_SOURCES = {
  CSV_IMPORT: 'csv_import',
  MANUAL_ENTRY: 'manual_entry',
  WEB_FORM: 'web_form',
  API: 'api',
  REFERRAL: 'referral',
} as const;

export type DataSource = typeof DATA_SOURCES[keyof typeof DATA_SOURCES];

/**
 * Lead Interface
 */
export interface Lead {
  _id: string;
  created_at: Date | string;
  name: string;
  email?: string;
  country_code?: string;
  mobile_without_country_code?: string;
  company?: string;
  city?: string;
  state?: string;
  country?: string;
  lead_owner?: string;
  crm_status: string;
  crm_note?: string;
  data_source?: string;
  possession_time?: string;
  description?: string;
  userId: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

/**
 * Import Status Types
 */
export const IMPORT_STATUSES = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;

export type ImportStatus = typeof IMPORT_STATUSES[keyof typeof IMPORT_STATUSES];

/**
 * Import History Interface
 */
export interface ImportHistory {
  _id: string;
  userId: string;
  filename: string;
  filepath: string;
  filesize: number;
  totalRows: number;
  successfulRows: number;
  skippedRows: number;
  status: ImportStatus;
  errorMessage?: string;
  aiProvider: string;
  /** processingTime in ms — matches backend field name */
  processingTime: number;
  batchCount: number;
  skippedRecords: SkippedRecord[];
  startedAt: Date | string;
  completedAt?: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

/**
 * Skipped Record Interface
 */
export interface SkippedRecord {
  row: number;
  data: Record<string, any>;
  reason: string;
}

/**
 * CSV Validation Result
 */
export interface CSVValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * CSV Preview Response
 */
export interface CSVPreviewResponse {
  importId: string;
  filename: string;
  filesize: number;
  totalRows: number;
  headers: string[];
  preview: Record<string, any>[];
  validation: CSVValidation;
  compatibility: {
    compatible: boolean;
    suggestions: string[];
  };
  columnStats: {
    [key: string]: {
      fillRate: number;
      uniqueCount: number;
      sampleValues: any[];
      dataType: string;
    };
  };
}

/**
 * Import Result Response
 */
export interface ImportResultResponse {
  importId: string;
  totalRows: number;
  successfulRows: number;
  skippedRows: number;
  processingTime: number;
  aiProvider: string;
  batchCount: number;
  skippedRecords: SkippedRecord[];
}

/**
 * Import Status Response
 */
export interface ImportStatusResponse {
  importId: string;
  status: ImportStatus;
  filename: string;
  totalRows: number;
  successfulRows: number;
  skippedRows: number;
  processingTime: number;
  startedAt: string;
  completedAt?: string;
  errorMessage?: string;
}

/**
 * Pagination Interface
 */
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

/**
 * API Response Interface
 */
export interface APIResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  pagination?: Pagination;
}
