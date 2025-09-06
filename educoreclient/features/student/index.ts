// Student Feature Exports

// Master Pages
export { default as ClassPage } from './pages/master/class';
export { default as SectionPage } from './pages/master/section';
export { default as StudentCategoryPage } from './pages/master/studentcategory';

// Components (when we move them)
// export { default as ClassManager } from './components/ClassManager';
// export { default as SectionManager } from './components/SectionManager';

// Master Hooks
export { 
  useClasses,
  useSections,
  useStudents,
  useStudentCategories,
  useStudentCategoriesQuery,
  useStudentCategoryPerformance,
  useClassesQuery,
  useClassesQuerySimple,
  useSectionsQuery,
  useClassPerformance,
  useSectionPerformance,
  studentCategoryQueryKeys,
  classQueryKeys,
  sectionQueryKeys,
  type UseClassesOptions,
  type UseClassesReturn,
  type UseSectionsOptions,
  type UseSectionsReturn,
  type UseStudentCategoriesOptions,
  type UseStudentCategoriesReturn
} from './hooks/master';

// Services
export { 
  ClassService,
  SectionService,
  StudentCategoryService
} from './services/master';
