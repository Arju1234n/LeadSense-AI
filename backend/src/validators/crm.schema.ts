import { z } from 'zod';
import { CRM_STATUS_VALUES } from '../constants/crmStatus';
import { DATA_SOURCE_VALUES } from '../constants/dataSource';

/**
 * CRM Lead Validation Schema
 */
export const crmLeadSchema = z.object({
  created_at: z.date(),
  name: z.string().min(1, 'Name is required').max(255, 'Name is too long'),
  email: z
    .string()
    .email('Invalid email format')
    .toLowerCase()
    .optional()
    .or(z.literal('')),
  country_code: z.string().max(10).optional().or(z.literal('')),
  mobile_without_country_code: z.string().max(20).optional().or(z.literal('')),
  company: z.string().max(255).optional().or(z.literal('')),
  city: z.string().max(100).optional().or(z.literal('')),
  state: z.string().max(100).optional().or(z.literal('')),
  country: z.string().max(100).optional().or(z.literal('')),
  lead_owner: z.string().max(255).optional().or(z.literal('')),
  crm_status: z.enum(CRM_STATUS_VALUES as [string, ...string[]]),
  crm_note: z.string().max(1000).optional().or(z.literal('')),
  data_source: z.enum(DATA_SOURCE_VALUES as [string, ...string[]]),
  possession_time: z.date().optional(),
  description: z.string().max(2000).optional().or(z.literal('')),
}).refine(
  (data) => data.email || data.mobile_without_country_code,
  {
    message: 'Either email or mobile number must be provided',
    path: ['email'],
  }
);

/**
 * Import Request Schema
 */
export const importRequestSchema = z.object({
  filename: z.string().min(1, 'Filename is required'),
  batchSize: z.number().min(1).max(100).optional(),
});

/**
 * CSV Upload Schema
 */
export const csvUploadSchema = z.object({
  file: z.object({
    filename: z.string(),
    mimetype: z.string().refine((type) => type === 'text/csv', {
      message: 'Only CSV files are allowed',
    }),
    size: z.number().max(10 * 1024 * 1024, 'File size must not exceed 10MB'),
  }),
});

/**
 * Validate CRM Lead
 */
export const validateCRMLead = (data: any) => {
  return crmLeadSchema.safeParse(data);
};

/**
 * Validate Import Request
 */
export const validateImportRequest = (data: any) => {
  return importRequestSchema.safeParse(data);
};

/**
 * Batch validation helper
 */
export const validateBatch = (leads: any[]) => {
  const results = leads.map((lead, index) => ({
    index,
    result: validateCRMLead(lead),
  }));

  const valid = results.filter((r) => r.result.success);
  const invalid = results.filter((r) => !r.result.success);

  return {
    valid: valid.map((v) => v.result.data),
    invalid: invalid.map((i) => ({
      index: i.index,
      errors: i.result.error?.errors || [],
    })),
  };
};
