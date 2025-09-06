"use client";
import React, { useRef } from "react";
import { format } from 'date-fns';
import { useFeegroup } from "@/features/student/hooks/FeeManagement/useFeegroup";
import { useClasses } from "@/features/student/hooks/master/useClasses";
import { useSemister } from "@/features/student/hooks/master/useSemister";
import { useAcademicYears } from "@/features/Administration/hooks/useAcademicYears";
import { Edit, Trash2, ArrowUpDown, ChevronUp, ChevronDown } from 'lucide-react';
import { FeeStructure } from "@/features/student/types/FeeManagement/feestructureType";
import { Loader } from '@/app/components/ui/Loader';

function getStatusBadgeClasses(isActive: boolean): string {
	return isActive
		? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
		: 'bg-red-100 text-red-800 border-red-200';
}

interface FeeStructureListProps {
	feestructures: FeeStructure[];
	loading?: boolean;
	onEdit: (structure: FeeStructure) => void;
	onDelete: (id: string) => void;
	sortBy?: keyof FeeStructure;
	sortOrder?: 'asc' | 'desc';
	onSortChange?: (column: keyof FeeStructure) => void;
	bulkUpdateMode?: boolean;
	isSelected?: (id: string) => boolean;
	isAllSelected?: boolean;
	isIndeterminate?: boolean;
	toggleItem?: (id: string) => void;
	toggleSelectAll?: () => void;
}

const FeeStructureList: React.FC<FeeStructureListProps> = ({ feestructures, loading, onEdit, onDelete, sortBy, sortOrder, onSortChange, bulkUpdateMode, isSelected, isAllSelected, isIndeterminate, toggleItem, toggleSelectAll }) => {
	// Fetch master data
	const { feegroups } = useFeegroup();
	const { classes } = useClasses();
	const { semisters } = useSemister();
	const { academicYears } = useAcademicYears();

	// Build lookup maps
	const feeGroupMap = React.useMemo(() => Object.fromEntries(feegroups.map(fg => [fg.id, fg.FeeGroupName])), [feegroups]);
	const classMap = React.useMemo(() => Object.fromEntries(classes.map(cls => [cls.id, cls.className])), [classes]);
	const semesterMap = React.useMemo(() => Object.fromEntries(semisters.map(sm => [sm.id, sm.semesterName])), [semisters]);
	const academicYearMap = React.useMemo(() => Object.fromEntries(academicYears.map(ay => [ay.id, ay.yearCode])), [academicYears]);

		// Map IDs to names for display and format dates
		const mappedStructures = React.useMemo(() => feestructures.map(structure => ({
			...structure,
			feeGroupId: feeGroupMap[structure.feeGroupId] || structure.feeGroupId,
			classId: classMap[structure.classId] || structure.classId,
			semesterId: semesterMap[structure.semesterId] || structure.semesterId,
			academicYearId: academicYearMap[structure.academicYearId] || structure.academicYearId,
			startDate: structure.startDate ? format(new Date(structure.startDate), 'dd/MM/yyyy') : '',
			endDate: structure.endDate ? format(new Date(structure.endDate), 'dd/MM/yyyy') : '',
		})), [feestructures, feeGroupMap, classMap, semesterMap, academicYearMap]);

	const selectAllRef = useRef<HTMLInputElement>(null);
	React.useEffect(() => {
		if (selectAllRef.current) {
			selectAllRef.current.indeterminate = !!isIndeterminate;
		}
	}, [isIndeterminate]);
	return (
		<div className="overflow-x-auto">
			<table className="min-w-full divide-y divide-slate-200/60">
				<thead className="bg-slate-50/50">
					<tr>
						{bulkUpdateMode && (
							<th className="px-4 py-2.5 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
								<input
									type="checkbox"
									checked={isAllSelected}
									ref={selectAllRef}
									onChange={toggleSelectAll}
									className="form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded"
									title="Select All"
								/>
							</th>
						)}
						<th className="px-4 py-2.5 text-left text-xs font-medium text-slate-600 tracking-wider">
							<button type="button" className="inline-flex items-center space-x-1" onClick={() => onSortChange?.('feeGroupId')}>
								<span>Fee Group</span>
								{sortBy === 'feeGroupId' ? (
									sortOrder === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
								) : (
									<ArrowUpDown size={12} className="opacity-50" />
								)}
							</button>
						</th>
						<th className="px-4 py-2.5 text-left text-xs font-medium text-slate-600 tracking-wider">Class</th>
						<th className="px-4 py-2.5 text-left text-xs font-medium text-slate-600 tracking-wider">Semester</th>
						<th className="px-4 py-2.5 text-left text-xs font-medium text-slate-600 tracking-wider">Academic Year</th>
						<th className="px-4 py-2.5 text-left text-xs font-medium text-slate-600 tracking-wider">Start Date</th>
						<th className="px-4 py-2.5 text-left text-xs font-medium text-slate-600 tracking-wider">End Date</th>
						<th className="px-4 py-2.5 text-left text-xs font-medium text-slate-600 tracking-wider">Active</th>
						<th className="px-4 py-2.5 text-left text-xs font-medium text-slate-600 tracking-wider">Actions</th>
					</tr>
				</thead>
				<tbody className="bg-white divide-y divide-slate-200/60">
					{loading ? (
						<tr>
							<td colSpan={bulkUpdateMode ? 9 : 8}>
								<div className="flex justify-center py-8">
									<Loader variant="dots" size="lg" text="Loading" />
								</div>
							</td>
						</tr>
					) : !mappedStructures || mappedStructures.length === 0 ? (
						<tr>
							<td colSpan={bulkUpdateMode ? 9 : 8} className="px-4 py-6 text-center text-slate-500 text-xs">
								No fee structures found.
							</td>
						</tr>
					) : (
						mappedStructures.map((structure: FeeStructure) => (
							<tr key={structure.id} className="hover:bg-slate-50/50 transition-colors duration-150">
								{bulkUpdateMode && (
									<td className="px-4 py-3 whitespace-nowrap">
										<input
											type="checkbox"
											checked={isSelected?.(structure.id as string)}
											onChange={() => toggleItem?.(structure.id as string)}
											className="form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded"
											title="Select Structure"
										/>
									</td>
								)}
								<td className="px-4 py-3 whitespace-nowrap">
									<div className="text-xs font-medium text-slate-900">{structure.feeGroupId}</div>
								</td>
								<td className="px-4 py-3 whitespace-nowrap">
									<div className="text-xs font-medium text-slate-900">{structure.classId}</div>
								</td>
								<td className="px-4 py-3 whitespace-nowrap">
									<div className="text-xs font-medium text-slate-900">{structure.semesterId}</div>
								</td>
								<td className="px-4 py-3 whitespace-nowrap">
									<div className="text-xs font-medium text-slate-900">{structure.academicYearId}</div>
								</td>
								<td className="px-4 py-3 whitespace-nowrap">
									<div className="text-xs font-medium text-slate-900">{structure.startDate}</div>
								</td>
								<td className="px-4 py-3 whitespace-nowrap">
									<div className="text-xs font-medium text-slate-900">{structure.endDate}</div>
								</td>
								<td className="px-4 py-3 whitespace-nowrap">
									<span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClasses(structure.isActive)}`}>
										{structure.isActive ? 'Yes' : 'No'}
									</span>
								</td>
								<td className="px-4 py-3 whitespace-nowrap text-xs font-medium">
									<div className="flex items-center space-x-1.5">
										<button
											onClick={() => onEdit(structure)}
											className="group inline-flex items-center justify-center h-7 w-7 rounded-md border border-slate-200 bg-white hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 shadow-sm hover:shadow-md"
											title="Edit Structure"
										>
											<Edit className="h-3.5 w-3.5 text-slate-500 group-hover:text-blue-600 transition-colors duration-200" />
										</button>
										<button
											onClick={() => onDelete(structure.id as string)}
											className="group inline-flex items-center justify-center h-7 w-7 rounded-md border border-red-200 bg-red-50 hover:bg-red-100 hover:border-red-300 transition-all duration-200 shadow-sm hover:shadow-md"
											title="Delete Structure"
										>
											<Trash2 className="h-3.5 w-3.5 text-red-500 group-hover:text-red-700 transition-colors duration-200" />
										</button>
									</div>
								</td>
							</tr>
						))
					)}
				</tbody>
			</table>
		</div>
	);
};

export default FeeStructureList;
