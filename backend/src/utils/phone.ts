import { parsePhoneNumber, CountryCode, isValidPhoneNumber } from 'libphonenumber-js';
import { logger } from './logger';

export interface ParsedPhone {
  countryCode: string;
  mobileWithoutCountryCode: string;
  formattedNumber: string;
  isValid: boolean;
}

/**
 * Parse and validate phone number
 * Attempts to extract country code and mobile number
 */
export const parsePhone = (
  phoneInput: string,
  defaultCountry?: string
): ParsedPhone | null => {
  try {
    if (!phoneInput || typeof phoneInput !== 'string') {
      return null;
    }

    // Clean the phone number
    const cleaned = phoneInput.trim().replace(/\s+/g, '');

    // Try parsing with default country
    let phoneNumber;
    if (defaultCountry && defaultCountry.length === 2) {
      try {
        phoneNumber = parsePhoneNumber(cleaned, defaultCountry.toUpperCase() as CountryCode);
      } catch {
        // If parsing with default country fails, try without
        phoneNumber = parsePhoneNumber(cleaned);
      }
    } else {
      phoneNumber = parsePhoneNumber(cleaned);
    }

    if (!phoneNumber) {
      return null;
    }

    // Validate the phone number
    const isValid = phoneNumber.isValid();

    return {
      countryCode: phoneNumber.countryCallingCode || '',
      mobileWithoutCountryCode: phoneNumber.nationalNumber || '',
      formattedNumber: phoneNumber.formatInternational(),
      isValid,
    };
  } catch (error) {
    logger.debug('Failed to parse phone number:', { phoneInput, error });
    return null;
  }
};

/**
 * Validate phone number
 */
export const validatePhone = (phone: string, country?: string): boolean => {
  try {
    if (country && country.length === 2) {
      return isValidPhoneNumber(phone, country.toUpperCase() as CountryCode);
    }
    return isValidPhoneNumber(phone);
  } catch {
    return false;
  }
};

/**
 * Extract country code from phone number
 */
export const extractCountryCode = (phone: string): string | null => {
  const parsed = parsePhone(phone);
  return parsed ? parsed.countryCode : null;
};

/**
 * Extract mobile without country code
 */
export const extractMobileWithoutCountryCode = (phone: string): string | null => {
  const parsed = parsePhone(phone);
  return parsed ? parsed.mobileWithoutCountryCode : null;
};

/**
 * Format phone number for display
 */
export const formatPhone = (phone: string, country?: string): string => {
  const parsed = parsePhone(phone, country);
  return parsed ? parsed.formattedNumber : phone;
};

/**
 * Normalize phone number (remove spaces, dashes, etc.)
 */
export const normalizePhone = (phone: string): string => {
  if (!phone) return '';
  return phone.replace(/[\s\-\(\)\.]/g, '');
};
