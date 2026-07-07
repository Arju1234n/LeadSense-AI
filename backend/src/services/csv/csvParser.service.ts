import fs from 'fs';
import csv from 'csv-parser';
import Papa from 'papaparse';
import { logger } from '../../utils/logger';
import { CSVParseResult, CSVParseError } from '../../types/csv';

export interface CSVParserOptions {
  skipEmptyRows?: boolean;
  trimValues?: boolean;
  maxRows?: number;
  encoding?: BufferEncoding;
}

/**
 * Parse CSV file using csv-parser (streaming)
 */
export const parseCSVStream = (
  filepath: string,
  options: CSVParserOptions = {}
): Promise<CSVParseResult> => {
  return new Promise((resolve, reject) => {
    const {
      skipEmptyRows = true,
      trimValues = true,
      maxRows,
      encoding = 'utf8',
    } = options;

    const data: Record<string, any>[] = [];
    const errors: CSVParseError[] = [];
    let headers: string[] = [];
    let rowCount = 0;

    const stream = fs
      .createReadStream(filepath, { encoding })
      .pipe(
        csv({
          mapHeaders: ({ header }) => header.trim(),
        })
      )
      .on('headers', (csvHeaders: string[]) => {
        headers = csvHeaders;
        logger.info(`CSV headers detected: ${headers.length} columns`, {
          headers,
        });
      })
      .on('data', (row: Record<string, any>) => {
        rowCount++;

        // Check if we've reached max rows
        if (maxRows && rowCount > maxRows) {
          stream.destroy();
          return;
        }

        // Trim all string values if option is enabled
        if (trimValues) {
          Object.keys(row).forEach((key) => {
            if (typeof row[key] === 'string') {
              row[key] = row[key].trim();
            }
          });
        }

        data.push(row);
      })
      .on('error', (error: Error) => {
        logger.error('CSV parsing error:', error);
        errors.push({
          row: rowCount,
          message: error.message,
        });
      })
      .on('end', () => {
        logger.info(`CSV parsing completed: ${data.length} rows parsed`, {
          headers: headers.length,
          rows: data.length,
        });

        resolve({
          success: errors.length === 0,
          data,
          headers,
          totalRows: data.length,
          errors,
        });
      });
  });
};

/**
 * Parse CSV file using PapaParse (faster for large files)
 */
export const parseCSVFast = async (
  filepath: string,
  options: CSVParserOptions = {}
): Promise<CSVParseResult> => {
  try {
    const {
      skipEmptyRows = true,
      trimValues = true,
      maxRows,
    } = options;

    // Read file content
    const fileContent = await fs.promises.readFile(filepath, 'utf8');

    // Parse CSV
    const parseResult: any = Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: skipEmptyRows,
      transformHeader: (header) => header.trim(),
      transform: (value) => (trimValues && typeof value === 'string' ? value.trim() : value),
      preview: maxRows,
    });

    const errors: CSVParseError[] = parseResult.errors.map((error: any, index: number) => ({
      row: error.row || index,
      message: error.message,
    }));

    if (parseResult.errors.length > 0) {
      logger.warn(`CSV parsing completed with ${errors.length} errors`, {
        errors: errors.slice(0, 5), // Log first 5 errors
      });
    }

    logger.info(`CSV parsed successfully: ${parseResult.data.length} rows`, {
      headers: parseResult.meta.fields?.length || 0,
      rows: parseResult.data.length,
    });

    return {
      success: parseResult.errors.length === 0,
      data: parseResult.data,
      headers: parseResult.meta.fields || [],
      totalRows: parseResult.data.length,
      errors,
    };
  } catch (error) {
    logger.error('CSV parsing failed:', error);
    throw new Error(`Failed to parse CSV: ${(error as Error).message}`);
  }
};

/**
 * Detect CSV delimiter
 */
export const detectDelimiter = (filepath: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const sample: string[] = [];
    const stream = fs
      .createReadStream(filepath, { encoding: 'utf8' })
      .on('data', (chunk: any) => {
        sample.push(chunk);
        if (sample.join('').length > 1000) {
          stream.destroy();
        }
      })
      .on('end', () => {
        const content = sample.join('');
        const delimiters = [',', ';', '\t', '|'];
        let maxCount = 0;
        let detectedDelimiter = ',';

        delimiters.forEach((delimiter) => {
          const count = (content.match(new RegExp(`\\${delimiter}`, 'g')) || [])
            .length;
          if (count > maxCount) {
            maxCount = count;
            detectedDelimiter = delimiter;
          }
        });

        resolve(detectedDelimiter);
      })
      .on('error', reject);
  });
};

/**
 * Get CSV row count without loading entire file
 */
export const getCSVRowCount = (filepath: string): Promise<number> => {
  return new Promise((resolve, reject) => {
    let rowCount = 0;

    fs.createReadStream(filepath)
      .pipe(csv())
      .on('data', () => rowCount++)
      .on('end', () => resolve(rowCount))
      .on('error', reject);
  });
};

/**
 * Validate CSV file exists and is readable
 */
export const validateCSVFile = async (filepath: string): Promise<boolean> => {
  try {
    await fs.promises.access(filepath, fs.constants.R_OK);
    const stats = await fs.promises.stat(filepath);
    return stats.isFile();
  } catch {
    return false;
  }
};
