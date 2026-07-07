import { NormalizedCRMLead } from '../../types/crm';
import { normalizeEmail, validateEmail } from '../../utils/email';
import { validatePhone } from '../../utils/phone';
import { logger } from '../../utils/logger';

/**
 * Normalize CRM lead (additional normalization after mapping)
 */
export const normalizeLead = (lead: NormalizedCRMLead): NormalizedCRMLead => {
  const normalized = { ...lead };

  // Normalize email
  if (normalized.email) {
    normalized.email = normalizeEmail(normalized.email);
  }

  // Normalize phone
  if (normalized.country_code) {
    normalized.country_code = normalized.country_code.replace(/^\+/, '');
  }

  if (normalized.mobile_without_country_code) {
    normalized.mobile_without_country_code =
      normalized.mobile_without_country_code.replace(/\D/g, '');
  }

  // Normalize text fields (trim, title case for names)
  if (normalized.name) {
    normalized.name = normalizeNameCase(normalized.name);
  }

  if (normalized.city) {
    normalized.city = normalizeCityCase(normalized.city);
  }

  if (normalized.state) {
    normalized.state = normalizeStateCase(normalized.state);
  }

  if (normalized.company) {
    normalized.company = normalized.company.trim();
  }

  // Truncate long fields
  if (normalized.crm_note && normalized.crm_note.length > 1000) {
    normalized.crm_note = normalized.crm_note.substring(0, 997) + '...';
    normalized._warnings?.push('CRM note truncated to 1000 characters');
  }

  if (normalized.description && normalized.description.length > 2000) {
    normalized.description = normalized.description.substring(0, 1997) + '...';
    normalized._warnings?.push('Description truncated to 2000 characters');
  }

  return normalized;
};

/**
 * Normalize name to title case
 */
const normalizeNameCase = (name: string): string => {
  return name
    .trim()
    .split(' ')
    .map((word) => {
      if (word.length === 0) return word;
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
};

/**
 * Normalize city to title case
 */
const normalizeCityCase = (city: string): string => {
  return normalizeNameCase(city);
};

/**
 * Normalize state (uppercase abbreviations, title case full names)
 */
const normalizeStateCase = (state: string): string => {
  const trimmed = state.trim();
  // If 2-3 characters, assume abbreviation
  if (trimmed.length <= 3) {
    return trimmed.toUpperCase();
  }
  return normalizeNameCase(trimmed);
};

/**
 * Batch normalize leads
 */
export const normalizeLeads = (
  leads: NormalizedCRMLead[]
): NormalizedCRMLead[] => {
  logger.info('Normalizing leads', { count: leads.length });

  const normalized = leads.map((lead) => normalizeLead(lead));

  logger.info('Lead normalization completed', {
    total: normalized.length,
  });

  return normalized;
};

/**
 * Remove duplicate leads based on email or phone
 */
export const deduplicateLeads = (
  leads: NormalizedCRMLead[]
): {
  unique: NormalizedCRMLead[];
  duplicates: NormalizedCRMLead[];
} => {
  const seen = new Map<string, NormalizedCRMLead>();
  const duplicates: NormalizedCRMLead[] = [];

  leads.forEach((lead) => {
    // Create a unique key based on email or phone
    let key: string | null = null;

    if (lead.email) {
      key = `email:${lead.email.toLowerCase()}`;
    } else if (lead.mobile_without_country_code) {
      key = `phone:${lead.country_code || ''}${lead.mobile_without_country_code}`;
    }

    if (key) {
      if (seen.has(key)) {
        duplicates.push(lead);
      } else {
        seen.set(key, lead);
      }
    } else {
      // No valid key, keep the lead
      const tempKey = `unknown:${Math.random()}`;
      seen.set(tempKey, lead);
    }
  });

  const unique = Array.from(seen.values());

  logger.info('Deduplication completed', {
    total: leads.length,
    unique: unique.length,
    duplicates: duplicates.length,
  });

  return { unique, duplicates };
};

/**
 * Clean and prepare leads for database insertion
 */
export const prepareLeadsForDB = (
  leads: NormalizedCRMLead[]
): Partial<NormalizedCRMLead>[] => {
  return leads.map((lead) => {
    // Remove internal fields
    const { _normalized, _validationErrors, _warnings, ...cleanLead } = lead;
    
    // Remove undefined fields
    Object.keys(cleanLead).forEach((key) => {
      if (cleanLead[key as keyof typeof cleanLead] === undefined) {
        delete cleanLead[key as keyof typeof cleanLead];
      }
    });

    return cleanLead;
  });
};
