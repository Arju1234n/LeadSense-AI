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
  crm_status: 'new' | 'contacted' | 'qualified' | 'lost';
  crm_note?: string;
  data_source: string;
  possession_time?: Date;
  description?: string;
}

export interface ImportResult {
  success: boolean;
  totalRows: number;
  successfulRows: number;
  skippedRows: number;
  processingTime: number;
  importId: string;
  leads: CRMLead[];
  skippedRecords: SkippedRecord[];
}

export interface SkippedRecord {
  row: number;
  reason: string;
  data: Record<string, any>;
}

export interface ImportSummary {
  totalImports: number;
  totalLeads: number;
  totalSkipped: number;
  averageProcessingTime: number;
}
