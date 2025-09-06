/**
 * Format a number as currency
 * @example
 *   formatCurrency(1234.56, 'USD', 'en-US') // "$1,234.56"
 */
export function formatCurrency(
  amount: number,
  currency: string = "INR",
  locale: string = "en-IN"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(amount);
}

/**
 * Format a date for display
 * @example
 *   formatDate('2023-01-01', 'short', 'en-US') // "Jan 1, 2023"
 */
export function formatDate(
  date: Date | string,
  format: "short" | "medium" | "long" = "medium",
  locale: string = "en-IN"
): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  let options: Intl.DateTimeFormatOptions;
  switch (format) {
    case "short":
      options = { year: "numeric", month: "short", day: "numeric" };
      break;
    case "long":
      options = { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" };
      break;
    default:
      options = { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" };
  }
  return new Intl.DateTimeFormat(locale, options).format(dateObj);
}

/**
 * Format file size in human readable form
 * @example
 *   formatFileSize(2048) // "2 KB"
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/**
 * Generate a random string ID
 * @example
 *   generateId() // "k3j2l1..."
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * Convert a string to a URL-friendly slug
 * @example
 *   slugify('Hello World!') // "hello-world"
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Capitalize the first letter of a string
 * @example
 *   capitalize('hello') // "Hello"
 */
export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

/**
 * Truncate text to a maximum length
 * @example
 *   truncate('abcdef', 3) // "abc..."
 */
export function truncate(text: string, length: number = 100): string {
  if (text.length <= length) return text;
  return text.substring(0, length).trim() + "...";
}

/**
 * Validate an email address
 * @example
 *   isValidEmail('test@example.com') // true
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate a phone number
 * @example
 *   isValidPhone('+1234567890') // true
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ""));
}

/**
 * Debounce a function
 * @example
 *   const debounced = debounce(fn, 300)
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
 * Throttle a function
 * @example
 *   const throttled = throttle(fn, 500)
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Get initials from first and last name
 * @example
 *   getInitials('John', 'Doe') // "JD"
 */
export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

/**
 * Calculate age from date of birth
 * @example
 *   calculateAge('2000-01-01') // 23
 */
export function calculateAge(dateOfBirth: Date | string): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

/**
 * Get file extension from filename
 * @example
 *   getFileExtension('file.txt') // "txt"
 */
export function getFileExtension(filename: string): string {
  return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2);
}

/**
 * Download a file from a URL
 * @example
 *   downloadFile('https://...', 'file.txt')
 */
export function downloadFile(url: string, filename: string): void {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Copy text to clipboard
 * @example
 *   await copyToClipboard('hello')
 */
export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}

/**
 * Generate a random password
 * @example
 *   generatePassword(10) // "aB3$..."
 */
export function generatePassword(length: number = 12): string {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

/**
 * Validate password strength
 * @example
 *   validatePassword('Abc123!@#') // { isValid: true, errors: [] }
 */
export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }
  
  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one number");
  }
  
  if (!/[!@#$%^&*]/.test(password)) {
    errors.push("Password must contain at least one special character");
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

// --- Additional Utility Functions from utils.ts ---

/**
 * Merge Tailwind CSS classes with clsx and tailwind-merge
 * @example
 *   cn('btn', condition && 'btn-primary')
 */
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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

/**
 * Nullify empty fields in an object
 * @example
 *   nullifyEmptyFields({a: '', b: 2}, ['a']) // {a: null, b: 2}
 */
export function nullifyEmptyFields<T extends Record<string, any>>(obj: T, fields: string[]): T {
  const result = { ...obj };
  fields.forEach(field => {
    if (result[field] === "" || result[field] === undefined) {
      (result as any)[field] = null;
    }
  });
  return result;
}
