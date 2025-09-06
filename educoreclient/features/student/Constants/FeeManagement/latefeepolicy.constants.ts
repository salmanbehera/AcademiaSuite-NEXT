
export const LATEFEEPOLICY_DEFAULTS = {
	id: undefined,
	organizationId: '',
	branchId: '',
	policyName: '',
	gracePeriodDays: 0,
	penaltyType: '',
	penaltyValue: 0,
	maxPenalty: 0,
	isActive: true,
};

export const PENALTY_TYPE_OPTIONS = [
	{ label: 'Fixed per Day', value: 'Fixed per Day' },
	{ label: 'Percentage per Day', value: 'Percentage per Day' },
];
 