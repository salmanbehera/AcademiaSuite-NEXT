import React, { useRef } from "react";
import { Edit, Trash2, ArrowUpDown, ChevronUp, ChevronDown } from 'lucide-react';
import { FeeHead } from "@/features/student/types/FeeManagement/feeheadType";
import { Loader } from '@/app/components/ui/Loader';

function getActiveBadgeClasses(isActive: boolean): string {
	return isActive ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-red-100 text-red-800 border border-red-200';
}

interface FeeHeadListProps {
	feeheads: FeeHead[];
	loading?: boolean;
	onEdit: (feehead: FeeHead) => void;
	onDelete: (id: string) => void;
	sortBy?: keyof FeeHead;
	sortOrder?: 'asc' | 'desc';
	onSortChange?: (column: keyof FeeHead) => void;
	bulkUpdateMode?: boolean;
	isSelected?: (id: string) => boolean;
	isAllSelected?: boolean;
	isIndeterminate?: boolean;
	toggleItem?: (id: string) => void;
	toggleSelectAll?: () => void;
}

const FeeHeadList: React.FC<FeeHeadListProps> = ({ feeheads, loading, onEdit, onDelete, sortBy, sortOrder, onSortChange, bulkUpdateMode, isSelected, isAllSelected, isIndeterminate, toggleItem, toggleSelectAll }) => {
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
						<th className="px-4 py-2.5 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
							<button type="button" className="inline-flex items-center space-x-1" onClick={() => onSortChange?.('FeeHeadCode')}>
								<span>Fee Head Code</span>
								{sortBy === 'FeeHeadCode' ? (
									sortOrder === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
								) : (
									<ArrowUpDown size={12} className="opacity-50" />
								)}
							</button>
						</th>
						<th className="px-4 py-2.5 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
							<button type="button" className="inline-flex items-center space-x-1" onClick={() => onSortChange?.('FeeHeadName')}>
								<span>Fee Head Name</span>
								{sortBy === 'FeeHeadName' ? (
									sortOrder === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
								) : (
									<ArrowUpDown size={12} className="opacity-50" />
								)}
							</button>
						</th>
						<th className="px-4 py-2.5 text-left text-xs font-medium text-slate-600">Frequency</th>
						<th className="px-4 py-2.5 text-left text-xs font-medium text-slate-600">Default GL Code</th>
						<th className="px-4 py-2.5 text-left text-xs font-medium text-slate-600">Refundable</th>
						<th className="px-4 py-2.5 text-left text-xs font-medium text-slate-600">Active</th>
						<th className="px-4 py-2.5 text-left text-xs font-medium text-slate-600">Actions</th>
					</tr>
				</thead>
				<tbody className="bg-white divide-y divide-slate-200/60">
					{loading ? (
						<tr>
							<td colSpan={bulkUpdateMode ? 8 : 7}>
								<div className="flex justify-center py-8">
									<Loader variant="dots" size="lg" text="Loading" />
								</div>
							</td>
						</tr>
					) : !feeheads || feeheads.length === 0 ? (
						<tr>
							<td colSpan={bulkUpdateMode ? 8 : 7} className="px-4 py-6 text-center text-slate-500 text-xs">
								No fee heads found.
							</td>
						</tr>
					) : (
						feeheads.map((feehead: FeeHead) => (
							<tr key={feehead.id} className="hover:bg-slate-50/50 transition-colors duration-150">
								{bulkUpdateMode && (
									<td className="px-4 py-3 whitespace-nowrap">
										<input
											type="checkbox"
											checked={isSelected?.(feehead.id)}
											onChange={() => toggleItem?.(feehead.id)}
											className="form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded"
											title="Select Fee Head"
										/>
									</td>
								)}
								<td className="px-4 py-3 whitespace-nowrap">
									<div className="flex items-center">
										<div className="w-8 h-8 bg-gradient-to-br from-slate-700 to-slate-900 rounded-lg flex items-center justify-center shadow-sm">
											<span className="text-white font-semibold text-xs">{feehead.FeeHeadCode}</span>
										</div>
										<div className="ml-3">
											<div className="text-xs font-medium text-slate-900">{feehead.FeeHeadCode}</div>
										</div>
									</div>
								</td>
								<td className="px-4 py-3 whitespace-nowrap">
									<div className="text-xs font-medium text-slate-900">{feehead.FeeHeadName}</div>
								</td>
								<td className="px-4 py-3 whitespace-nowrap">
									<div className="text-xs font-medium text-slate-900">{feehead.FeeFrequency}</div>
								</td>
								<td className="px-4 py-3 whitespace-nowrap">
									<div className="text-xs font-medium text-slate-900">{feehead.DefaultGLCode || '-'}</div>
								</td>
								<td className="px-4 py-3 whitespace-nowrap">
									<span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${feehead.IsRefundable ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-slate-100 text-slate-700 border border-slate-200'}`}>
										{feehead.IsRefundable ? 'Yes' : 'No'}
									</span>
								</td>
								<td className="px-4 py-3 whitespace-nowrap">
									<span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getActiveBadgeClasses(feehead.IsActive)}`}>
										{feehead.IsActive ? 'Yes' : 'No'}
									</span>
								</td>
								<td className="px-4 py-3 whitespace-nowrap text-xs font-medium">
									<div className="flex items-center space-x-1.5">
										<button
											onClick={() => onEdit(feehead)}
											className="group inline-flex items-center justify-center h-7 w-7 rounded-md border border-slate-200 bg-white hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 shadow-sm hover:shadow-md"
											title="Edit Fee Head"
										>
											<Edit className="h-3.5 w-3.5 text-slate-500 group-hover:text-blue-600 transition-colors duration-200" />
										</button>
										<button
											onClick={() => onDelete(feehead.id)}
											className="group inline-flex items-center justify-center h-7 w-7 rounded-md border border-red-200 bg-red-50 hover:bg-red-100 hover:border-red-300 transition-all duration-200 shadow-sm hover:shadow-md"
											title="Delete Fee Head"
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

export default FeeHeadList;
