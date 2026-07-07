import validator from 'validator';

/**
 * Validate email address
 */
export const validateEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string') {
    return false;
  }

  const trimmedEmail = email.trim().toLowerCase();

  // Basic validation using validator library
  if (!validator.isEmail(trimmedEmail)) {
    return false;
  }

  // Additional checks
  // Check for common typos in domain
  const commonDomainTypos = [
    'gmial.com',
    'gmai.com',
    'gmil.com',
    'yahooo.com',
    'yaho.com',
    'hotmial.com',
  ];

  const domain = trimmedEmail.split('@')[1];
  if (commonDomainTypos.includes(domain)) {
    return false;
  }

  // Check for valid TLD (at least 2 characters)
  const tld = domain.split('.').pop();
  if (!tld || tld.length < 2) {
    return false;
  }

  return true;
};

/**
 * Normalize email address
 * Converts to lowercase and trims whitespace
 */
export const normalizeEmail = (email: string): string => {
  if (!email || typeof email !== 'string') {
    return '';
  }

  return email.trim().toLowerCase();
};

/**
 * Extract domain from email
 */
export const extractDomain = (email: string): string | null => {
  if (!validateEmail(email)) {
    return null;
  }

  const parts = email.split('@');
  return parts.length === 2 ? parts[1] : null;
};

/**
 * Check if email is from a free provider
 */
export const isFreeEmailProvider = (email: string): boolean => {
  const freeProviders = [
    'gmail.com',
    'yahoo.com',
    'hotmail.com',
    'outlook.com',
    'icloud.com',
    'aol.com',
    'protonmail.com',
    'mail.com',
    'zoho.com',
    'yandex.com',
    'gmx.com',
  ];

  const domain = extractDomain(email);
  return domain ? freeProviders.includes(domain.toLowerCase()) : false;
};

/**
 * Suggest email corrections for common typos
 */
export const suggestEmailCorrection = (email: string): string | null => {
  const corrections: Record<string, string> = {
    'gmial.com': 'gmail.com',
    'gmai.com': 'gmail.com',
    'gmil.com': 'gmail.com',
    'yahooo.com': 'yahoo.com',
    'yaho.com': 'yahoo.com',
    'hotmial.com': 'hotmail.com',
  };

  const domain = extractDomain(email);
  if (!domain) return null;

  const suggestedDomain = corrections[domain.toLowerCase()];
  if (suggestedDomain) {
    const [localPart] = email.split('@');
    return `${localPart}@${suggestedDomain}`;
  }

  return null;
};
