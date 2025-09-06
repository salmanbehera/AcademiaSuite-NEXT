// Discount Policy Constants
export const DISCOUNT_POLICY_DEFAULTS = {
	organizationId: '',
	branchId: '',
	policyName: '',
	discountType: 1,
	discountValue: 0,
	appliesTo: 'All',
	appliesToDetails: '',
	eligibilityCriteria: '',
	maxLimit: 0,
	effectiveFrom: '',
	effectiveTo: '',
	isActive: true,
};

export const DISCOUNT_TYPE_OPTIONS = [
	{ label: 'Percentage', value: 1 },
	{ label: 'Fixed Amount', value: 2 },
];

export const APPLIES_TO_OPTIONS = [
	{ label: 'All', value: 'All' },
	{ label: 'Specific Heads', value: 'SpecificHeads' },
];
