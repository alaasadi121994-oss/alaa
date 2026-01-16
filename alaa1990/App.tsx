
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { 
  SchoolLevel, 
  Day, 
  Teacher, 
  ScheduleEntry, 
  Conflict,
  InstitutionInfo,
  PricingRule,
  Absence,
  User,
  ViewType,
  ReportMode,
  Subject,
  PrintSettings,
  SalaryRecord,
  Holiday
} from './types';
import { 
  DAYS, 
  LEVELS, 
  GRADES_BY_LEVEL,
  PERIODS,
  INITIAL_TEACHERS,
  INITIAL_SUBJECTS
} from './constants';
import Dashboard from './components/Dashboard';
import TimetableGrid from './components/TimetableGrid';
import MasterGrid from './components/MasterGrid';
import TeachersManagement from './components/TeachersManagement';
import AbsencesView from './components/AbsencesView';
import UsersManagement from './components/UsersManagement';
import SubjectsManagement from './components/SubjectsManagement';
import ReportView from './components/ReportView';
import Login from './components/Login';
import SalariesView from './components/SalariesView';
import Management from './components/Management';
import HolidaysManagement from './components/HolidaysManagement';
import { findConflicts } from './services/conflictService';

// Welcome Modal Component
const WelcomeModal: React.FC<{ onClose: () => void, title?: string, message?: string }> = ({ onClose, title, message }) => (
  <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[500] p-4 animate-fade-in">
    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden border border-white/50 relative">
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
      <div className="p-8 md:p-10 text-center">
         <div className="w-20 h-20 md:w-24 md:h-24 bg-indigo-50 rounded-full mx-auto flex items-center justify-center mb-6 shadow-inner">
            <svg className="w-10 h-10 md:w-12 md:h-12 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
         </div>
         <h2 className="text-2xl md:text-3xl font-black mb-2 text-slate-800">{title || 'أهلاً بك في نظام الجداول الذكي'}</h2>
         <p className="text-indigo-500 font-bold text-xs md:text-sm uppercase tracking-widest mb-6">نظام إدارة المؤسسات التعليمية</p>
         
         {message ? (
           <div className="bg-slate-50 p-6 rounded-2xl mb-6 text-slate-600 font-bold text-sm leading-relaxed whitespace-pre-line border border-slate-100 max-h-60 overflow-y-auto custom-scrollbar">
             {message}
           </div>
         ) : (
           <div className="space-y-3 text-slate-600 font-bold text-sm leading-relaxed mb-8">
              <p className="flex items-center gap-3 justify-center"><span className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs">✔</span> تم تحميل قاعدة البيانات بنجاح</p>
              <p className="flex items-center gap-3 justify-center"><span className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs">✔</span> النظام جاهز للعمل بدون إنترنت</p>
              <p className="flex items-center gap-3 justify-center"><span className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs">✔</span> التخزين السحابي المحلي مفعل</p>
           </div>
         )}
         
         <button onClick={onClose} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black shadow-xl shadow-slate-200 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group">
           <span>ابدأ العمل الآن</span>
           <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
         </button>
      </div>
    </div>
  </div>
);

const App: React.FC = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [lastSaved, setLastSaved] = useState<string>(new Date().toLocaleTimeString('ar-EG'));
  const [isInstallable, setIsInstallable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  
  // Mobile Sidebar State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Welcome Modal State
  const [showWelcome, setShowWelcome] = useState(false);
  // Logout Confirmation Modal State
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = sessionStorage.getItem('current_user');
    try { return saved ? JSON.parse(saved) : null; } catch { return null; }
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('school_users');
    const defaultAdmin: User = { 
      id: 'admin-id', username: 'admin', password: 'admin', role: 'admin', 
      permissions: ['dashboard', 'schedules', 'master', 'reports', 'salaries', 'absences', 'holidays', 'teachers_manage', 'users_manage', 'subjects_manage', 'management'] 
    };
    return saved ? JSON.parse(saved) : [defaultAdmin];
  });

  const [entries, setEntries] = useState<ScheduleEntry[]>(() => JSON.parse(localStorage.getItem('school_entries') || '[]'));
  const [teachers, setTeachers] = useState<Teacher[]>(() => JSON.parse(localStorage.getItem('school_teachers') || JSON.stringify(INITIAL_TEACHERS)));
  const [subjects, setSubjects] = useState<Subject[]>(() => JSON.parse(localStorage.getItem('school_subjects') || JSON.stringify(INITIAL_SUBJECTS)));
  const [absences, setAbsences] = useState<Absence[]>(() => JSON.parse(localStorage.getItem('school_absences') || '[]'));
  const [holidays, setHolidays] = useState<Holiday[]>(() => JSON.parse(localStorage.getItem('school_holidays') || '[]'));
  const [salaryHistory, setSalaryHistory] = useState<SalaryRecord[]>(() => JSON.parse(localStorage.getItem('school_salary_history') || '[]'));
  const [institution, setInstitution] = useState<InstitutionInfo>(() => JSON.parse(localStorage.getItem('school_institution') || '{"name": "المؤسسة التعليمية الشاملة", "logo": ""}'));
  const [printSettings, setPrintSettings] = useState<PrintSettings>(() => {
    const saved = localStorage.getItem('school_print_settings');
    return saved ? JSON.parse(saved) : { orientation: 'landscape', paperSize: 'A4', fontScale: 1, showHeaderLogo: true, showSignatureFields: true };
  });

  const [activeLevel, setActiveLevel] = useState<SchoolLevel>(SchoolLevel.PRIMARY);
  const [activeGrade, setActiveGrade] = useState<string>(GRADES_BY_LEVEL[SchoolLevel.PRIMARY][0]);
  const [activeDay, setActiveDay] = useState<Day>(Day.SUNDAY);
  const [view, setView] = useState<ViewType>('dashboard'); 
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEntryForm, setNewEntryForm] = useState({ day: Day.SUNDAY, period: 1, grade: '', level: SchoolLevel.PRIMARY, teacherId: '', subject: '' });

  const showToast = useCallback((message: string, type: 'success' | 'info' | 'error' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const handleLevelChange = (lvl: SchoolLevel) => {
    setActiveLevel(lvl);
    setActiveGrade(GRADES_BY_LEVEL[lvl][0]);
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false); // Close sidebar on mobile after selection
    }
  };

  const handleViewChange = (newView: ViewType) => {
    setView(newView);
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false); // Close sidebar on mobile after selection
    }
  }

  useEffect(() => {
    localStorage.setItem('school_users', JSON.stringify(users));
    localStorage.setItem('school_entries', JSON.stringify(entries));
    localStorage.setItem('school_teachers', JSON.stringify(teachers));
    localStorage.setItem('school_subjects', JSON.stringify(subjects));
    localStorage.setItem('school_salary_history', JSON.stringify(salaryHistory));
    localStorage.setItem('school_institution', JSON.stringify(institution));
    localStorage.setItem('school_absences', JSON.stringify(absences));
    localStorage.setItem('school_holidays', JSON.stringify(holidays));
    localStorage.setItem('school_print_settings', JSON.stringify(printSettings));
    setLastSaved(new Date().toLocaleTimeString('ar-EG'));
  }, [users, entries, teachers, subjects, institution, absences, holidays, printSettings, salaryHistory]);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    });
    
    window.addEventListener('app-update-available', () => {
      setUpdateAvailable(true);
    });

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const message = "هل قمت بعمل نسخة احتياطية؟ تأكد من حفظ البيانات قبل المغادرة.";
      e.returnValue = message; 
      return message; 
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    if (currentUser && !sessionStorage.getItem('welcome_shown')) {
      setShowWelcome(true);
      sessionStorage.setItem('welcome_shown', 'true');
    }
  }, [currentUser]);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          setIsInstallable(false);
        }
        setDeferredPrompt(null);
      });
    }
  };

  const handleExportBackup = () => {
    const data = {
      users,
      entries,
      teachers,
      subjects,
      institution,
      absences,
      holidays,
      salaryHistory,
      printSettings,
      backupDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Data_Backup_${new Date().toLocaleDateString().replace(/\//g, '-')}.school`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('تم حفظ قاعدة البيانات بنجاح', 'success');
  };

  const handleExportAllToExcel = () => {
    let csvContent = "\uFEFF";
    csvContent += "Type,Info 1,Info 2,Info 3,Info 4\n";
    
    teachers.forEach(t => csvContent += `Teacher,${t.name},${t.jobType},${t.specialization},${t.phoneNumber}\n`);
    subjects.forEach(s => csvContent += `Subject,${s.name},${s.level},${s.grade},${s.price}\n`);
    entries.forEach(e => {
        const tName = teachers.find(t => t.id === e.teacherId)?.name || '';
        csvContent += `Schedule,${e.day},${e.period},${e.grade} (${e.level}),${e.subject} - ${tName}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Full_System_Data_${new Date().toLocaleDateString().replace(/\//g, '-')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('تم تصدير النظام بالكامل إلى Excel', 'success');
  };

  const handleImportBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          if (data.users) setUsers(data.users);
          if (data.entries) setEntries(data.entries);
          if (data.teachers) setTeachers(data.teachers);
          if (data.subjects) setSubjects(data.subjects);
          if (data.salaryHistory) setSalaryHistory(data.salaryHistory);
          if (data.institution) setInstitution(data.institution);
          if (data.absences) setAbsences(data.absences);
          if (data.holidays) setHolidays(data.holidays);
          if (data.printSettings) setPrintSettings(data.printSettings);
          showToast('تم استعادة قاعدة البيانات بنجاح', 'success');
        } catch (error) {
          alert('ملف قاعدة البيانات غير صالح');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleLogin = (u: string, p: string) => {
    const user = users.find(x => x.username === u && x.password === p);
    if (user) {
      setCurrentUser(user);
      sessionStorage.setItem('current_user', JSON.stringify(user));
      setView(user.permissions[0] || 'dashboard');
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setCurrentUser(null);
    sessionStorage.removeItem('current_user');
    sessionStorage.removeItem('welcome_shown');
    setShowLogoutConfirm(false);
  };

  const handleAddEntry = useCallback((day: Day, period: number, grade?: string, level?: SchoolLevel) => {
    setNewEntryForm({ day, period, grade: grade || activeGrade, level: level || activeLevel, teacherId: '', subject: '' });
    setShowAddModal(true);
  }, [activeGrade, activeLevel]);

  const submitNewEntry = () => {
    if (!newEntryForm.teacherId || !newEntryForm.subject) return alert("يرجى اختيار المدرس والمادة");
    setEntries(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), ...newEntryForm }]);
    setShowAddModal(false);
  };

  const handleAutoGenerateSchedule = () => {
    if (!confirm("هل أنت متأكد؟ سيتم مسح الجدول الحالي وتوليد جدول جديد آلياً بناءً على الكوادر والمواد المتاحة.")) return;
    
    setIsSaving(true);
    const newEntries: ScheduleEntry[] = [];
    const teacherUsage: Record<string, Set<string>> = {}; 

    const shuffle = <T,>(array: T[]): T[] => array.sort(() => Math.random() - 0.5);

    const allGrades: { level: SchoolLevel, grade: string }[] = [];
    LEVELS.forEach(l => GRADES_BY_LEVEL[l].forEach(g => allGrades.push({ level: l, grade: g })));

    let totalTasksFound = 0;

    allGrades.forEach(({ level, grade }) => {
      const gradeTasks: { teacherId: string, subject: Subject }[] = [];

      teachers.forEach(t => {
        let hasAssigned = false;
        if (t.assignedSubjectIds && t.assignedSubjectIds.length > 0) {
          t.assignedSubjectIds.forEach(subId => {
            const sub = subjects.find(s => s.id === subId);
            if (sub && sub.level === level && sub.grade === grade) {
               gradeTasks.push({ teacherId: t.id, subject: sub });
               hasAssigned = true;
            }
          });
        }
        
        if (!hasAssigned && t.subjects && t.subjects.length > 0 && (!t.assignedSubjectIds || t.assignedSubjectIds.length === 0)) {
           t.subjects.forEach(subName => {
              const sub = subjects.find(s => s.name === subName && s.level === level && s.grade === grade);
              if (sub) {
                  gradeTasks.push({ teacherId: t.id, subject: sub });
              }
           });
        }
      });

      if (gradeTasks.length === 0) return;
      totalTasksFound += gradeTasks.length;

      const gradeSlots: { day: Day, period: number }[] = [];
      DAYS.forEach(day => PERIODS.forEach(p => gradeSlots.push({ day, period: p })));
      shuffle(gradeSlots);

      let slotIdx = 0;

      shuffle(gradeTasks).forEach(task => {
        const sessionsNeeded = task.subject.sessionsPerWeek || 4;
        let placed = 0;
        let attempts = 0;

        while (placed < sessionsNeeded && slotIdx < gradeSlots.length && attempts < 50) {
          attempts++;
          const slot = gradeSlots[slotIdx];
          const timeKey = `${slot.day}-${slot.period}`; 

          if (!teacherUsage[task.teacherId]) teacherUsage[task.teacherId] = new Set();
          
          if (!teacherUsage[task.teacherId].has(timeKey)) {
             newEntries.push({
               id: Math.random().toString(36).substr(2, 9),
               day: slot.day,
               period: slot.period,
               level: level,
               grade: grade,
               teacherId: task.teacherId,
               subject: task.subject.name
             });
             teacherUsage[task.teacherId].add(timeKey);
             placed++;
             slotIdx++;
          } else {
             let foundSlotIndex = -1;
             for(let i = slotIdx; i < gradeSlots.length; i++) {
                const s = gradeSlots[i];
                const tk = `${s.day}-${s.period}`;
                if (!teacherUsage[task.teacherId].has(tk)) {
                  foundSlotIndex = i;
                  break;
                }
             }

             if (foundSlotIndex !== -1) {
                const temp = gradeSlots[slotIdx];
                gradeSlots[slotIdx] = gradeSlots[foundSlotIndex];
                gradeSlots[foundSlotIndex] = temp;

                const finalSlot = gradeSlots[slotIdx];
                const finalKey = `${finalSlot.day}-${finalSlot.period}`;
                
                newEntries.push({
                  id: Math.random().toString(36).substr(2, 9),
                  day: finalSlot.day,
                  period: finalSlot.period,
                  level: level,
                  grade: grade,
                  teacherId: task.teacherId,
                  subject: task.subject.name
                });
                teacherUsage[task.teacherId].add(finalKey);
                placed++;
                slotIdx++;
             } else {
               break; 
             }
          }
        }
      });
    });

    if (newEntries.length === 0) {
        setIsSaving(false);
        showToast(totalTasksFound === 0 
           ? "لم يتم العثور على أي ربط بين المدرسين والمواد! يرجى تخصيص المواد للمدرسين أولاً من نافذة 'إدارة التدريسيين'."
           : "لم يتم التمكن من توزيع الحصص. يرجى مراجعة إعدادات المواد.", 
           "error"
        );
        return;
    }

    setTimeout(() => {
      setEntries(newEntries);
      setIsSaving(false);
      showToast(`تم توليد الجدول بنجاح (${newEntries.length} حصة) ✅`, "success");
    }, 1000);
  };

  const conflicts = useMemo(() => findConflicts(entries, teachers), [entries, teachers]);
  const conflictingEntryIds = useMemo(() => {
    const ids = new Set(conflicts.flatMap(c => [c.entryA.id, c.entryB.id]));
    return entries.filter(e => ids.has(e.id));
  }, [conflicts, entries]);

  const hasPermission = (v: ViewType) => !!currentUser?.permissions?.includes(v);

  if (!currentUser) return <Login onLogin={handleLogin} />;

  return (
    <div className="flex flex-col h-screen bg-[#f1f5f9] text-right main-layout font-tajawal" dir="rtl">
      {/* Welcome Modal */}
      {showWelcome && <WelcomeModal onClose={() => setShowWelcome(false)} title={institution.welcomeTitle} message={institution.welcomeMessage} />}

      {/* Logout Confirmation & Backup Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-[500] p-4 animate-fade-in">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden border border-white/20 p-8 transform scale-100 transition-all">
             <div className="w-20 h-20 bg-orange-100 rounded-full mx-auto flex items-center justify-center mb-6 ring-8 ring-orange-50">
                <svg className="w-10 h-10 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
             </div>
             <h2 className="text-2xl font-black mb-2 text-slate-800 text-center">تنبيه هام قبل المغادرة</h2>
             <p className="text-slate-500 font-bold mb-8 text-center text-sm leading-relaxed">هل قمت بعمل نسخة احتياطية للبيانات؟<br/>قد تفقد التغييرات الأخيرة إذا لم تقم بذلك.</p>
             
             <div className="space-y-3">
               <button onClick={handleExportBackup} className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-black shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                 عمل نسخة احتياطية الآن
               </button>
               <div className="grid grid-cols-2 gap-3">
                 <button onClick={handleLogout} className="bg-red-50 text-red-600 border border-red-100 py-3 rounded-xl font-black hover:bg-red-100 transition-all">
                   خروج دون حفظ
                 </button>
                 <button onClick={() => setShowLogoutConfirm(false)} className="bg-white text-slate-600 border border-slate-200 py-3 rounded-xl font-black hover:bg-slate-50 transition-all">
                   إلغاء
                 </button>
               </div>
             </div>
          </div>
        </div>
      )}

      {toast && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[300] px-6 py-3 rounded-full shadow-2xl border font-black text-xs animate-slide-up flex items-center gap-3 w-[90%] md:w-auto justify-center ${toast.type === 'success' ? 'bg-emerald-600 text-white border-emerald-500' : toast.type === 'error' ? 'bg-red-600 text-white border-red-500' : 'bg-slate-800 text-white border-slate-700'}`}>
          {toast.type === 'success' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>}
          {toast.type === 'error' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          {toast.message}
        </div>
      )}

      {/* Top Navbar - Glassmorphism */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200/60 px-4 md:px-6 py-3 shadow-sm flex items-center justify-between no-print transition-all">
        <div className="flex items-center gap-3 md:gap-4">
          <button 
            onClick={() => setIsSidebarOpen(true)} 
            className="md:hidden p-2 text-indigo-600 bg-white rounded-xl shadow-sm border border-indigo-100 hover:bg-indigo-50 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 shrink-0">
            {institution.logo ? <img src={institution.logo} className="w-8 h-8 object-contain" alt="Logo" /> : <span className="text-white font-black text-xl">S</span>}
          </div>
          <div className="hidden md:block">
            <h1 className="font-black text-slate-800 text-base tracking-tight">{institution.name}</h1>
            <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              مرحباً، {currentUser?.username || 'المستخدم'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button onClick={handleAutoGenerateSchedule} className="hidden md:flex bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-600 px-4 py-2.5 rounded-xl text-[10px] font-black transition-all border border-slate-200 items-center gap-2 group">
            <svg className="w-4 h-4 group-hover:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            توليد عشوائي
          </button>
          <button onClick={() => setIsSaving(true)} className="bg-indigo-600 text-white px-4 md:px-5 py-2.5 rounded-xl text-[10px] font-black shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all whitespace-nowrap">
            <span className="hidden md:inline">حفظ البيانات</span>
            <span className="md:hidden">حفظ</span>
          </button>
          <button onClick={() => setShowLogoutConfirm(true)} className="bg-white hover:bg-red-50 text-slate-600 hover:text-red-600 border border-slate-200 hover:border-red-100 px-3 py-2.5 rounded-xl transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          </button>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden print-container relative">
        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div className="fixed inset-0 bg-slate-900/50 z-40 md:hidden backdrop-blur-sm transition-opacity" onClick={() => setIsSidebarOpen(false)}></div>
        )}

        {/* Modern Sidebar */}
        <aside className={`
          fixed inset-y-0 right-0 z-50 w-72 bg-[#0f172a] text-slate-300 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out border-l border-slate-800
          md:relative md:translate-x-0
          ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}
        `}>
          {/* Mobile Close Button */}
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden absolute top-4 left-4 text-slate-400 hover:text-white p-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>

          <div className="p-6">
             <h3 className="text-[10px] font-black text-indigo-400 mb-4 uppercase tracking-widest px-2 pt-4 md:pt-0">المراحل التعليمية</h3>
             <div className="flex flex-col gap-2">
                {LEVELS.map(lvl => (
                  <button 
                    key={lvl} 
                    onClick={() => handleLevelChange(lvl)} 
                    className={`text-right text-[11px] font-bold px-4 py-3 rounded-2xl transition-all border flex items-center justify-between group ${activeLevel === lvl ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-900/50' : 'bg-slate-800/50 border-slate-700 hover:bg-slate-800 hover:text-white'}`}
                  >
                    <span>{lvl}</span>
                    {activeLevel === lvl && <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>}
                  </button>
                ))}
             </div>
          </div>
          
          <div className="flex-1 px-4 pb-6 space-y-1 overflow-y-auto">
             {/* Install Button for Mobile - Only shows if installable */}
             {isInstallable && (
               <div className="md:hidden mb-4">
                 <button onClick={handleInstallClick} className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-3 rounded-2xl font-black text-xs shadow-lg flex items-center justify-center gap-2 animate-pulse">
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                   تثبيت التطبيق على الهاتف
                 </button>
               </div>
             )}

             <div className="px-2 mb-2 text-[9px] font-black text-slate-500 uppercase tracking-widest">القوائم الرئيسية</div>
             <SidebarItem active={view === 'dashboard'} onClick={() => handleViewChange('dashboard')} label="لوحة التحكم" icon="M4 6h16M4 12h16M4 18h16" />
             <SidebarItem active={view === 'master'} onClick={() => handleViewChange('master')} label="الجدول العام (Master)" icon="M4 5h16M4 12h16M4 19h16" />
             <SidebarItem active={view === 'schedules'} onClick={() => handleViewChange('schedules')} label="جداول الصفوف" icon="M8 7V3m8 4V3" />
             
             <div className="px-2 mt-6 mb-2 text-[9px] font-black text-slate-500 uppercase tracking-widest">الإدارة والمالية</div>
             <SidebarItem active={view === 'subjects_manage'} onClick={() => handleViewChange('subjects_manage')} label="إدارة المواد" icon="M12 6.253v13" />
             <SidebarItem active={view === 'teachers_manage'} onClick={() => handleViewChange('teachers_manage')} label="إدارة التدريسين" icon="M17 20h5v-2" />
             <SidebarItem active={view === 'absences'} onClick={() => handleViewChange('absences')} label="سجل الغيابات" icon="M12 8v4" />
             <SidebarItem active={view === 'holidays'} onClick={() => handleViewChange('holidays')} label="العطل الرسمية" icon="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
             <SidebarItem active={view === 'salaries'} onClick={() => handleViewChange('salaries')} label="نظام الرواتب" icon="M12 8c-1.657" />
             
             <div className="px-2 mt-6 mb-2 text-[9px] font-black text-slate-500 uppercase tracking-widest">المخرجات</div>
             <SidebarItem active={view === 'reports'} onClick={() => handleViewChange('reports')} label="مركز التقارير" icon="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />

             <div className="mt-6 pt-4 border-t border-slate-700/50">
               {hasPermission('users_manage') && (
                 <SidebarItem active={view === 'users_manage'} onClick={() => handleViewChange('users_manage')} label="إدارة المستخدمين" icon="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
               )}
               <SidebarItem active={view === 'management'} onClick={() => handleViewChange('management')} label="إعدادات النظام" icon="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
             </div>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto p-4 md:p-10 bg-[#f1f5f9] print-content custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            {view === 'dashboard' && hasPermission('dashboard') && <Dashboard conflicts={conflicts} totalEntries={entries.length} totalTeachers={teachers.length} isInstallable={isInstallable} onInstall={handleInstallClick} teachers={teachers} entries={entries} />}
            
            {view === 'teachers_manage' && hasPermission('teachers_manage') && 
              <TeachersManagement 
                teachers={teachers} 
                subjects={subjects} 
                entries={entries}
                onAddTeacher={t => setTeachers(p => [...p, t])} 
                onDeleteTeacher={id => setTeachers(p => p.filter(x => x.id !== id))} 
                onUpdateTeacher={t => setTeachers(p => p.map(x => x.id === t.id ? t : x))}
              />
            }
            
            {view === 'subjects_manage' && hasPermission('subjects_manage') && 
              <SubjectsManagement 
                subjects={subjects} 
                onAddSubject={s => setSubjects(p => [...p, s])} 
                onDeleteSubject={id => setSubjects(p => p.filter(x => x.id !== id))} 
                onUpdateSubject={s => setSubjects(p => p.map(x => x.id === s.id ? s : x))}
              />
            }

            {view === 'users_manage' && hasPermission('users_manage') && 
              <UsersManagement 
                 users={users}
                 onAddUser={u => setUsers(prev => [...prev, u])}
                 onDeleteUser={id => setUsers(prev => prev.filter(u => u.id !== id))}
              />
            }
            
            {view === 'absences' && hasPermission('absences') && <AbsencesView teachers={teachers} absences={absences} entries={entries} onAddAbsence={a => setAbsences(p => [...p, a])} onDeleteAbsence={id => setAbsences(p => p.filter(x => x.id !== id))} />}
            {view === 'holidays' && hasPermission('holidays') && 
              <HolidaysManagement 
                holidays={holidays} 
                teachers={teachers} 
                onAddHoliday={h => setHolidays(p => [...p, h])}
                onDeleteHoliday={id => setHolidays(p => p.filter(h => h.id !== id))}
                onUpdateHoliday={h => setHolidays(p => p.map(x => x.id === h.id ? h : x))}
              />
            }
            {view === 'salaries' && hasPermission('salaries') && 
              <SalariesView 
                teachers={teachers} 
                entries={entries} 
                subjects={subjects} 
                absences={absences} 
                holidays={holidays}
                salaryHistory={salaryHistory}
                onSaveHistory={(records) => {
                  const cleanHistory = salaryHistory.filter(h => !(h.month === records[0].month && h.year === records[0].year));
                  setSalaryHistory([...cleanHistory, ...records]);
                  showToast('تم أرشفة رواتب الشهر بنجاح', 'success');
                }}
                onDeleteHistory={(id) => {
                  if(confirm('هل أنت متأكد من حذف هذا السجل المؤرشف؟')) {
                    setSalaryHistory(prev => prev.filter(r => r.id !== id));
                    showToast('تم حذف السجل بنجاح', 'success');
                  }
                }}
                onUpdateHistory={(record) => {
                  setSalaryHistory(prev => prev.map(r => r.id === record.id ? record : r));
                  showToast('تم تحديث السجل المؤرشف', 'success');
                }}
              />
            }
            {view === 'reports' && hasPermission('reports') && <ReportView institution={institution} entries={entries} teachers={teachers} subjects={subjects} absences={absences} holidays={holidays} printSettings={printSettings} />}
            
            {view === 'management' && hasPermission('management') && 
              <Management 
                institution={institution} 
                onUpdateInstitution={setInstitution}
                userCredentials={{ username: currentUser?.username || '', password: currentUser?.password || '' }}
                onUpdateCredentials={(creds) => {
                  const updated = { ...currentUser!, ...creds };
                  setCurrentUser(updated);
                  setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
                }}
                onExportBackup={handleExportBackup}
                onExportExcel={handleExportAllToExcel}
                onImportBackup={handleImportBackup}
                isInstallable={isInstallable}
                onInstall={handleInstallClick}
                updateAvailable={updateAvailable}
                isCheckingUpdate={isCheckingUpdate}
                onUpdateCheck={() => { setIsCheckingUpdate(true); setTimeout(() => setIsCheckingUpdate(false), 2000); }}
                onUpdateApp={() => window.location.reload()}
                printSettings={printSettings}
                onUpdatePrintSettings={setPrintSettings}
                onPreviewWelcome={() => setShowWelcome(true)}
              />
            }
            
            {view === 'master' && (
              <div className="space-y-6">
                <div className="bg-white p-4 rounded-[2rem] shadow-sm border border-slate-200">
                  <div className="flex gap-2 bg-slate-50 p-1.5 rounded-2xl overflow-x-auto custom-scrollbar">
                    {DAYS.map(day => (
                      <button key={day} onClick={() => setActiveDay(day)} className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap ${activeDay === day ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-500 hover:bg-white hover:text-indigo-600'}`}>{day}</button>
                    ))}
                  </div>
                </div>
                <MasterGrid level={activeLevel} day={activeDay} entries={entries} teachers={teachers} onAddEntry={handleAddEntry} onDeleteEntry={id => setEntries(e => e.filter(x => x.id !== id))} conflicts={conflictingEntryIds} onAutoGenerate={handleAutoGenerateSchedule} />
              </div>
            )}
            
            {view === 'schedules' && (
              <div className="space-y-6">
                <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-slate-200">
                  <div className="flex gap-2 bg-slate-50 p-1.5 rounded-2xl overflow-x-auto custom-scrollbar">
                    {GRADES_BY_LEVEL[activeLevel].map(grade => (
                      <button key={grade} onClick={() => setActiveGrade(grade)} className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap ${activeGrade === grade ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-500 hover:bg-white hover:text-blue-600'}`}>{grade}</button>
                    ))}
                  </div>
                </div>
                <TimetableGrid level={activeLevel} grade={activeGrade} entries={entries} teachers={teachers} onAddEntry={handleAddEntry} onDeleteEntry={id => setEntries(e => e.filter(x => x.id !== id))} conflicts={conflictingEntryIds} onAutoGenerate={handleAutoGenerateSchedule} />
              </div>
            )}
          </div>
        </main>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 no-print">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden animate-fade-in border-4 border-white">
            <div className="bg-slate-900 p-6 text-white flex justify-between items-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full -mr-16 -mt-16"></div>
              <div className="relative z-10">
                 <h2 className="text-xl font-black">إضافة حصة جديدة</h2>
                 <p className="text-xs text-slate-400 font-bold mt-1">يوم {newEntryForm.day} - الحصة {newEntryForm.period}</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-2xl font-bold bg-white/10 w-10 h-10 rounded-xl hover:bg-red-500 transition-colors z-10">×</button>
            </div>
            <div className="p-8 space-y-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">المدرس</label>
                 <select className="w-full border-2 border-slate-200 p-4 rounded-2xl font-bold bg-slate-50 outline-none focus:border-indigo-500 transition-colors" value={newEntryForm.teacherId} onChange={(e) => setNewEntryForm(p => ({ ...p, teacherId: e.target.value, subject: '' }))}>
                    <option value="">-- اختر المدرس --</option>
                    {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                 </select>
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">المادة</label>
                 <select className="w-full border-2 border-slate-200 p-4 rounded-2xl font-bold bg-slate-50 outline-none focus:border-indigo-500 transition-colors" value={newEntryForm.subject} onChange={(e) => setNewEntryForm(p => ({ ...p, subject: e.target.value }))} disabled={!newEntryForm.teacherId}>
                    <option value="">-- اختر المادة --</option>
                    {teachers.find(t => t.id === newEntryForm.teacherId)?.subjects.map(s => <option key={s} value={s}>{s}</option>)}
                 </select>
              </div>
              <button onClick={submitNewEntry} disabled={!newEntryForm.subject} className="w-full py-4 rounded-2xl font-black bg-indigo-600 text-white shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:shadow-none">حفظ الحصة</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SidebarItem = ({ active, onClick, icon, label }: any) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3.5 transition-all rounded-2xl group ${active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
    <svg className={`w-5 h-5 transition-transform ${active ? 'scale-110' : 'group-hover:scale-110'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={icon} /></svg>
    <span className="font-bold text-xs">{label}</span>
  </button>
);

export default App;
