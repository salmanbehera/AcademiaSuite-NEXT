"use client";
import React, { useState } from 'react';
import PersonalInfoForm from './steps/PersonalInfoForm';
import AddressForm from './steps/AddressForm';
import IdentificationInfoForm from './steps/IdentificationInfoForm';
import BankDetailsForm from './steps/BankDetailsForm';
import EmergencyContactForm from './steps/EmergencyContactForm';
import ClassEnrollmentForm from './steps/ClassEnrollmentForm';
import FamilyMembersForm from './steps/FamilyMembersForm';
import HealthRecordForm from './steps/HealthRecordForm';
import PreviousSchoolDetailsForm from './steps/PreviousSchoolDetailsForm';
import ExtraCurricularsForm from './steps/ExtraCurricularsForm';
import AcademicHistoriesForm from './steps/AcademicHistoriesForm';
import HostelDetailsForm from './steps/HostelDetailsForm';
import TransportDetailsForm from './steps/TransportDetailsForm';
import { useAcademicYears } from '@/features/Administration/hooks/useAcademicYears';
import { useClasses } from '@/features/student/hooks/master/useClasses';
import { useSections } from '@/features/student/hooks/master/useSections';
import { Button } from '@/app/components/ui/Button';

const steps = [
  'Personal Info',
  'Class Enrollments',
  'Address',
  'Identification Details',
  'Family Members',
  'Bank Details',
  'Emergency Contact',
  'Health Records',
  'Previous School Details',
  'Extra Curriculars',
  'Academic Histories',
  'Hostel Details',
  'Transport Details'
];

export default function StudentEnrollmentStepper({ initialData, onSubmit }: { initialData?: any; onSubmit: (data: any) => void }) {

  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState(initialData || {});

  // Academic Years
  const { academicYears, loading: loadingYears } = useAcademicYears();
  // Classes
  const { classes, loading: loadingClasses } = useClasses({ autoFetch: true });
  // Sections
  const { sections, loading: loadingSections } = useSections({ autoFetch: true });

  const handleNext = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const handlePrev = () => setStep((s) => Math.max(s - 1, 0));
  const handleChange = (section: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [section]: value }));
  };
  const handleFinalSubmit = () => onSubmit(formData);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 to-white rounded shadow pl-4 pr-4 overflow-x-auto">
      {/* Vertical Professional Stepper */}
      <div className="flex gap-8 mb-8">
  <div className="flex flex-col items-start min-w-[120px] max-w-[150px]">
          {steps.map((label, idx) => (
            <React.Fragment key={label}>
              <button
                type="button"
                onClick={() => setStep(idx)}
                className="flex items-center mb-2 focus:outline-none group"
                tabIndex={0}
              >
                <div className={`flex items-center justify-center w-6 h-6 rounded-full border-2 transition-all duration-200
                  ${idx === step ? 'bg-blue-600 border-blue-600 text-white' : idx < step ? 'bg-blue-100 border-blue-400 text-blue-600' : 'bg-white border-slate-300 text-slate-400'}
                  group-hover:border-blue-400 group-hover:text-blue-600`}
                >
                  <span className="text-xs font-semibold">{idx + 1}</span>
                </div>
                <span className={`ml-3 text-[12px] font-medium whitespace-nowrap ${idx === step ? 'text-blue-700' : 'text-slate-500'} group-hover:text-blue-600`}>{label}</span>
              </button>
              {idx < steps.length - 1 && (
                <div className="ml-2 h-4 border-l-2 border-slate-200" />
              )}
            </React.Fragment>
          ))}
        </div>
        <div className="flex-1">
      {/* Step Content */}
          {step === 0 && <PersonalInfoForm />}
          {step === 1 && (
            loadingYears || loadingClasses || loadingSections ? (
              <div className="py-8 text-center text-slate-500">Loading class enrollment controls...</div>
            ) :
            (academicYears?.length === 0 || classes?.length === 0 || sections?.length === 0) ? (
              <div className="py-8 text-center text-slate-500">No academic years, classes, or sections available. Please set up master data first.</div>
            ) : (
              <ClassEnrollmentForm
                academicYears={formData.academicYears || []}
                classes={formData.classes || []}
                sections={formData.sections || []}
              />
            )
          )}
          {step === 2 && <AddressForm />}
          {step === 3 && <IdentificationInfoForm />}
          {step === 4 && (
            <FamilyMembersForm />
          )}
          {step === 5 && <BankDetailsForm />}
          {step === 6 && <EmergencyContactForm />}
          {step === 7 && <HealthRecordForm />}
          {step === 8 && <PreviousSchoolDetailsForm />}
          {step === 10 && (
            <ExtraCurricularsForm />
          )}
          {step === 11 && (
            <AcademicHistoriesForm
              data={formData.academicHistories || [{ institutionName: '', courseName: '', startDate: '', endDate: '', gradeOrPercentage: '' }]}
              onChange={(v: any) => handleChange('academicHistories', v)}
            />
          )}
          {step === 12 && <HostelDetailsForm />}
          {step === 13 && <TransportDetailsForm />}
          {/* Navigation */}
          {/* <div className="flex justify-between mt-8 gap-3">
            <button
              className="px-3 py-1.5 rounded-md border border-slate-300 bg-white text-slate-700 font-medium text-sm shadow-sm transition hover:bg-slate-100 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:opacity-60 disabled:cursor-not-allowed"
              onClick={handlePrev}
              disabled={step === 0}
            >
              <span className="inline-flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                Previous
              </span>
            </button>
            {step < steps.length - 1 ? (
              <button
                className="px-3 py-1.5 rounded-md border border-[#0f172a] bg-[#0f172a] text-white font-medium text-sm shadow-sm transition hover:bg-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#0f172a]/30"
                onClick={handleNext}
              >
                <span className="inline-flex items-center gap-1">
                  Next
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                </span>
              </button>
            ) : (
              <button
                className="px-3 py-1.5 rounded-md border border-green-600 bg-green-600 text-white font-medium text-sm shadow-sm transition hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-200"
                onClick={handleFinalSubmit}
              >
                Submit
              </button>
            )}
          </div> */}
          {/* Center-aligned Save and Cancel buttons with updated design */}
          <div className="flex justify-center mt-8 gap-3">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setStep((s) => Math.max(s - 1, 0))}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={false}
              loading={false}
              onClick={() => {
                handleChange(steps[step], formData[steps[step]]); // Save current step data
                if (step === steps.length - 1) {
                  handleFinalSubmit();
                }
              }}
            >
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
