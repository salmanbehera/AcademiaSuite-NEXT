
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import countriesData from '@/data/countries.json';
import statesData from '@/data/states.json';
import citiesData from '@/data/cities.json';
import { Organization } from '@/features/Administration/types/organizationTypes';
import { OrganizationSchema } from '@/features/Administration/Validations/organizationSchemas';
import { OrganizationType } from '@/features/Administration/enum/OrganizationTypeenum';
import { ORGANIZATION_FORM_DEFAULTS } from '@/features/Administration/Constants/organizationconstant';
import { Input, Button, Select, Checkbox, useToast } from '@/app/components/ui';
import { toIsoDate } from '@/lib/utils/dateUtils';


function getInitialFormData(defaultValues?: Organization) {
  if (defaultValues) {
    return {
      ...ORGANIZATION_FORM_DEFAULTS,
      ...defaultValues,
  organizationType: defaultValues.organizationType ?? OrganizationType.None,
    };
  } else {
  return { ...ORGANIZATION_FORM_DEFAULTS, organizationType: OrganizationType.None };
  }
}


export default function OrganizationForm({ onSubmit, defaultValues, onCancel, viewMode }: { onSubmit: (data: Organization) => Promise<{ id: string } | undefined>; defaultValues?: Organization; onCancel?: () => void; viewMode?: boolean }) {
  // Helpers to get display names for state and city
  const getStateName = (stateValue: string) => {
    const stateObj = statesData.find((s: any) => s.name === stateValue || s.id === stateValue);
    return stateObj ? stateObj.name : stateValue;
  };
  const getCityName = (cityValue: string) => {
    const cityObj = citiesData.find((c: any) => c.name === cityValue || c.id === cityValue);
    return cityObj ? cityObj.name : cityValue;
  };
  const { showSuccess, showError } = useToast();
  const [formData, setFormData] = useState<Organization>(getInitialFormData(defaultValues));
  // Country, State, City logic
  // Always store country, state, city as IDs for dropdown logic, but only pass text to API
  const [country, setCountry] = useState(() => {
    if (defaultValues && defaultValues.country) {
      // Try to find by name or id
      const found = countriesData.find((c: any) => c.name === defaultValues.country || c.id === defaultValues.country);
      return found ? found.id : 'IN';
    }
    return 'IN';
  });

  // Ensure formData.country is always in sync with country state
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      country: country || 'IN',
    }));
  }, [country]);
  const [state, setState] = useState(() => {
    if (defaultValues && defaultValues.state) {
      // Try to find by name or id
      const found = statesData.find((s: any) => s.name === defaultValues.state || s.id === defaultValues.state);
      return found ? found.id : '';
    }
    return '';
  });
  const [city, setCity] = useState(() => {
    if (defaultValues && defaultValues.city) {
      // Try to find by name or id
      const found = citiesData.find((c: any) => c.name === defaultValues.city || c.id === defaultValues.city);
      return found ? found.id : '';
    }
    return '';
  });
  const countryOptions = countriesData.map((c: any) => ({ value: c.id, label: c.name }));
  const stateOptions = statesData.filter((s: any) => s.countryId === country).map((s: any) => ({ value: s.id, label: s.name }));
  const cityOptions = useMemo(() => {
    return citiesData.filter((ct: any) => ct.stateId === state).map((ct: any) => ({ value: ct.id, label: ct.name }));
  }, [state, citiesData]);

  // Handlers to ensure city resets when state changes
  const handleStateChange = (val: string) => {
    setState(val);
    setCity('');
  };

  useEffect(() => {
    setState('');
    setCity('');
    setFormData(prev => ({
      ...prev,
      country: country || 'India',
    }));
  }, [country]);
  useEffect(() => {
    setCity('');
    const stateLabel = statesData.find((s: any) => s.id === state && s.countryId === country)?.name || '';
    setFormData(prev => ({
      ...prev,
      state: stateLabel
    }));
  }, [state]);
  useEffect(() => {
    const cityLabel = citiesData.find((ct: any) => ct.id === city && statesData.find((s: any) => s.id === ct.stateId && s.countryId === country))?.name || '';
    setFormData(prev => ({
      ...prev,
      city: cityLabel
    }));
  }, [city]);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setFormData(getInitialFormData(defaultValues));
    // Set state and city IDs for dropdowns in edit/update mode
    if (defaultValues) {
      if (defaultValues.state) {
        const foundState = statesData.find((s: any) => s.name === defaultValues.state || s.id === defaultValues.state);
        setState(foundState ? foundState.id : '');
      }
      if (defaultValues.city) {
        const foundCity = citiesData.find((c: any) => c.name === defaultValues.city || c.id === defaultValues.city);
        setCity(foundCity ? foundCity.id : '');
      }
    }
  }, [defaultValues]);

  const resetForm = () => {
  setFormData({ ...ORGANIZATION_FORM_DEFAULTS, organizationType: OrganizationType.None });
  setFormErrors({});
  };

    // Helper for organization type options
  const organizationTypeOptions = [
    { value: String(OrganizationType.None), label: "Select Type" },
    ...Object.entries(OrganizationType)
      .filter(([k, v]) => typeof v === 'number' && v !== OrganizationType.None)
      .map(([k, v]) => ({ value: String(v), label: k }))
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  const handleSelectChange = (name: string, value: OrganizationType) => {
  setFormData(prev => ({ ...prev, [name]: value }));
  };

 

  const buildApiData = () => {
    const apiData = {
      ...formData,
      organizationType: formData.organizationType,
    };
    // Format academicYearStart and academicYearEnd
    if (apiData.academicYearStart) {
      apiData.academicYearStart = toIsoDate(apiData.academicYearStart);
    }
    if (apiData.academicYearEnd) {
      apiData.academicYearEnd = toIsoDate(apiData.academicYearEnd);
    }
    if (typeof formData.isActive !== 'undefined') {
      apiData.isActive = formData.isActive;
    }
    if ('id' in apiData) {
      delete (apiData as any).id;
    }
    return apiData;
  };

  const buildValidationObj = () => {
    const validationObj: any = {
      ...formData,
      organizationType: formData.organizationType,
      country: country || 'IN',
    };
    // Only include organizationId if present and non-empty (for update)
    if (formData.id) {
      validationObj.organizationId = formData.id;
    }
    if (typeof formData.isActive !== 'undefined') {
      validationObj.isActive = formData.isActive;
    }
    return validationObj;
  };

  const handleCreate = async () => {
    setIsSubmitting(true);
    try {
      const payload = buildApiData();
      console.log('Organization Create Payload:', payload);
      const result = await onSubmit(payload);
      // Check for result.id only
      if (result && result.id) {
        showSuccess('Organization Created', 'New organization has been created successfully.');
        resetForm();
      } else {
        // Only log error, do not show toast (parent will handle)
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
      const payload = buildApiData();
      console.log('Organization Update Payload:', payload);
      const result = await onSubmit(payload);
      if ((result && result.id) || (result && typeof result === 'object' && 'isSuccess' in result && result.isSuccess)) {
        showSuccess('Organization Updated', 'Organization has been updated successfully.');
        resetForm();
      } else {
        showError('Update Failed', 'Failed to update the organization. Please try again.');
      }
    } catch (error) {
      showError('Update Failed', 'Failed to update the organization. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Frontend validation using Zod schema
    const validationObj = buildValidationObj();
    console.log('Zod validation input:', validationObj);
    const result = OrganizationSchema.safeParse(validationObj);
    console.log('Zod validation result:', result);
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.issues.forEach(issue => {
        if (issue.path.length > 0) {
          errors[issue.path[0]?.toString() || 'unknown'] = issue.message;
        }
      });
  setFormErrors(errors);
  console.error('Validation failed:', JSON.stringify(errors, null, 2));
  return;
    }
    setFormErrors({});
    if (defaultValues && defaultValues.id) {
      await handleUpdate();
    } else {
      await handleCreate();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full">
      {/* Error summary */}
      {Object.keys(formErrors).length > 0 && (
        <div className="mb-2 p-2 bg-red-100 text-red-700 rounded text-sm">
          <strong>Form Errors:</strong>
          <ul className="list-disc ml-5">
            {Object.entries(formErrors).map(([field, msg]) => (
              <li key={field}>{field}: {msg}</li>
            ))}
          </ul>
        </div>
      )}
      <div>
        {/* ...existing code (all other form fields) ... */}
        <div>
          <label htmlFor="organizationCode" className="block text-xs font-medium text-slate-700">Organization Code *</label>
          <Input id="organizationCode" name="organizationCode" value={formData.organizationCode ?? ''} onChange={handleChange} error={formErrors.organizationCode} placeholder="e.g., ORG001"  />
        </div>
        <div>
          <label htmlFor="organizationName" className="block text-xs font-medium text-slate-700">Organization Name *</label>
          <Input id="organizationName" name="organizationName" value={formData.organizationName ?? ''} onChange={handleChange} error={formErrors.organizationName} placeholder="e.g., My School"  />
        </div>
        {/* ...rest of the form fields remain unchanged... */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="postalCode" className="block text-xs font-medium text-slate-700">Postal Code</label>
            <Input id="postalCode" name="postalCode" value={formData.postalCode ?? ''} onChange={handleChange} error={formErrors.postalCode} placeholder="e.g., 400001" />
          </div>
          <div>
            <label htmlFor="landmark" className="block text-xs font-medium text-slate-700">Landmark</label>
            <Input id="landmark" name="landmark" value={formData.landmark ?? ''} onChange={handleChange} error={formErrors.landmark} placeholder="Near Park" />
          </div>
        </div>
        {/* Country, State, City Dropdowns */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Country *</label>
            {viewMode ? (
              <div className="pt-2 text-sm text-slate-900">{formData.country}</div>
            ) : (
              <Select
                value={country}
                onChange={val => {
                  setCountry(val);
                  setFormData(prev => ({ ...prev, country: val }));
                }}
                options={countryOptions}
                disabled={false}
                className="text-gray-500"
                placeholder="Select Country"
              />
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">State *</label>
            {viewMode ? (
              <div className="pt-2 text-sm text-slate-900">{getStateName(formData.state)}</div>
            ) : (
              <Select
                value={state}
                onChange={handleStateChange}
                options={stateOptions}
                className="text-gray-500"
                placeholder="Select State"
              />
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">City *</label>
            {viewMode ? (
              <div className="pt-2 text-sm text-slate-900">{getCityName(formData.city)}</div>
            ) : cityOptions.length > 0 ? (
              <Select
                value={city}
                onChange={val => setCity(val)}
                options={cityOptions}
                className="text-gray-500"
                placeholder="Select City"
              />
            ) : (
              <div className="text-xs text-slate-400 pt-2">No cities found for this state.</div>
            )}
          </div>
        </div>
      </div>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label htmlFor="affiliationBoard" className="block text-xs font-medium text-gray-500">Affiliation Board</label>
  <Input id="affiliationBoard" name="affiliationBoard" value={formData.affiliationBoard ?? ''} onChange={handleChange} error={formErrors.affiliationBoard} placeholder="e.g., CBSE" />
      </div>
      <div>
        <label htmlFor="organizationType" className="block text-xs font-medium text-gray-500">Organization Type *</label>
        <Select
          value={String(formData.organizationType)}
          onChange={value => handleSelectChange('organizationType', Number(value))}
          options={organizationTypeOptions}
          error={formErrors.organizationType}
          className="text-gray-500"
          placeholder=""
        />
      </div>
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label htmlFor="logoUrl" className="block text-xs font-medium text-slate-700">Logo URL</label>
  <Input id="logoUrl" name="logoUrl" value={formData.logoUrl ?? ''} onChange={handleChange} error={formErrors.logoUrl} placeholder="e.g., https://..." />
      </div>
      <div>
        <label htmlFor="establishedYear" className="block text-xs font-medium text-slate-700">Established Year</label>
  <Input id="establishedYear" name="establishedYear" type="number" value={formData.establishedYear ?? ''} onChange={handleChange} error={formErrors.establishedYear} placeholder="e.g., 1990" />
      </div>
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label htmlFor="registrationNumber" className="block text-xs font-medium text-slate-700">Registration Number</label>
  <Input id="registrationNumber" name="registrationNumber" value={formData.registrationNumber ?? ''} onChange={handleChange} error={formErrors.registrationNumber} placeholder="e.g., REG123" />
      </div>
      <div>
        <label htmlFor="panTinTaxId" className="block text-xs font-medium text-slate-700">PAN/TIN/Tax ID</label>
  <Input id="panTinTaxId" name="panTinTaxId" value={formData.panTinTaxId ?? ''} onChange={handleChange} error={formErrors.panTinTaxId} placeholder="e.g., ABCDE1234F" />
      </div>
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label htmlFor="address1" className="block text-xs font-medium text-slate-700">Address 1</label>
  <Input id="address1" name="address1" value={formData.address1 ?? ''} onChange={handleChange} error={formErrors.address1} placeholder="Street, Area" />
      </div>
      <div>
        <label htmlFor="address2" className="block text-xs font-medium text-slate-700">Address 2</label>
  <Input id="address2" name="address2" value={formData.address2 ?? ''} onChange={handleChange} error={formErrors.address2} placeholder="Landmark, etc." />
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div>
        <label htmlFor="postalCode" className="block text-xs font-medium text-slate-700">Postal Code</label>
  <Input id="postalCode" name="postalCode" value={formData.postalCode ?? ''} onChange={handleChange} error={formErrors.postalCode} placeholder="e.g., 400001" />
      </div>
      <div>
        <label htmlFor="landmark" className="block text-xs font-medium text-slate-700">Landmark</label>
  <Input id="landmark" name="landmark" value={formData.landmark ?? ''} onChange={handleChange} error={formErrors.landmark} placeholder="Near Park" />
      </div>
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label htmlFor="latitude" className="block text-xs font-medium text-slate-700">Latitude</label>
        <Input id="latitude" name="latitude" type="number" step="any" value={formData.latitude ?? ''} onChange={handleChange} error={formErrors.latitude} placeholder="e.g., 19.0760" />
      </div>
      <div>
        <label htmlFor="longitude" className="block text-xs font-medium text-slate-700">Longitude</label>
        <Input id="longitude" name="longitude" type="number" step="any" value={formData.longitude ?? ''} onChange={handleChange} error={formErrors.longitude} placeholder="e.g., 72.8777" />
      </div>
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label htmlFor="contactNumber" className="block text-xs font-medium text-slate-700">Contact Number</label>
  <Input id="contactNumber" name="contactNumber" value={formData.contactNumber ?? ''} onChange={handleChange} error={formErrors.contactNumber} placeholder="e.g., +91-1234567890" />
      </div>
      <div>
        <label htmlFor="alternateContactNumber" className="block text-xs font-medium text-slate-700">Alternate Contact Number</label>
  <Input id="alternateContactNumber" name="alternateContactNumber" value={formData.alternateContactNumber ?? ''} onChange={handleChange} error={formErrors.alternateContactNumber} placeholder="e.g., +91-9876543210" />
      </div>
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label htmlFor="email" className="block text-xs font-medium text-slate-700">Email</label>
  <Input id="email" name="email" value={formData.email ?? ''} onChange={handleChange} error={formErrors.email} placeholder="e.g., info@org.com" />
      </div>
      <div>
        <label htmlFor="websiteUrl" className="block text-xs font-medium text-slate-700">Website URL</label>
  <Input id="websiteUrl" name="websiteUrl" value={formData.websiteUrl ?? ''} onChange={handleChange} error={formErrors.websiteUrl} placeholder="e.g., https://org.com" />
      </div>
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label htmlFor="headOfOrganization" className="block text-xs font-medium text-slate-700">Head of Organization</label>
  <Input id="headOfOrganization" name="headOfOrganization" value={formData.headOfOrganization ?? ''} onChange={handleChange} error={formErrors.headOfOrganization} placeholder="e.g., John Doe" />
      </div>
      <div>
        <label htmlFor="academicYearStart" className="block text-xs font-medium text-slate-700">Academic Year Start</label>
        <Input
          id="academicYearStart"
          type="date"
          name="academicYearStart"
          value={formData.academicYearStart ? formData.academicYearStart.substring(0, 10) : ''}
          onChange={handleChange}
          error={formErrors.academicYearStart}
        />
      </div>
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label htmlFor="academicYearEnd" className="block text-xs font-medium text-slate-700">Academic Year End</label>
        <Input
          id="academicYearEnd"
          type="date"
          name="academicYearEnd"
          value={formData.academicYearEnd ? formData.academicYearEnd.substring(0, 10) : ''}
          onChange={handleChange}
          error={formErrors.academicYearEnd}
        />
      </div>
      <div>
        <label htmlFor="timezone" className="block text-xs font-medium text-slate-700">Timezone</label>
  <Input id="timezone" name="timezone" value={formData.timezone ?? ''} onChange={handleChange} error={formErrors.timezone} placeholder="e.g., Asia/Kolkata" />
      </div>
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label htmlFor="currency" className="block text-xs font-medium text-slate-700">Currency</label>
  <Input id="currency" name="currency" value={formData.currency ?? ''} onChange={handleChange} error={formErrors.currency} placeholder="e.g., INR" />
      </div>
      <div>
        <label htmlFor="locale" className="block text-xs font-medium text-slate-700">Locale</label>
  <Input id="locale" name="locale" value={formData.locale ?? ''} onChange={handleChange} error={formErrors.locale} placeholder="e.g., en-IN" />
      </div>
    </div>
    <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200/60">
      <Button type="button" variant="secondary" size="sm" onClick={() => { resetForm(); if (typeof onCancel === 'function') onCancel(); }}>Cancel</Button>
      <Button type="submit" variant="primary" size="sm" disabled={isSubmitting} loading={isSubmitting}>{defaultValues ? 'Update' : 'Create'}</Button>
    </div>
  </form>
  );
}
