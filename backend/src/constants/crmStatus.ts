/**
 * CRM Lead Status Constants — GrowEasy CRM
 * Spec-compliant values only. Do NOT change these.
 */
export const CRM_STATUS = {
  GOOD_LEAD_FOLLOW_UP: 'GOOD_LEAD_FOLLOW_UP',
  DID_NOT_CONNECT: 'DID_NOT_CONNECT',
  BAD_LEAD: 'BAD_LEAD',
  SALE_DONE: 'SALE_DONE',
} as const;

export type CRMStatus = (typeof CRM_STATUS)[keyof typeof CRM_STATUS];

export const CRM_STATUS_VALUES: CRMStatus[] = Object.values(CRM_STATUS);

/**
 * CRM Status Display Labels
 */
export const CRM_STATUS_LABELS: Record<CRMStatus, string> = {
  [CRM_STATUS.GOOD_LEAD_FOLLOW_UP]: 'Good Lead – Follow Up',
  [CRM_STATUS.DID_NOT_CONNECT]: 'Did Not Connect',
  [CRM_STATUS.BAD_LEAD]: 'Bad Lead',
  [CRM_STATUS.SALE_DONE]: 'Sale Done',
};

/**
 * CRM Status Colors (for UI badges)
 */
export const CRM_STATUS_COLORS: Record<CRMStatus, string> = {
  [CRM_STATUS.GOOD_LEAD_FOLLOW_UP]: '#10B981', // Emerald — hot lead
  [CRM_STATUS.DID_NOT_CONNECT]: '#F59E0B',     // Amber — pending
  [CRM_STATUS.BAD_LEAD]: '#EF4444',            // Red — dead
  [CRM_STATUS.SALE_DONE]: '#6366F1',           // Indigo — won
};

/**
 * CRM Status Tailwind badge classes (for UI)
 */
export const CRM_STATUS_BADGE: Record<CRMStatus, string> = {
  [CRM_STATUS.GOOD_LEAD_FOLLOW_UP]: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  [CRM_STATUS.DID_NOT_CONNECT]: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  [CRM_STATUS.BAD_LEAD]: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  [CRM_STATUS.SALE_DONE]: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
};

/**
 * Default CRM Status
 */
export const DEFAULT_CRM_STATUS: CRMStatus = CRM_STATUS.GOOD_LEAD_FOLLOW_UP;

/**
 * Validate CRM Status
 */
export const isValidCRMStatus = (status: string): status is CRMStatus => {
  return CRM_STATUS_VALUES.includes(status as CRMStatus);
};

/**
 * Normalize CRM Status — maps common AI output variations to the 4 allowed values
 */
export const normalizeCRMStatus = (status: string): CRMStatus => {
  if (!status) return DEFAULT_CRM_STATUS;

  const trimmed = status.trim();

  // Exact match (already correct)
  if (isValidCRMStatus(trimmed)) return trimmed as CRMStatus;

  // Case-insensitive match
  const upper = trimmed.toUpperCase().replace(/[\s-]/g, '_');
  if (isValidCRMStatus(upper)) return upper as CRMStatus;

  // Fuzzy mapping for AI output variations
  const lower = trimmed.toLowerCase();
  const statusMap: Record<string, CRMStatus> = {
    // GOOD_LEAD_FOLLOW_UP variants
    'good_lead_follow_up': CRM_STATUS.GOOD_LEAD_FOLLOW_UP,
    'good lead follow up': CRM_STATUS.GOOD_LEAD_FOLLOW_UP,
    'good lead': CRM_STATUS.GOOD_LEAD_FOLLOW_UP,
    'follow up': CRM_STATUS.GOOD_LEAD_FOLLOW_UP,
    'follow-up': CRM_STATUS.GOOD_LEAD_FOLLOW_UP,
    'hot': CRM_STATUS.GOOD_LEAD_FOLLOW_UP,
    'interested': CRM_STATUS.GOOD_LEAD_FOLLOW_UP,
    'qualified': CRM_STATUS.GOOD_LEAD_FOLLOW_UP,
    'new': CRM_STATUS.GOOD_LEAD_FOLLOW_UP,
    'contacted': CRM_STATUS.GOOD_LEAD_FOLLOW_UP,

    // DID_NOT_CONNECT variants
    'did_not_connect': CRM_STATUS.DID_NOT_CONNECT,
    'did not connect': CRM_STATUS.DID_NOT_CONNECT,
    'no connect': CRM_STATUS.DID_NOT_CONNECT,
    'no answer': CRM_STATUS.DID_NOT_CONNECT,
    'not reachable': CRM_STATUS.DID_NOT_CONNECT,
    'unreachable': CRM_STATUS.DID_NOT_CONNECT,
    'busy': CRM_STATUS.DID_NOT_CONNECT,
    'pending': CRM_STATUS.DID_NOT_CONNECT,

    // BAD_LEAD variants
    'bad_lead': CRM_STATUS.BAD_LEAD,
    'bad lead': CRM_STATUS.BAD_LEAD,
    'not interested': CRM_STATUS.BAD_LEAD,
    'not_interested': CRM_STATUS.BAD_LEAD,
    'lost': CRM_STATUS.BAD_LEAD,
    'rejected': CRM_STATUS.BAD_LEAD,
    'invalid': CRM_STATUS.BAD_LEAD,
    'junk': CRM_STATUS.BAD_LEAD,
    'dead': CRM_STATUS.BAD_LEAD,

    // SALE_DONE variants
    'sale_done': CRM_STATUS.SALE_DONE,
    'sale done': CRM_STATUS.SALE_DONE,
    'sold': CRM_STATUS.SALE_DONE,
    'won': CRM_STATUS.SALE_DONE,
    'closed': CRM_STATUS.SALE_DONE,
    'converted': CRM_STATUS.SALE_DONE,
    'deal closed': CRM_STATUS.SALE_DONE,
    'deal_closed': CRM_STATUS.SALE_DONE,
  };

  return statusMap[lower] ?? DEFAULT_CRM_STATUS;
};
