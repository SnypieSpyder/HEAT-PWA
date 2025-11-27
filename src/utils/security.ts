/**
 * Security utility functions for sanitizing user input
 */

/**
 * Sanitize a URL to prevent javascript: and data: URL injection attacks
 * Only allows http://, https://, and relative paths starting with /
 */
export const sanitizeUrl = (url: string | undefined): string => {
  if (!url) return '';
  
  const trimmedUrl = url.trim();
  
  // Allow relative paths starting with /
  if (trimmedUrl.startsWith('/')) {
    return trimmedUrl;
  }
  
  // Allow http and https protocols only
  if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
    return trimmedUrl;
  }
  
  // Block javascript:, data:, and other potentially dangerous protocols
  // Return empty string for unsafe URLs
  return '';
};

/**
 * Validate if a URL is safe to use
 */
export const isValidUrl = (url: string | undefined): boolean => {
  if (!url) return false;
  const sanitized = sanitizeUrl(url);
  return sanitized !== '' && sanitized === url;
};

