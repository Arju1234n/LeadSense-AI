/**
 * CSV Upload Result
 */
export interface CSVUploadResult {
  success: boolean;
  filename: string;
  filepath: string;
  filesize: number;
  uploadedAt: Date;
  previewData?: CSVPreviewData;
}

/**
 * CSV Preview Data
 */
export interface CSVPreviewData {
  headers: string[];
  rows: Record<string, any>[];
  totalRows: number;
  previewRows: number;
}

/**
 * CSV Parse Result
 */
export interface CSVParseResult {
  success: boolean;
  data: Record<string, any>[];
  headers: string[];
  totalRows: number;
  errors: CSVParseError[];
}

/**
 * CSV Parse Error
 */
export interface CSVParseError {
  row: number;
  message: string;
  data?: any;
}

/**
 * CSV Validation Result
 */
export interface CSVValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  rowCount: number;
  columnCount: number;
  headers: string[];
}

/**
 * CSV Import Options
 */
export interface CSVImportOptions {
  skipEmptyRows?: boolean;
  trimValues?: boolean;
  encoding?: string;
  delimiter?: string;
  batchSize?: number;
}

/**
 * Batch Processing Options
 */
export interface BatchProcessingOptions {
  batchSize: number;
  maxRetries: number;
  retryDelay: number;
  onBatchComplete?: (batchNumber: number, totalBatches: number) => void;
  onBatchError?: (batchNumber: number, error: Error) => void;
}

/**
 * Batch Processing Result
 */
export interface BatchProcessingResult<T> {
  success: boolean;
  totalBatches: number;
  processedBatches: number;
  failedBatches: number;
  results: T[];
  errors: BatchProcessingError[];
}

/**
 * Batch Processing Error
 */
export interface BatchProcessingError {
  batchNumber: number;
  error: string;
  data?: any;
}
