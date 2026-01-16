
export enum SchoolLevel {
  KINDERGARTEN = 'رياض الأطفال',
  PRIMARY = 'الابتدائية',
  GIRLS_SECONDARY = 'ثانوية البنات',
  BOYS_SECONDARY = 'ثانوية البنين'
}

export enum Day {
  SUNDAY = 'الأحد',
  MONDAY = 'الاثنين',
  TUESDAY = 'الثلاثاء',
  WEDNESDAY = 'الأربعاء',
  THURSDAY = 'الخميس'
}

export type ViewType = 'dashboard' | 'schedules' | 'master' | 'teachers_view' | 'management' | 'reports' | 'salaries' | 'absences' | 'holidays' | 'teachers_manage' | 'users_manage' | 'subjects_manage';

export type ReportMode = 'single-level' | 'single-teacher' | 'all-levels' | 'all-staff' | 'master-summary';

export interface PrintSettings {
  orientation: 'landscape' | 'portrait';
  paperSize: 'A4' | 'A3' | 'Letter';
  fontScale: number;
  showHeaderLogo: boolean;
  showSignatureFields: boolean;
}

export interface Subject {
  id: string;
  name: string;
  level: SchoolLevel;
  grade: string;
  price: number;
  sessionsPerWeek: number; // عدد الحصص المطلوب توزيعها في الأسبوع
}

export interface User {
  id: string;
  username: string;
  password: string;
  role: 'admin' | 'staff';
  permissions: ViewType[];
}

export interface Teacher {
  id: string;
  name: string;
  phoneNumber: string;
  specialization: string;
  subjects: string[]; // Stores subject NAMES for compatibility
  assignedSubjectIds?: string[]; // Stores IDs of specific Subject entities
  jobType: 'أهلي' | 'حكومي';
  lecturePrice: number;
}

export interface PricingRule {
  id: string;
  level: SchoolLevel;
  grade: string;
  subject: string;
  price: number;
}

export interface Absence {
  id: string;
  teacherId: string;
  day: Day;
  date: string;
}

export interface Holiday {
  id: string;
  name: string;
  startDate: string;
  daysCount: number;
  exceptionTeacherIds: string[]; // IDs of teachers who worked during this holiday
}

export interface InstitutionInfo {
  name: string;
  logo: string;
  welcomeTitle?: string;   // عنوان الرسالة الترحيبية
  welcomeMessage?: string; // محتوى الرسالة الترحيبية
}

export interface ScheduleEntry {
  id: string;
  day: Day;
  period: number;
  level: SchoolLevel;
  grade: string;
  teacherId: string;
  subject: string;
}

export interface Conflict {
  entryA: ScheduleEntry;
  entryB: ScheduleEntry;
  teacherName: string;
  day: Day;
  period: number;
}

export interface SalaryRecord {
  id: string;
  teacherId: string;
  teacherName: string;
  startDate: string; // بداية الفترة
  endDate: string;   // نهاية الفترة
  month?: number;    // اختياري للتوافقية
  year?: number;     // اختياري للتوافقية
  totalLectures: number;
  nominalSalary: number;
  rewards: number;
  absenceDeduction: number;
  holidayDeduction: number; // New field for holiday deductions
  otherDeduction: number;
  netSalary: number;
  archivedAt: string;
}
