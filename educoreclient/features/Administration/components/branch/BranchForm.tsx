"use client";

import React, { useState, useEffect, useMemo } from 'react';
import countriesData from '@/data/countries.json';
import statesData from '@/data/states.json';
import citiesData from '@/data/cities.json';
import { Branch } from '@/features/Administration/types/branchTypes';
import { BranchSchema } from '@/features/Administration/Validations/branchSchemas';
import { BranchType } from '@/features/Administration/enum/branchenum';
import { BRANCH_FORM_DEFAULTS } from '@/features/Administration/Constants/branchconstant';
import { Input, Button, Select, Checkbox, useToast } from '@/app/components/ui';
import { useOrganization } from '@/features/Administration/hooks/useOrganization';

function getInitialFormData(defaultValues?: Branch) {
  if (defaultValues) {
    return {
      ...BRANCH_FORM_DEFAULTS,
      ...defaultValues,
      branchType: defaultValues.branchType ?? BranchType.None,
    };
  } else {
    return { ...BRANCH_FORM_DEFAULTS, branchType: BranchType.None };
  }
}

export default function BranchForm({ onSubmit, defaultValues, onCancel }: { onSubmit: (data: Branch) => Promise<{ id: string } | undefined>; defaultValues?: Branch; onCancel?: () => void }) {
  const { showSuccess, showError } = useToast();
  const [formData, setFormData] = useState<Branch>(getInitialFormData(defaultValues));
  // Country, State, City logic (save display names)
  const [country, setCountry] = useState(() => {
    if (defaultValues && defaultValues.country) {
      const found = countriesData.find((c: any) => c.name === defaultValues.country || c.id === defaultValues.country);
      return found ? found.name : 'India';
    }
    return 'India';
  });
  const [state, setState] = useState(() => {
    if (defaultValues && defaultValues.state) {
      const found = statesData.find((s: any) => s.name === defaultValues.state || s.id === defaultValues.state);
      return found ? found.name : '';
    }
    return '';
  });
  const [city, setCity] = useState(() => {
    if (defaultValues && defaultValues.city) {
      const found = citiesData.find((c: any) => c.name === defaultValues.city || c.id === defaultValues.city);
      return found ? found.name : '';
    }
    return '';
  });
  const countryOptions = countriesData.map((c: any) => ({ value: c.name, label: c.name }));
  const stateOptions = statesData.filter((s: any) => s.countryId === (countriesData.find((c: any) => c.name === country)?.id || 'IN')).map((s: any) => ({ value: s.name, label: s.name }));
  const cityOptions = useMemo(() => {
    const stateObj = statesData.find((s: any) => s.name === state);
    return citiesData.filter((ct: any) => ct.stateId === (stateObj ? stateObj.id : '')).map((ct: any) => ({ value: ct.name, label: ct.name }));
  }, [state, citiesData]);

  useEffect(() => {
    setFormData(prev => ({ ...prev, country }));
  }, [country]);
  useEffect(() => {
    setFormData(prev => ({ ...prev, state }));
  }, [state]);
  useEffect(() => {
    setFormData(prev => ({ ...prev, city }));
  }, [city]);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { organizations } = useOrganization();

  useEffect(() => {
    setFormData(getInitialFormData(defaultValues));
  }, [defaultValues]);

  const resetForm = () => {
    setFormData({ ...BRANCH_FORM_DEFAULTS, branchType: BranchType.None });
    setFormErrors({});
  };

  const branchTypeOptions = [
    { value: String(BranchType.None), label: "Select Type" },
    ...Object.entries(BranchType)
      .filter(([k, v]) => typeof v === 'number' && v !== BranchType.None)
      .map(([k, v]) => ({ value: String(v), label: k }))
  ];

  const organizationOptions = organizations.map(org => ({ value: org.id, label: org.organizationName }));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  const handleSelectChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const buildApiData = () => {
    const apiData = {
      ...formData,
      branchType: formData.branchType,
    };
    if (typeof formData.isActive !== 'undefined') {
      apiData.isActive = formData.isActive;
    }
    if ('id' in apiData) {
      delete (apiData as any).id;
    }
    return apiData;
  };

  const buildValidationObj = () => {
    const validationObj = {
      ...formData,
      branchType: formData.branchType,
    };
    if (typeof formData.isActive !== 'undefined') {
      validationObj.isActive = formData.isActive;
    }
    return validationObj;
  };

  const handleCreate = async () => {
    setIsSubmitting(true);
    try {
      const result = await onSubmit(buildApiData());
      if (result && result.id) {
        showSuccess('Branch Created', 'New branch has been created successfully.');
        resetForm();
      }
    } catch (error) {
      // Only log error, do not show toast (parent will handle)
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    setIsSubmitting(true);
    try {
      const result = await onSubmit(buildApiData());
      if ((result && result.id) || (result && typeof result === 'object' && 'isSuccess' in result && result.isSuccess)) {
        showSuccess('Branch Updated', 'Branch has been updated successfully.');
        resetForm();
      } else {
        showError('Update Failed', 'Failed to update the branch. Please try again.');
      }
    } catch (error) {
      showError('Update Failed', 'Failed to update the branch. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    // Add validation logic here if needed
    if (defaultValues) {
      await handleUpdate();
    } else {
      await handleCreate();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Select
        label="Organization"
        value={formData.organizationId ?? ''}
        options={organizationOptions}
        onChange={value => handleSelectChange('organizationId', value)}
        error={formErrors.organizationId}
        className="text-gray-500"
      />
      <Input
        name="branchCode"
        label="Branch Code"
        value={formData.branchCode ?? ''}
        onChange={handleChange}
        error={formErrors.branchCode}
      />
      <Input
        name="branchName"
        label="Branch Name"
        value={formData.branchName ?? ''}
        onChange={handleChange}
        error={formErrors.branchName}
      />
      <Select
        label="Branch Type"
        value={formData.branchType != null ? String(formData.branchType) : ''}
        options={branchTypeOptions}
        onChange={value => handleSelectChange('branchType', Number(value))}
        error={formErrors.branchType}
        className="text-slate-700"
        placeholder=''
      />
      <Input
        name="address1"
        label="Address 1"
        value={formData.address1 ?? ''}
        onChange={handleChange}
        error={formErrors.address1}
      />
      <Input
        name="address2"
        label="Address 2"
        value={formData.address2 ?? ''}
        onChange={handleChange}
        error={formErrors.address2}
      />
      <Select
        label="Country"
        value={country}
        options={countryOptions}
        onChange={val => setCountry(val)}
        error={formErrors.country}
        className="text-gray-500"
        placeholder="Select Country"
      />
      <Select
        label="State"
        value={state}
        options={stateOptions}
        onChange={val => setState(val)}
        error={formErrors.state}
        className="text-gray-500"
        placeholder="Select State"
      />
      <Select
        label="City"
        value={city}
        options={cityOptions}
        onChange={val => setCity(val)}
        error={formErrors.city}
        className="text-gray-500"
        placeholder="Select City"
      />
      <Input
        name="postalCode"
        label="Postal Code"
        value={formData.postalCode ?? ''}
        onChange={handleChange}
        error={formErrors.postalCode}
      />
      <Input
        name="landmark"
        label="Landmark"
        value={formData.landmark ?? ''}
        onChange={handleChange}
        error={formErrors.landmark}
      />
      <Input
        name="latitude"
        label="Latitude"
        value={formData.latitude ?? ''}
        onChange={handleChange}
        error={formErrors.latitude}
      />
      <Input
        name="longitude"
        label="Longitude"
        value={formData.longitude ?? ''}
        onChange={handleChange}
        error={formErrors.longitude}
      />
      <Input
        name="contactNumber"
        label="Contact Number"
        value={formData.contactNumber ?? ''}
        onChange={handleChange}
        error={formErrors.contactNumber}
      />
      <Input
        name="alternateContactNumber"
        label="Alternate Contact Number"
        value={formData.alternateContactNumber ?? ''}
        onChange={handleChange}
        error={formErrors.alternateContactNumber}
      />
      <Input
        name="email"
        label="Email"
        value={formData.email ?? ''}
        onChange={handleChange}
        error={formErrors.email}
      />
      <Input
        name="websiteUrl"
        label="Website URL"
        value={formData.websiteUrl ?? ''}
        onChange={handleChange}
        error={formErrors.websiteUrl}
      />
      <Input
        name="headOfBranch"
        label="Head of Branch"
        value={formData.headOfBranch ?? ''}
        onChange={handleChange}
        error={formErrors.headOfBranch}
      />

  <div className="flex space-x-2 justify-end">
        <Button type="submit" loading={isSubmitting}>
          {defaultValues ? 'Update Branch' : 'Create Branch'}
        </Button>
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
