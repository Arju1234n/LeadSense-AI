import { logger } from '../../utils/logger';
import { CSVValidationResult, CSVParseResult } from '../../types/csv';

/**
 * Validate CSV structure and content
 */
export const validateCSV = (
  parseResult: CSVParseResult
): CSVValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check if parsing was successful (demote parse errors to warnings if data was extracted)
  if (!parseResult.success) {
    parseResult.errors.forEach((error) => {
      warnings.push(`Row ${error.row}: ${error.message}`);
    });
  }

  // Check if data exists
  if (!parseResult.data || parseResult.data.length === 0) {
    errors.push('CSV file is empty or contains no data rows');
    return {
      isValid: false,
      errors,
      warnings,
      rowCount: 0,
      columnCount: 0,
      headers: [],
    };
  }

  // Check headers
  if (!parseResult.headers || parseResult.headers.length === 0) {
    errors.push('CSV file has no headers');
    return {
      isValid: false,
      errors,
      warnings,
      rowCount: parseResult.data.length,
      columnCount: 0,
      headers: [],
    };
  }

  // Check for duplicate headers
  const duplicateHeaders = findDuplicates(parseResult.headers);
  if (duplicateHeaders.length > 0) {
    errors.push(`Duplicate headers found: ${duplicateHeaders.join(', ')}`);
  }

  // Check for empty headers
  const emptyHeaders = parseResult.headers.filter(
    (h) => !h || h.trim() === ''
  );
  if (emptyHeaders.length > 0) {
    warnings.push(`Found ${emptyHeaders.length} empty header(s)`);
  }

  // Check for minimum columns
  if (parseResult.headers.length < 2) {
    warnings.push('CSV has very few columns (less than 2)');
  }

  // Check for data consistency
  const inconsistentRows = findInconsistentRows(
    parseResult.data,
    parseResult.headers
  );
  if (inconsistentRows.length > 0) {
    warnings.push(
      `Found ${inconsistentRows.length} rows with inconsistent column count`
    );
  }

  // Check for completely empty rows
  const emptyRows = findEmptyRows(parseResult.data);
  if (emptyRows.length > 0) {
    warnings.push(`Found ${emptyRows.length} completely empty rows`);
  }

  // Validate row count
  if (parseResult.data.length > 10000) {
    warnings.push(
      `Large file detected (${parseResult.data.length} rows). Processing may take longer.`
    );
  }

  logger.info('CSV validation completed', {
    isValid: errors.length === 0,
    errors: errors.length,
    warnings: warnings.length,
    rows: parseResult.data.length,
    columns: parseResult.headers.length,
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    rowCount: parseResult.data.length,
    columnCount: parseResult.headers.length,
    headers: parseResult.headers,
  };
};

/**
 * Find duplicate values in array
 */
const findDuplicates = (arr: string[]): string[] => {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  arr.forEach((item) => {
    if (seen.has(item)) {
      duplicates.add(item);
    }
    seen.add(item);
  });

  return Array.from(duplicates);
};

/**
 * Find rows with inconsistent column count
 */
const findInconsistentRows = (
  data: Record<string, any>[],
  headers: string[]
): number[] => {
  const expectedColumns = headers.length;
  const inconsistentRows: number[] = [];

  data.forEach((row, index) => {
    const actualColumns = Object.keys(row).length;
    if (actualColumns !== expectedColumns) {
      inconsistentRows.push(index + 1);
    }
  });

  return inconsistentRows;
};

/**
 * Find completely empty rows
 */
const findEmptyRows = (data: Record<string, any>[]): number[] => {
  const emptyRows: number[] = [];

  data.forEach((row, index) => {
    const hasValue = Object.values(row).some(
      (value) => value !== null && value !== undefined && value !== ''
    );
    if (!hasValue) {
      emptyRows.push(index + 1);
    }
  });

  return emptyRows;
};

/**
 * Check if CSV has required fields for CRM
 * This is a soft check - AI will handle mapping
 */
export const checkCRMCompatibility = (
  headers: string[]
): { compatible: boolean; suggestions: string[] } => {
  const suggestions: string[] = [];
  
  // Convert headers to lowercase for case-insensitive matching
  const lowerHeaders = headers.map((h) => h.toLowerCase());

  // Check for name-related columns
  const hasName = lowerHeaders.some((h) =>
    ['name', 'full name', 'fullname', 'contact', 'person'].some((pattern) =>
      h.includes(pattern)
    )
  );

  if (!hasName) {
    suggestions.push(
      'No name column detected. AI will attempt to find or construct names.'
    );
  }

  // Check for contact information
  const hasEmail = lowerHeaders.some((h) =>
    ['email', 'mail', 'e-mail'].some((pattern) => h.includes(pattern))
  );

  const hasPhone = lowerHeaders.some((h) =>
    ['phone', 'mobile', 'tel', 'contact', 'number'].some((pattern) =>
      h.includes(pattern)
    )
  );

  if (!hasEmail && !hasPhone) {
    suggestions.push(
      'No email or phone column detected. At least one contact method is required.'
    );
  }

  // Check for company
  const hasCompany = lowerHeaders.some((h) =>
    ['company', 'organization', 'org', 'business'].some((pattern) =>
      h.includes(pattern)
    )
  );

  if (!hasCompany) {
    suggestions.push('No company column detected (optional).');
  }

  return {
    compatible: hasName && (hasEmail || hasPhone),
    suggestions,
  };
};
