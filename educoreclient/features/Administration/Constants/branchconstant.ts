
import { BranchType } from "../enum/branchenum";

export const BRANCH_FORM_DEFAULTS = {
  id: "",
  organizationId: "",
  branchCode: "",
  branchName: "",
  branchType: BranchType.Main,
  address1: "",
  address2: "",
  city: "",
  state: "",
  country: "",
  postalCode: "",
  landmark: "",
  latitude: undefined,
  longitude: undefined,
  contactNumber: "",
  alternateContactNumber: "",
  email: "",
  websiteUrl: "",
  headOfBranch: "",
  isActive: true,
} as const;

 
