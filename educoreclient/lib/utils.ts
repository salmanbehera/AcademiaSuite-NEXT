/**
 * Format a date string for HTML input type="date" (yyyy-MM-dd)
 * Handles both yyyy-MM-dd and ISO string
 */
export function formatDateForInput(dateStr?: string) {
  if (!dateStr) return '';
  return dateStr.split('T')[0];
}
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge Tailwind CSS classes with clsx and tailwind-merge
 * @param inputs - Class values to merge
 * @returns Merged class string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format date for display
 * @param date - Date to format
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | string | number,
  options: Intl.DateTimeFormatOptions = {}
): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    ...options,
  }).format(new Date(date));
}

/**
 * Debounce function to limit the rate of function calls
 * @param func - Function to debounce
 * @param wait - Wait time in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Generate a random ID
 * @param length - Length of the ID
 * @returns Random ID string
 */
export function generateId(length: number = 8): string {
  return Math.random().toString(36).substr(2, length);
}

/**
 * Capitalize the first letter of a string
 * @param str - String to capitalize
 * @returns Capitalized string
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Format number with commas
 * @param num - Number to format
 * @returns Formatted number string
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

/**
 * Truncate text to specified length
 * @param text - Text to truncate
 * @param length - Maximum length
 * @returns Truncated text
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}

export function nullifyEmptyFields<T extends Record<string, any>>(obj: T, fields: string[]): T {
  const result = { ...obj };
  fields.forEach(field => {
    if (result[field] === "" || result[field] === undefined) {
      (result as any)[field] = null;
    }
  });
  return result;
}

/**
 * Pick specific keys from an object
 * @example
 *   pick({a:1, b:2, c:3}, ['a','c']) // {a:1, c:3}
 */
export function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;
  keys.forEach(key => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
}

/**
 * Omit specific keys from an object
 * @example
 *   omit({a:1, b:2, c:3}, ['b']) // {a:1, c:3}
 */
export function omit<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const result = { ...obj };
  keys.forEach(key => {
    delete result[key];
  });
  return result;
}

/**
 * Check if a string is a valid GUID/UUID
 * @example
 *   isValidGuid('123e4567-e89b-12d3-a456-426614174000') // true
 */
export function isValidGuid(value: string): boolean {
  const guidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
  return guidRegex.test(value);
}

/**
 * Check if a value is empty (null, undefined, empty string, array, or object)
 * @example
 *   isEmpty('') // true
 *   isEmpty([]) // true
 *   isEmpty({}) // true
 *   isEmpty('hello') // false
 */
export function isEmpty(value: any): boolean {
  if (value == null) return true;
  if (typeof value === 'string' && value.trim() === '') return true;
  if (Array.isArray(value) && value.length === 0) return true;
  if (typeof value === 'object' && Object.keys(value).length === 0) return true;
  return false;
}

/**
 * Deep clone an object or array
 * @example
 *   const copy = deepClone(obj)
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Deep merge two objects
 * @example
 *   mergeDeep({a:1, b:{c:2}}, {b:{d:3}}) // {a:1, b:{c:2, d:3}}
 */
export function mergeDeep(target: any, source: any): any {
  const output = { ...target };
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) Object.assign(output, { [key]: source[key] });
        else output[key] = mergeDeep(target[key], source[key]);
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  return output;
}
function isObject(item: any) {
  return item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * Download a file in the browser
 * @example
 *   downloadFile(blob, 'file.csv')
 */
export function downloadFile(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

/**
 * Extract a user-friendly error message from an error object
 * @example
 *   getErrorMessage(error)
 */
export function getErrorMessage(error: any): string {
  if (!error) return '';
  if (typeof error === 'string') return error;
  if (error.message) return error.message;
  if (error.response && error.response.data && error.response.data.message) return error.response.data.message;
  return 'An unknown error occurred.';
}

/**
 * Sleep for a given number of milliseconds (async delay)
 * @example
 *   await sleep(1000)
 */
export function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Remove duplicates from an array
 * @example
 *   uniqueArray([1,2,2,3]) // [1,2,3]
 */
export function uniqueArray<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

/**
 * Safely parse JSON, returning fallback value on error
 * @example
 *   parseJSONSafe('{"a":1}', {}) // {a:1}
 *   parseJSONSafe('bad json', {}) // {}
 */
export function parseJSONSafe<T>(str: string, fallback: T): T {
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

