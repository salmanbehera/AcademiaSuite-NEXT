"use client";
import React from 'react';
import StudentEnrollmentStepper from './StudentEnrollmentStepper';

export default function StudentEnrollmentForm() {
	// You can handle form submission here
	const handleSubmit = (data: any) => {
		// TODO: connect to API or handle data
		console.log('Submitted student data:', data);
	};
	return (
		<StudentEnrollmentStepper onSubmit={handleSubmit} />
	);
}
