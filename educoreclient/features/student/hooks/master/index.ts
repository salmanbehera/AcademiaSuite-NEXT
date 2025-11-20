// Master data hooks for student feature
export { useStudents } from "./useStudents";
export { useClasses } from "./useClasses";
export { useSections } from "./useSections";
export { useStudentCategories } from "./useStudentCategories";

// Optimized hooks with generic CRUD
export { useClassesOptimized } from "./useClassesOptimized";

// Query hooks with React Query integration
export {
  useStudentCategoriesQuery,
  studentCategoryQueryKeys,
} from "./useStudentCategoriesQuery";
export { useClassesQuery, classQueryKeys } from "./useClassesQuery";
export { useClassesQuerySimple } from "./useClassesQuerySimple";
export { useSectionsQuery, sectionQueryKeys } from "./useSectionsQuery";

// Performance hooks
export { useStudentCategoryPerformance } from "./useStudentCategoryPerformance";
export { useClassPerformance } from "./useClassPerformance";
export { useSectionPerformance } from "./useSectionPerformance";

// Export types
export type {
  UseStudentCategoriesOptions,
  UseStudentCategoriesReturn,
} from "./useStudentCategories";

export type { UseClassesOptions, UseClassesReturn } from "./useClasses";

export type { UseSectionsOptions, UseSectionsReturn } from "./useSections";

export type { UseClassesOptimizedReturn } from "./useClassesOptimized";
