// Form validation constants
export const VALIDATION_RULES = {
  CLASS_NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
  },
  CLASS_SHORT_NAME: {
    MAX_LENGTH: 10,
  },
  SECTION_NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
  },
  SECTION_SHORT_NAME: {
    MAX_LENGTH: 10,
  },
  DISPLAY_ORDER: {
    MIN: 1,
    MAX: 999,
  },
  MAX_STRENGTH: {
    MIN: 1,
    MAX: 200,
    DEFAULT: 40,
  },
  RESERVATION_SEATS: {
    MIN: 0,
    DEFAULT: 5,
  },
} as const;

// Form default values
export const CLASS_FORM_DEFAULTS = {
  className: '',
  classShortName: '',
  displayOrder: 1,
  maxStrength: VALIDATION_RULES.MAX_STRENGTH.DEFAULT,
  reservationSeats: VALIDATION_RULES.RESERVATION_SEATS.DEFAULT,
  isActive: true,
} as const;

// Section form default values
export const SECTION_FORM_DEFAULTS = {
  sectionName: '',
  sectionShortName: '',
  displayOrder: 1,
  maxStrength: VALIDATION_RULES.MAX_STRENGTH.DEFAULT,
  isActive: true,
} as const;

// Student form default values
export const STUDENT_FORM_DEFAULTS = {
  firstName: '',
  lastName: '',
  middleName: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  gender: '',
  academicYear: new Date().getFullYear().toString(),
  classId: '',
  previousSchool: '',
  street: '',
  city: '',
  state: '',
  zipCode: '',
  country: 'India',
  fatherName: '',
  fatherOccupation: '',
  fatherPhone: '',
  fatherEmail: '',
  motherName: '',
  motherOccupation: '',
  motherPhone: '',
  motherEmail: '',
  primaryContact: 'FATHER',
  emergencyContact: '',
  emergencyPhone: '',
} as const;

// Messages
export const MESSAGES = {
  DELETE_CONFIRMATION: 'Are you sure you want to delete this class? This action cannot be undone.',
  NO_CLASSES_FOUND: 'No classes found matching your search.',
  NO_CLASSES_AVAILABLE: 'No classes available. Create your first class!',
  LOADING: 'Loading classes...',
  ERROR_OCCURRED: 'Error occurred',
} as const;

// UI Constants
export const UI_CONFIG = {
  MODAL_SIZES: {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  },
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
  },
  DEBOUNCE_DELAY: 300,
} as const;

// Status options for forms
export const STATUS_OPTIONS = [
  { value: true, label: 'Active' },
  { value: false, label: 'Inactive' },
] as const;

// Table column keys
export const TABLE_COLUMNS = {
  CLASS_DETAILS: 'classDetails',
  CAPACITY: 'capacity',
  ORDER: 'order',
  STATUS: 'status',
  ACTIONS: 'actions',
} as const;
