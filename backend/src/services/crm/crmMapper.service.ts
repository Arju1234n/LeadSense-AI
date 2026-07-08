import { CRMLead, NormalizedCRMLead } from '../../types/crm';
import { parsePhone } from '../../utils/phone';
import { normalizeEmail } from '../../utils/email';
import { parseDate } from '../../utils/date';
import { normalizeCountry } from '../../utils/country';
import { normalizeCRMStatus, DEFAULT_CRM_STATUS } from '../../constants/crmStatus';
import { normalizeDataSource, DEFAULT_DATA_SOURCE } from '../../constants/dataSource';
import { logger } from '../../utils/logger';

/**
 * Map and normalize CRM lead data
 */
export const mapCRMLead = (rawLead: any): NormalizedCRMLead => {
  const normalized: Partial<NormalizedCRMLead> = {
    _normalized: true,
    _validationErrors: [],
    _warnings: [],
  };

  // Map created_at
  if (rawLead.created_at) {
    const date = parseDate(rawLead.created_at);
    if (date) {
      normalized.created_at = date;
    } else {
      normalized._warnings?.push('Invalid created_at date, using current date');
      normalized.created_at = new Date();
    }
  } else {
    normalized.created_at = new Date();
  }

  // Map name (required)
  if (rawLead.name && typeof rawLead.name === 'string') {
    normalized.name = rawLead.name.trim();
  } else {
    normalized._validationErrors?.push({
      field: 'name',
      value: rawLead.name,
      message: 'Name is required',
    });
    normalized.name = 'Unknown';
  }

  // Map and normalize email
  if (rawLead.email) {
    const email = normalizeEmail(rawLead.email);
    if (email) {
      normalized.email = email;
    } else {
      normalized._warnings?.push('Invalid email format');
    }
  }

  // Map and parse phone
  if (rawLead.mobile_without_country_code || rawLead.country_code) {
    // If already split
    if (rawLead.country_code) {
      normalized.country_code = String(rawLead.country_code).replace(/\+/g, '');
    }
    if (rawLead.mobile_without_country_code) {
      normalized.mobile_without_country_code = String(
        rawLead.mobile_without_country_code
      ).replace(/\D/g, '');
    }
  } else if (rawLead.phone || rawLead.mobile) {
    // Try to parse combined phone number
    const phoneStr = rawLead.phone || rawLead.mobile;
    const parsed = parsePhone(phoneStr, rawLead.country);
    
    if (parsed && parsed.isValid) {
      normalized.country_code = parsed.countryCode;
      normalized.mobile_without_country_code = parsed.mobileWithoutCountryCode;
    } else {
      normalized._warnings?.push('Could not parse phone number');
    }
  }

  // Map company
  if (rawLead.company) {
    normalized.company = String(rawLead.company).trim();
  }

  // Map city
  if (rawLead.city) {
    normalized.city = String(rawLead.city).trim();
  }

  // Map state
  if (rawLead.state) {
    normalized.state = String(rawLead.state).trim();
  }

  // Map and normalize country
  if (rawLead.country) {
    const country = normalizeCountry(rawLead.country);
    if (country) {
      normalized.country = country;
    } else {
      normalized.country = String(rawLead.country).trim();
    }
  }

  // Map lead_owner
  if (rawLead.lead_owner) {
    normalized.lead_owner = String(rawLead.lead_owner).trim();
  }

  // Map and normalize crm_status
  if (rawLead.crm_status) {
    const status = normalizeCRMStatus(rawLead.crm_status);
    if (status) {
      normalized.crm_status = status;
    } else {
      normalized._warnings?.push('Invalid CRM status, using default');
      normalized.crm_status = DEFAULT_CRM_STATUS;
    }
  } else {
    normalized.crm_status = DEFAULT_CRM_STATUS;
  }

  // Map crm_note
  if (rawLead.crm_note) {
    normalized.crm_note = String(rawLead.crm_note).trim();
  }

  // Map and normalize data_source
  if (rawLead.data_source) {
    normalized.data_source = normalizeDataSource(rawLead.data_source);
  } else {
    normalized.data_source = DEFAULT_DATA_SOURCE;
  }

  // Map possession_time
  if (rawLead.possession_time) {
    const date = parseDate(rawLead.possession_time);
    if (date) {
      normalized.possession_time = date;
    } else {
      normalized._warnings?.push('Invalid possession_time date');
    }
  }

  // Map description
  if (rawLead.description) {
    normalized.description = String(rawLead.description).trim();
  }

  logger.debug('Lead mapped and normalized', {
    name: normalized.name,
    hasEmail: !!normalized.email,
    hasPhone: !!normalized.mobile_without_country_code,
    warnings: normalized._warnings?.length || 0,
    errors: normalized._validationErrors?.length || 0,
  });

  return normalized as NormalizedCRMLead;
};

/**
 * Batch map CRM leads
 */
export const mapCRMLeads = (rawLeads: any[]): NormalizedCRMLead[] => {
  logger.info('Mapping CRM leads', { count: rawLeads.length });

  const mapped = rawLeads.map((lead, index) => {
    try {
      return mapCRMLead(lead);
    } catch (error) {
      logger.error(`Failed to map lead at index ${index}:`, error);
      throw error;
    }
  });

  const withWarnings = mapped.filter(
    (lead) => lead._warnings && lead._warnings.length > 0
  );
  const withErrors = mapped.filter(
    (lead) => lead._validationErrors && lead._validationErrors.length > 0
  );

  logger.info('Lead mapping completed', {
    total: mapped.length,
    withWarnings: withWarnings.length,
    withErrors: withErrors.length,
  });

  return mapped;
};
