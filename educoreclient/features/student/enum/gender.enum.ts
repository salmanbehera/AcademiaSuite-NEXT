// Gender enum for Student forms and API mapping
export enum Gender {
  Male = 1,
  Female = 2,
  Other = 3,
}

export const GenderLabels: Record<Gender, string> = {
  [Gender.Male]: 'Male',
  [Gender.Female]: 'Female',
  [Gender.Other]: 'Other',
};
