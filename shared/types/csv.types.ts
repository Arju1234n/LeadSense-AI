export interface CSVUploadResponse {
  fileId: string;
  fileName: string;
  fileSize: number;
  rowCount: number;
  headers: string[];
  preview: Record<string, any>[];
}

export interface CSVRow {
  [key: string]: any;
}

export interface ParsedCSV {
  headers: string[];
  rows: CSVRow[];
  rowCount: number;
}
