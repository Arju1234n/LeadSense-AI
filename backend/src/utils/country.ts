/**
 * ISO 3166-1 alpha-2 country codes mapping
 * Commonly used countries for lead management
 */
export const COUNTRY_CODES: Record<string, string> = {
  // North America
  US: 'United States',
  CA: 'Canada',
  MX: 'Mexico',

  // Europe
  GB: 'United Kingdom',
  DE: 'Germany',
  FR: 'France',
  IT: 'Italy',
  ES: 'Spain',
  NL: 'Netherlands',
  BE: 'Belgium',
  SE: 'Sweden',
  NO: 'Norway',
  DK: 'Denmark',
  FI: 'Finland',
  PL: 'Poland',
  CH: 'Switzerland',
  AT: 'Austria',
  IE: 'Ireland',
  PT: 'Portugal',
  GR: 'Greece',

  // Asia
  IN: 'India',
  CN: 'China',
  JP: 'Japan',
  KR: 'South Korea',
  SG: 'Singapore',
  MY: 'Malaysia',
  TH: 'Thailand',
  ID: 'Indonesia',
  PH: 'Philippines',
  VN: 'Vietnam',
  PK: 'Pakistan',
  BD: 'Bangladesh',
  LK: 'Sri Lanka',
  AE: 'United Arab Emirates',
  SA: 'Saudi Arabia',
  IL: 'Israel',

  // Oceania
  AU: 'Australia',
  NZ: 'New Zealand',

  // South America
  BR: 'Brazil',
  AR: 'Argentina',
  CL: 'Chile',
  CO: 'Colombia',
  PE: 'Peru',
  VE: 'Venezuela',

  // Africa
  ZA: 'South Africa',
  EG: 'Egypt',
  NG: 'Nigeria',
  KE: 'Kenya',
};

/**
 * Country name to code mapping
 */
export const COUNTRY_NAME_TO_CODE: Record<string, string> = Object.entries(
  COUNTRY_CODES
).reduce(
  (acc, [code, name]) => {
    acc[name.toLowerCase()] = code;
    return acc;
  },
  {} as Record<string, string>
);

/**
 * Common country name variations and their standard names
 */
const COUNTRY_ALIASES: Record<string, string> = {
  usa: 'United States',
  'united states of america': 'United States',
  america: 'United States',
  uk: 'United Kingdom',
  'great britain': 'United Kingdom',
  britain: 'United Kingdom',
  england: 'United Kingdom',
  uae: 'United Arab Emirates',
  emirates: 'United Arab Emirates',
};

/**
 * Normalize country name
 */
export const normalizeCountry = (country: string): string | null => {
  if (!country || typeof country !== 'string') {
    return null;
  }

  const normalized = country.trim().toLowerCase();

  // Check if it's a country code
  const upperCountry = country.trim().toUpperCase();
  if (COUNTRY_CODES[upperCountry]) {
    return COUNTRY_CODES[upperCountry];
  }

  // Check if it's a country name
  if (COUNTRY_NAME_TO_CODE[normalized]) {
    const code = COUNTRY_NAME_TO_CODE[normalized];
    return COUNTRY_CODES[code];
  }

  // Check aliases
  if (COUNTRY_ALIASES[normalized]) {
    return COUNTRY_ALIASES[normalized];
  }

  // Partial match (for cases like "United States" vs "United States of America")
  for (const [name, code] of Object.entries(COUNTRY_NAME_TO_CODE)) {
    if (normalized.includes(name) || name.includes(normalized)) {
      return COUNTRY_CODES[code];
    }
  }

  // Return original if no match found
  return country.trim();
};

/**
 * Get country code from country name
 */
export const getCountryCode = (countryName: string): string | null => {
  if (!countryName) return null;

  const normalized = normalizeCountry(countryName);
  if (!normalized) return null;

  const code = COUNTRY_NAME_TO_CODE[normalized.toLowerCase()];
  return code || null;
};

/**
 * Get country name from country code
 */
export const getCountryName = (countryCode: string): string | null => {
  if (!countryCode) return null;
  return COUNTRY_CODES[countryCode.toUpperCase()] || null;
};

/**
 * Validate country code
 */
export const isValidCountryCode = (code: string): boolean => {
  if (!code) return false;
  return code.toUpperCase() in COUNTRY_CODES;
};

/**
 * Get all supported countries
 */
export const getAllCountries = (): Array<{ code: string; name: string }> => {
  return Object.entries(COUNTRY_CODES).map(([code, name]) => ({ code, name }));
};
