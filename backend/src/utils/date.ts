import { parse, isValid, parseISO, format } from 'date-fns';

/**
 * Common date formats to try parsing
 */
const DATE_FORMATS = [
  // ISO formats
  "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
  "yyyy-MM-dd'T'HH:mm:ssxxx",
  "yyyy-MM-dd'T'HH:mm:ss",
  'yyyy-MM-dd',

  // Common US formats
  'MM/dd/yyyy',
  'MM-dd-yyyy',
  'MM.dd.yyyy',
  'M/d/yyyy',
  'M-d-yyyy',

  // European formats
  'dd/MM/yyyy',
  'dd-MM-yyyy',
  'dd.MM.yyyy',
  'd/M/yyyy',
  'd-M-yyyy',

  // Other formats
  'yyyy/MM/dd',
  'dd MMM yyyy',
  'd MMM yyyy',
  'MMM dd, yyyy',
  'MMMM dd, yyyy',

  // With time
  'MM/dd/yyyy HH:mm:ss',
  'dd/MM/yyyy HH:mm:ss',
  'yyyy-MM-dd HH:mm:ss',
  'MM/dd/yyyy hh:mm:ss a',
  'dd/MM/yyyy hh:mm:ss a',
];

/**
 * Parse date from various string formats
 */
export const parseDate = (dateInput: any): Date | null => {
  if (!dateInput) {
    return null;
  }

  // If already a Date object
  if (dateInput instanceof Date) {
    return isValid(dateInput) ? dateInput : null;
  }

  // Convert to string
  const dateStr = String(dateInput).trim();

  if (!dateStr) {
    return null;
  }

  // Try parsing as ISO date first
  try {
    const isoDate = parseISO(dateStr);
    if (isValid(isoDate)) {
      return isoDate;
    }
  } catch {
    // Continue to other formats
  }

  // Try parsing with predefined formats
  for (const dateFormat of DATE_FORMATS) {
    try {
      const parsedDate = parse(dateStr, dateFormat, new Date());
      if (isValid(parsedDate)) {
        return parsedDate;
      }
    } catch {
      // Continue to next format
    }
  }

  // Try parsing as timestamp (milliseconds)
  const timestamp = Number(dateStr);
  if (!isNaN(timestamp)) {
    const date = new Date(timestamp);
    if (isValid(date)) {
      return date;
    }
  }

  return null;
};

/**
 * Validate if a string can be parsed as a date
 */
export const isValidDateString = (dateStr: string): boolean => {
  return parseDate(dateStr) !== null;
};

/**
 * Format date to ISO string
 */
export const formatToISO = (date: Date): string => {
  if (!isValid(date)) {
    throw new Error('Invalid date provided');
  }
  return date.toISOString();
};

/**
 * Format date to custom format
 */
export const formatDate = (date: Date, formatStr: string = 'yyyy-MM-dd'): string => {
  if (!isValid(date)) {
    throw new Error('Invalid date provided');
  }
  return format(date, formatStr);
};

/**
 * Get current timestamp
 */
export const getCurrentTimestamp = (): Date => {
  return new Date();
};

/**
 * Check if date is in the future
 */
export const isFutureDate = (date: Date): boolean => {
  return isValid(date) && date > new Date();
};

/**
 * Check if date is in the past
 */
export const isPastDate = (date: Date): boolean => {
  return isValid(date) && date < new Date();
};

/**
 * Normalize date to start of day (00:00:00)
 */
export const normalizeToStartOfDay = (date: Date): Date => {
  if (!isValid(date)) {
    throw new Error('Invalid date provided');
  }
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
};
