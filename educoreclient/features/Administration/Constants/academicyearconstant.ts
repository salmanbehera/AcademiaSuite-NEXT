 
import { AcademicYearStatus } from "../enum/AcademicYearStatus";

export const ACADEMIC_YEAR_FORM_DEFAULTS = {
  yearCode: "",
  startDate: "",
  endDate: "",
  isCurrentYear: false,
  isAdmissionOpen: false,
  status: AcademicYearStatus.Active,
  isActive: true,
} as const;

 