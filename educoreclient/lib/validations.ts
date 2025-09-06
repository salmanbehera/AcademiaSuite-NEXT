import { VALIDATION_RULES } from './constants';

export interface ValidationError {
  field: string;
  message: string;
}

export interface ClassFormData {
  className: string;
  classShortName: string;
  displayOrder: number;
  maxStrength: number;
  reservationSeats: number;
  isActive: boolean;
}

export interface SectionFormData {
  sectionName: string;
  sectionShortName: string;
  displayOrder: number;
  maxStrength: number;
  isActive: boolean;
}

export interface StudentFormData {
  firstName: string;
  lastName: string;
  middleName?: string;
  email: string;
  phone?: string;
  dateOfBirth: string;
  gender: string;
  academicYear: string;
  classId: string;
  previousSchool?: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  fatherName: string;
  fatherOccupation?: string;
  fatherPhone?: string;
  fatherEmail?: string;
  motherName: string;
  motherOccupation?: string;
  motherPhone?: string;
  motherEmail?: string;
  primaryContact: string;
  emergencyContact: string;
  emergencyPhone: string;
}

/**
 * Validate class form data
 * @param data - Form data to validate
 * @returns Array of validation errors
 */
export function validateClassForm(data: ClassFormData): Record<string, string> {
  const errors: Record<string, string> = {};

  // Class name validation
  if (!data.className.trim()) {
    errors.className = 'Class name is required';
  } else if (data.className.length < VALIDATION_RULES.CLASS_NAME.MIN_LENGTH) {
    errors.className = `Class name must be at least ${VALIDATION_RULES.CLASS_NAME.MIN_LENGTH} characters`;
  } else if (data.className.length > VALIDATION_RULES.CLASS_NAME.MAX_LENGTH) {
    errors.className = `Class name must be ${VALIDATION_RULES.CLASS_NAME.MAX_LENGTH} characters or less`;
  }

  // Class short name validation
  if (!data.classShortName.trim()) {
    errors.classShortName = 'Short name is required';
  } else if (data.classShortName.length > VALIDATION_RULES.CLASS_SHORT_NAME.MAX_LENGTH) {
    errors.classShortName = `Short name must be ${VALIDATION_RULES.CLASS_SHORT_NAME.MAX_LENGTH} characters or less`;
  }

  // Display order validation
  if (data.displayOrder < VALIDATION_RULES.DISPLAY_ORDER.MIN) {
    errors.displayOrder = `Display order must be at least ${VALIDATION_RULES.DISPLAY_ORDER.MIN}`;
  } else if (data.displayOrder > VALIDATION_RULES.DISPLAY_ORDER.MAX) {
    errors.displayOrder = `Display order cannot exceed ${VALIDATION_RULES.DISPLAY_ORDER.MAX}`;
  }

  // Max strength validation
  if (data.maxStrength < VALIDATION_RULES.MAX_STRENGTH.MIN) {
    errors.maxStrength = `Maximum strength must be at least ${VALIDATION_RULES.MAX_STRENGTH.MIN}`;
  } else if (data.maxStrength > VALIDATION_RULES.MAX_STRENGTH.MAX) {
    errors.maxStrength = `Maximum strength cannot exceed ${VALIDATION_RULES.MAX_STRENGTH.MAX}`;
  }

  // Reservation seats validation
  if (data.reservationSeats < VALIDATION_RULES.RESERVATION_SEATS.MIN) {
    errors.reservationSeats = 'Reserved seats cannot be negative';
  } else if (data.reservationSeats >= data.maxStrength) {
    errors.reservationSeats = 'Reserved seats must be less than maximum strength';
  }

  return errors;
}

/**
 * Validate section form data
 * @param data - Form data to validate
 * @returns Array of validation errors
 */
export function validateSectionForm(data: SectionFormData): Record<string, string> {
  const errors: Record<string, string> = {};

  // Section name validation
  if (!data.sectionName.trim()) {
    errors.sectionName = 'Section name is required';
  } else if (data.sectionName.length < VALIDATION_RULES.SECTION_NAME.MIN_LENGTH) {
    errors.sectionName = `Section name must be at least ${VALIDATION_RULES.SECTION_NAME.MIN_LENGTH} characters`;
  } else if (data.sectionName.length > VALIDATION_RULES.SECTION_NAME.MAX_LENGTH) {
    errors.sectionName = `Section name must be ${VALIDATION_RULES.SECTION_NAME.MAX_LENGTH} characters or less`;
  }

  // Section short name validation
  if (!data.sectionShortName.trim()) {
    errors.sectionShortName = 'Short name is required';
  } else if (data.sectionShortName.length > VALIDATION_RULES.SECTION_SHORT_NAME.MAX_LENGTH) {
    errors.sectionShortName = `Short name must be ${VALIDATION_RULES.SECTION_SHORT_NAME.MAX_LENGTH} characters or less`;
  }

  // Display order validation
  if (data.displayOrder < VALIDATION_RULES.DISPLAY_ORDER.MIN) {
    errors.displayOrder = `Display order must be at least ${VALIDATION_RULES.DISPLAY_ORDER.MIN}`;
  } else if (data.displayOrder > VALIDATION_RULES.DISPLAY_ORDER.MAX) {
    errors.displayOrder = `Display order cannot exceed ${VALIDATION_RULES.DISPLAY_ORDER.MAX}`;
  }

  // Max strength validation
  if (data.maxStrength < VALIDATION_RULES.MAX_STRENGTH.MIN) {
    errors.maxStrength = `Maximum strength must be at least ${VALIDATION_RULES.MAX_STRENGTH.MIN}`;
  } else if (data.maxStrength > VALIDATION_RULES.MAX_STRENGTH.MAX) {
    errors.maxStrength = `Maximum strength cannot exceed ${VALIDATION_RULES.MAX_STRENGTH.MAX}`;
  }

  return errors;
}

/**
 * Check if form has any validation errors
 * @param errors - Validation errors object
 * @returns True if form is valid
 */
export function isFormValid(errors: Record<string, string>): boolean {
  return Object.keys(errors).length === 0;
}

/**
 * Format validation error for display
 * @param field - Field name
 * @param error - Error message
 * @returns Formatted error message
 */
export function formatValidationError(field: string, error: string): string {
  return `${field}: ${error}`;
}

/**
 * Validate student form data
 * @param data - Student form data to validate
 * @returns Object with validation errors
 */
export function validateStudentForm(data: StudentFormData): Record<string, string> {
  const errors: Record<string, string> = {};

  // Basic Information Validation
  if (!data.firstName.trim()) {
    errors.firstName = 'First name is required';
  } else if (data.firstName.length < 2) {
    errors.firstName = 'First name must be at least 2 characters';
  }

  if (!data.lastName.trim()) {
    errors.lastName = 'Last name is required';
  } else if (data.lastName.length < 2) {
    errors.lastName = 'Last name must be at least 2 characters';
  }

  if (!data.email.trim()) {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (data.phone && !/^\+?[\d\s\-\(\)]{10,}$/.test(data.phone)) {
    errors.phone = 'Please enter a valid phone number';
  }

  if (!data.dateOfBirth) {
    errors.dateOfBirth = 'Date of birth is required';
  } else {
    const birthDate = new Date(data.dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    
    if (age < 3 || age > 25) {
      errors.dateOfBirth = 'Student age must be between 3 and 25 years';
    }
  }

  if (!data.gender) {
    errors.gender = 'Gender is required';
  }

  if (!data.academicYear) {
    errors.academicYear = 'Academic year is required';
  }

  if (!data.classId) {
    errors.classId = 'Class selection is required';
  }

  // Address Validation
  if (!data.street.trim()) {
    errors.street = 'Street address is required';
  }

  if (!data.city.trim()) {
    errors.city = 'City is required';
  }

  if (!data.state.trim()) {
    errors.state = 'State is required';
  }

  if (!data.zipCode.trim()) {
    errors.zipCode = 'ZIP code is required';
  } else if (!/^\d{5,6}$/.test(data.zipCode)) {
    errors.zipCode = 'Please enter a valid ZIP code';
  }

  if (!data.country.trim()) {
    errors.country = 'Country is required';
  }

  // Guardian Information Validation
  if (!data.fatherName.trim()) {
    errors.fatherName = 'Father\'s name is required';
  }

  if (!data.motherName.trim()) {
    errors.motherName = 'Mother\'s name is required';
  }

  if (!data.primaryContact) {
    errors.primaryContact = 'Primary contact selection is required';
  }

  if (!data.emergencyContact.trim()) {
    errors.emergencyContact = 'Emergency contact name is required';
  }

  if (!data.emergencyPhone.trim()) {
    errors.emergencyPhone = 'Emergency contact phone is required';
  } else if (!/^\+?[\d\s\-\(\)]{10,}$/.test(data.emergencyPhone)) {
    errors.emergencyPhone = 'Please enter a valid emergency phone number';
  }

  return errors;
}
