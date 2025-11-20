import { API_CONFIG } from "@/lib/config";

// Resolve base URL from central config and ensure no duplicate slashes
export const DIVISION_API_ENDPOINT = `${API_CONFIG.BASE_URL.replace(
  /\/+$|\/$/g,
  ""
)}/divisions/`;

export const DIVISION_FORM_DEFAULTS = {
  id: "",
  organizationId: "",
  branchId: "",
  divisionName: "",
  divisionCode: "",
  description: "",
  divisionHeadId: "",
  isActive: true,
};
