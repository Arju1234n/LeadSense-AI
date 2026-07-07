import { CSVParseResult, CSVPreviewData } from '../../types/csv';
import { logger } from '../../utils/logger';

/**
 * Generate preview data from CSV parse result
 */
export const generatePreview = (
  parseResult: CSVParseResult,
  previewRows: number = 10
): CSVPreviewData => {
  const preview: CSVPreviewData = {
    headers: parseResult.headers,
    rows: parseResult.data.slice(0, previewRows),
    totalRows: parseResult.totalRows,
    previewRows: Math.min(previewRows, parseResult.data.length),
  };

  logger.info('Preview generated', {
    totalRows: preview.totalRows,
    previewRows: preview.previewRows,
    headers: preview.headers.length,
  });

  return preview;
};

/**
 * Generate column statistics for preview
 */
export const generateColumnStats = (
  data: Record<string, any>[],
  headers: string[]
): Record<string, ColumnStats> => {
  const stats: Record<string, ColumnStats> = {};

  headers.forEach((header) => {
    const values = data.map((row) => row[header]);
    stats[header] = calculateColumnStats(values);
  });

  return stats;
};

interface ColumnStats {
  totalValues: number;
  nullCount: number;
  emptyCount: number;
  uniqueCount: number;
  fillRate: number;
  dataType: string;
  sampleValues: any[];
}

/**
 * Calculate statistics for a column
 */
const calculateColumnStats = (values: any[]): ColumnStats => {
  const totalValues = values.length;
  const nullCount = values.filter((v) => v === null || v === undefined).length;
  const emptyCount = values.filter((v) => v === '').length;
  const uniqueValues = new Set(values.filter((v) => v !== null && v !== undefined && v !== ''));
  const uniqueCount = uniqueValues.size;
  const fillRate = ((totalValues - nullCount - emptyCount) / totalValues) * 100;

  // Detect data type
  const dataType = detectDataType(Array.from(uniqueValues).slice(0, 100));

  // Get sample values (first 5 unique non-empty values)
  const sampleValues = Array.from(uniqueValues)
    .filter((v) => v !== null && v !== undefined && v !== '')
    .slice(0, 5);

  return {
    totalValues,
    nullCount,
    emptyCount,
    uniqueCount,
    fillRate: Math.round(fillRate * 100) / 100,
    dataType,
    sampleValues,
  };
};

/**
 * Detect data type of column values
 */
const detectDataType = (values: any[]): string => {
  if (values.length === 0) return 'empty';

  const types = {
    number: 0,
    date: 0,
    email: 0,
    phone: 0,
    url: 0,
    boolean: 0,
    text: 0,
  };

  values.forEach((value) => {
    const str = String(value).trim();

    // Check for number
    if (!isNaN(Number(str)) && str !== '') {
      types.number++;
      return;
    }

    // Check for date
    if (isDateLike(str)) {
      types.date++;
      return;
    }

    // Check for email
    if (/@/.test(str) && str.includes('.')) {
      types.email++;
      return;
    }

    // Check for phone
    if (/^[\d\s\-\+\(\)]+$/.test(str) && str.length >= 7) {
      types.phone++;
      return;
    }

    // Check for URL
    if (/^https?:\/\//.test(str)) {
      types.url++;
      return;
    }

    // Check for boolean
    if (['true', 'false', 'yes', 'no', '1', '0'].includes(str.toLowerCase())) {
      types.boolean++;
      return;
    }

    types.text++;
  });

  // Return the most common type
  const maxType = Object.entries(types).reduce((a, b) =>
    b[1] > a[1] ? b : a
  );

  return maxType[0];
};

/**
 * Check if string looks like a date
 */
const isDateLike = (str: string): boolean => {
  // Common date patterns
  const datePatterns = [
    /^\d{4}-\d{2}-\d{2}/, // ISO date
    /^\d{2}\/\d{2}\/\d{4}/, // US date
    /^\d{2}-\d{2}-\d{4}/, // EU date
    /^\d{1,2}\s+\w+\s+\d{4}/, // Natural date
  ];

  return datePatterns.some((pattern) => pattern.test(str));
};

/**
 * Generate enhanced preview with statistics
 */
export const generateEnhancedPreview = (
  parseResult: CSVParseResult,
  previewRows: number = 10
): CSVPreviewData & { columnStats?: Record<string, ColumnStats> } => {
  const preview = generatePreview(parseResult, previewRows);
  const columnStats = generateColumnStats(parseResult.data, parseResult.headers);

  return {
    ...preview,
    columnStats,
  };
};
