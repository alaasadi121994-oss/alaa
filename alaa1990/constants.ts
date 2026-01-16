
import { Day, SchoolLevel, Teacher, Subject } from './types';

export const DAYS = [Day.SUNDAY, Day.MONDAY, Day.TUESDAY, Day.WEDNESDAY, Day.THURSDAY];
export const PERIODS = [1, 2, 3, 4, 5, 6, 7];
export const LEVELS = [
  SchoolLevel.KINDERGARTEN,
  SchoolLevel.PRIMARY,
  SchoolLevel.GIRLS_SECONDARY,
  SchoolLevel.BOYS_SECONDARY
];

export const GRADES_BY_LEVEL: Record<SchoolLevel, string[]> = {
  [SchoolLevel.KINDERGARTEN]: ['التمهيدي الأول', 'التمهيدي الثاني'],
  [SchoolLevel.PRIMARY]: ['الصف الأول', 'الصف الثاني', 'الصف الثالث', 'الصف الرابع', 'الصف الخامس', 'الصف السادس'],
  [SchoolLevel.GIRLS_SECONDARY]: ['الأول المتوسط', 'الثاني المتوسط', 'الثالث المتوسط', 'الرابع الإعدادي', 'الخامس الإعدادي', 'السادس الإعدادي'],
  [SchoolLevel.BOYS_SECONDARY]: ['الأول المتوسط', 'الثاني المتوسط', 'الثالث المتوسط', 'الرابع الإعدادي', 'الخامس الإعدادي', 'السادس الإعدادي']
};

export const INITIAL_TEACHERS: Teacher[] = [
  { 
    id: 't1', 
    name: 'أحمد علي', 
    phoneNumber: '07701234567', 
    specialization: 'رياضيات', 
    subjects: ['رياضيات'], 
    assignedSubjectIds: ['s1'],
    jobType: 'حكومي', 
    lecturePrice: 0 
  },
  { 
    id: 't2', 
    name: 'سارة محمد', 
    phoneNumber: '07801234567', 
    specialization: 'لغة عربية', 
    subjects: ['لغة عربية'], 
    assignedSubjectIds: ['s2'],
    jobType: 'أهلي', 
    lecturePrice: 15000 
  },
];

// Added missing sessionsPerWeek property to each subject object
export const INITIAL_SUBJECTS: Subject[] = [
  { id: 's1', name: 'رياضيات', level: SchoolLevel.PRIMARY, grade: 'الصف الرابع', price: 15000, sessionsPerWeek: 4 },
  { id: 's2', name: 'لغة عربية', level: SchoolLevel.PRIMARY, grade: 'الصف الرابع', price: 12000, sessionsPerWeek: 4 },
  { id: 's3', name: 'علوم', level: SchoolLevel.PRIMARY, grade: 'الصف الرابع', price: 10000, sessionsPerWeek: 4 },
  { id: 's4', name: 'اللغة الانجليزية', level: SchoolLevel.BOYS_SECONDARY, grade: 'الأول المتوسط', price: 20000, sessionsPerWeek: 4 },
];
