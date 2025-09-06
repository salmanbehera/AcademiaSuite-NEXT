// 'use client';

// import { useCallback } from 'react';
// import { Section, SectionDto } from '@/types/api-types';
// import { SectionService } from '@/features/student/services/master';
// import { useEntityManager, EntityManagerOptions, EntityManagerReturn } from '@/hooks/shared/useEntityManager';

// // Service adapter to match EntityManager interface
// const sectionServiceAdapter = {
//   getEntities: async (params: any) => {
//     const response = await SectionService.getSections(params);
//     return {
//       data: response.sectiondto.data,
//       count: response.sectiondto.count
//     };
//   },
//   createEntity: async (entityData: SectionDto) => {
//     return await SectionService.createSection(entityData);
//   },
//   updateEntity: async (id: string, entityData: Partial<SectionDto>) => {
//     return await SectionService.updateSection(id, entityData);
//   }
// };

// export interface UseSectionsOptions extends EntityManagerOptions {}

// export interface UseSectionsReturn extends EntityManagerReturn<Section, SectionDto> {
//   // Alias methods with domain-specific names
//   sections: Section[];
//   fetchSections: () => Promise<void>;
//   createSection: (sectionData: Omit<SectionDto, 'organizationId' | 'branchId' | 'id' | 'createdAt' | 'updatedAt'>) => Promise<Section | null>;
//   updateSection: (id: string, sectionData: Partial<SectionDto>) => Promise<Section | null>;
//   deleteSection: (id: string) => Promise<boolean>;
//   bulkDeleteSections: (ids: string[]) => Promise<boolean>;
//   toggleSectionStatus: (id: string, isActive: boolean) => Promise<boolean>;
  
//   // Enhanced section-specific methods
//   importSections: (file: File, onProgress?: (progress: number) => void) => Promise<{ success: number; errors: any[] } | null>;
// }

// export function useSectionsRefactored(options: UseSectionsOptions = {}): UseSectionsReturn {
//   const baseManager = useEntityManager(sectionServiceAdapter, 'section', options);

//   // Import sections from file (section-specific functionality)
//   const importSections = useCallback(async (
//     file: File,
//     onProgress?: (progress: number) => void
//   ): Promise<{ success: number; errors: any[] } | null> => {
//     try {
      
//       // Parse CSV file on client side
//       const result = await new Promise<{ success: number; errors: any[] }>((resolve, reject) => {
//         const reader = new FileReader();
        
//         reader.onload = async (e) => {
//           try {
//             const text = e.target?.result as string;
//             const lines = text.trim().split('\n');
//             const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
            
//             // Expected headers mapping
//             const headerMap: Record<string, string> = {
//               'Section Name': 'sectionName',
//               'Section Code': 'sectionShortName', 
//               'Display Order': 'displayOrder',
//               'Max Strength': 'maxStrength',
//               'Class ID': 'classId',
//               'Status': 'isActive'
//             };

//             const errors: any[] = [];
//             const successes: any[] = [];
            
//             // Process each row
//             for (let i = 1; i < lines.length; i++) {
//               try {
//                 if (onProgress) {
//                   onProgress((i / (lines.length - 1)) * 100);
//                 }

//                 const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
                
//                 if (values.length !== headers.length) {
//                   errors.push({
//                     row: i + 1,
//                     message: `Row has ${values.length} columns, expected ${headers.length}`
//                   });
//                   continue;
//                 }

//                 // Map CSV data to SectionDto format
//                 const sectionData: any = {};
                
//                 headers.forEach((header, index) => {
//                   const mappedField = headerMap[header];
//                   if (mappedField) {
//                     let value: any = values[index];
                    
//                     // Convert data types
//                     if (mappedField === 'displayOrder' || mappedField === 'maxStrength') {
//                       value = parseInt(value) || 0;
//                     } else if (mappedField === 'isActive') {
//                       value = value && value.toLowerCase() === 'active';
//                     }
                    
//                     sectionData[mappedField] = value;
//                   }
//                 });

//                 // Validate required fields
//                 if (!sectionData.sectionName || !sectionData.sectionShortName || !sectionData.classId) {
//                   errors.push({
//                     row: i + 1,
//                     message: 'Section Name, Section Code, and Class ID are required'
//                   });
//                   continue;
//                 }

//                 // Create the section
//                 try {
//                   await baseManager.createEntity(sectionData);
//                   successes.push(sectionData);
//                 } catch (apiError: any) {
//                   errors.push({
//                     row: i + 1,
//                     message: `Failed to create section: ${apiError.message || apiError}`
//                   });
//                 }
                
//               } catch (rowError: any) {
//                 errors.push({
//                   row: i + 1,
//                   message: `Error processing row: ${rowError.message || rowError}`
//                 });
//               }
//             }

//             resolve({
//               success: successes.length,
//               errors: errors
//             });
            
//           } catch (error) {
//             reject(error);
//           }
//         };
        
//         reader.onerror = () => reject(new Error('Failed to read file'));
//         reader.readAsText(file);
//       });
      
//       // Refresh the sections list after successful import
//       await baseManager.refresh();
      
//       return result;
//     } catch (err) {
//       console.error('Failed to import sections:', err);
//       return null;
//     }
//   }, [baseManager]);

//   return {
//     // Base manager properties with aliases
//     sections: baseManager.entities,
//     loading: baseManager.loading,
//     error: baseManager.error,
//     totalCount: baseManager.totalCount,
//     pageIndex: baseManager.pageIndex,
//     pageSize: baseManager.pageSize,
    
//     // Base manager methods with aliases
//     fetchSections: baseManager.fetchEntities,
//     createSection: baseManager.createEntity,
//     updateSection: baseManager.updateEntity,
//     deleteSection: baseManager.deleteEntity,
//     bulkDeleteSections: baseManager.bulkDeleteEntities,
//     toggleSectionStatus: baseManager.toggleEntityStatus,
    
//     // Pagination (pass through)
//     setPageIndex: baseManager.setPageIndex,
//     setPageSize: baseManager.setPageSize,
//     nextPage: baseManager.nextPage,
//     prevPage: baseManager.prevPage,
    
//     // Refresh
//     refresh: baseManager.refresh,
    
//     // Generic entity manager properties (for compatibility)
//     entities: baseManager.entities,
//     fetchEntities: baseManager.fetchEntities,
//     createEntity: baseManager.createEntity,
//     updateEntity: baseManager.updateEntity,
//     deleteEntity: baseManager.deleteEntity,
//     bulkDeleteEntities: baseManager.bulkDeleteEntities,
//     toggleEntityStatus: baseManager.toggleEntityStatus,
    
//     // Section-specific functionality
//     importSections,
//   };
// }
