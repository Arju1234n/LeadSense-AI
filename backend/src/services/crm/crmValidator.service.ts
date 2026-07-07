import { NormalizedCRMLead, CRMValidationResult, CRMValidationError } from '../../types/crm';
import { validateEmail } from '../../utils/email';
import { validatePhone } from '../../utils/phone';
import { isValidCRMStatus } from '../../constants/crmStatus';
import { isValidDataSource } from '../../constants/dataSource';
import { logger } from '../../utils/logger';

/**
 * Validate a single CRM lead
 */
export const validateCRMLead = (lead: NormalizedCRMLead): CRMValidationResult => {
  const errors: CRMValidationError[] = [];
  const warnings: string[] = [];

  // Validate required fields
  if (!lead.name || lead.name.trim() === '') {
    errors.push({
      field: 'name',
      value: lead.name,
      message: 'Name is required',
    });
  }

  // Validate email OR mobile is present
  const hasEmail = lead.email && lead.email.trim() !== '';
  const hasMobile = lead.mobile_without_country_code && lead.mobile_without_country_code.trim() !== '';

  if (!hasEmail && !hasMobile) {
    errors.push({
      field: 'email',
      value: null,
      message: 'Either email or mobile number is required',
    });
  }

  // Validate email format
  if (hasEmail && !validateEmail(lead.email!)) {
    errors.push({
      field: 'email',
      value: lead.email,
      message: 'Invalid email format',
    });
  }

  // Validate phone format
  if (hasMobile) {
    const fullPhone = `+${lead.country_code || ''}${lead.mobile_without_country_code}`;
    if (!validatePhone(fullPhone)) {
      warnings.push('Phone number may be invalid');
    }
  }

  // Validate crm_status
  if (!lead.crm_status || !isValidCRMStatus(lead.crm_status)) {
    errors.push({
      field: 'crm_status',
      value: lead.crm_status,
      message: 'Invalid CRM status',
    });
  }

  // Validate data_source
  if (!lead.data_source || !isValidDataSource(lead.data_source)) {
    errors.push({
      field: 'data_source',
      value: lead.data_source,
      message: 'Invalid data source',
    });
  }

  // Validate created_at
  if (!lead.created_at || !(lead.created_at instanceof Date) || isNaN(lead.created_at.getTime())) {
    errors.push({
      field: 'created_at',
      value: lead.created_at,
      message: 'Invalid created_at date',
    });
  }

  // Validate possession_time if present
  if (lead.possession_time && (!(lead.possession_time instanceof Date) || isNaN(lead.possession_time.getTime()))) {
    warnings.push('Invalid possession_time date');
  }

  // Warn if no contact information
  if (!hasEmail && !hasMobile) {
    warnings.push('Lead has no contact information');
  }

  // Warn if name seems invalid
  if (lead.name && lead.name.length < 2) {
    warnings.push('Name seems too short');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

/**
 * Batch validate CRM leads
 */
export const validateCRMLeads = (
  leads: NormalizedCRMLead[]
): {
  valid: NormalizedCRMLead[];
  invalid: Array<{ lead: NormalizedCRMLead; validation: CRMValidationResult }>;
} => {
  logger.info('Validating CRM leads', { count: leads.length });

  const valid: NormalizedCRMLead[] = [];
  const invalid: Array<{ lead: NormalizedCRMLead; validation: CRMValidationResult }> = [];

  leads.forEach((lead) => {
    const validation = validateCRMLead(lead);

    if (validation.isValid) {
      valid.push(lead);
    } else {
      invalid.push({ lead, validation });
    }
  });

  logger.info('CRM validation completed', {
    total: leads.length,
    valid: valid.length,
    invalid: invalid.length,
  });

  return { valid, invalid };
};

/**
 * Filter leads that can be saved (have at least email or mobile)
 */
export const filterSaveableLeads = (
  leads: NormalizedCRMLead[]
): {
  saveable: NormalizedCRMLead[];
  unsaveable: NormalizedCRMLead[];
} => {
  const saveable: NormalizedCRMLead[] = [];
  const unsaveable: NormalizedCRMLead[] = [];

  leads.forEach((lead) => {
    const hasEmail = lead.email && lead.email.trim() !== '';
    const hasMobile = lead.mobile_without_country_code && lead.mobile_without_country_code.trim() !== '';

    if (hasEmail || hasMobile) {
      saveable.push(lead);
    } else {
      unsaveable.push(lead);
    }
  });

  logger.info('Filtered saveable leads', {
    total: leads.length,
    saveable: saveable.length,
    unsaveable: unsaveable.length,
  });

  return { saveable, unsaveable };
};
