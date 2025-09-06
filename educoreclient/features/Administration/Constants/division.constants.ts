export const DIVISION_API_ENDPOINT = "https://localhost:7051/divisions/";

export const DIVISION_FORM_DEFAULTS = {
  division: {
    id: "", // UUID for the division
    organizationId: "", // UUID for the organization
    branchId: "", // UUID for the branch
    divisionName: "", // Name of the division
    divisionCode: "", // Code for the division
    description: "", // Description of the division
    divisionHeadId: "", // UUID for the division head
    isActive: true // Status of the division
  }
};
