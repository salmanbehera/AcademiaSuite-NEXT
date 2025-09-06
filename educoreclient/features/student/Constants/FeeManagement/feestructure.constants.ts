// Fee Structure Constants

export const FEESTRUCTURE_DEFAULTS = {
  organizationId: '',
  branchId: '',
  feeGroupId: '',
  classId: '',
  semesterId: '',
  academicYearId: '',
  startDate: '',
  endDate: '',
  isActive: true,
  details: [],
};

export const FEESTRUCTURE_DETAIL_DEFAULT = {
  feeHeadId: '',
  feeAmount: 0,
  feeFrequency: '',
};

export const FEE_FREQUENCY_OPTIONS = [
  { label: 'Monthly', value: 'Monthly' },
  { label: 'Quarterly', value: 'Quarterly' },
  { label: 'HalfYearly', value: 'HalfYearly' },
  { label: 'Annually', value: 'Annually' },
  { label: 'OneTime', value: 'OneTime' },
];
