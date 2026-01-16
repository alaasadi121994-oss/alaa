
import React from 'react';
import { Conflict, Teacher, ScheduleEntry } from '../types';

interface DashboardProps {
  conflicts: Conflict[];
  totalEntries: number;
  totalTeachers: number;
  isInstallable: boolean;
  onInstall: () => void;
  teachers: Teacher[];
  entries: ScheduleEntry[];
}

const Dashboard: React.FC<DashboardProps> = ({ 
  conflicts, 
  totalEntries, 
  totalTeachers, 
  isInstallable, 
  onInstall,
  teachers,
  entries
}) => {
  
  const teacherWorkload = teachers.map(t => {
    const count = entries.filter(e => e.teacherId === t.id).length;
    const totalEarnings = t.jobType === 'أهلي' ? count * t.lecturePrice : 0;
    return { ...t, count, totalEarnings };
  }).sort((a, b) => b.count - a.count);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Installation Banner */}
      {isInstallable && (
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-10 rounded-[3rem] shadow-2xl shadow-indigo-200 text-white flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-white/20 transition-all duration-700"></div>
          <div className="relative z-10 flex items-center gap-8">
            <div className="w-24 h-24 bg-white/20 rounded-[2rem] flex items-center justify-center backdrop-blur-lg border border-white/20 shadow-inner">
              <svg className="w-12 h-12 text-white drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-3xl font-black mb-2">تجربة سطح المكتب المتكاملة</h2>
              <p className="text-indigo-100 text-sm font-medium leading-relaxed max-w-md">قم بتثبيت التطبيق الآن للحصول على أداء أسرع، عمل بدون إنترنت، وتجربة شاشة كاملة مخصصة لإدارة الجداول.</p>
            </div>
          </div>
          <button 
            onClick={onInstall}
            className="relative z-10 bg-white text-indigo-600 px-10 py-4 rounded-2xl font-black shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all whitespace-nowrap flex items-center gap-2"
          >
            <span>تثبيت التطبيق</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          </button>
        </div>
      )}

      {/* Stats Cards - Modern Design */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 hover:-translate-y-1 transition-all duration-300">
          <div className="flex justify-between items-start mb-6">
             <div className="p-4 bg-blue-50 rounded-2xl text-blue-600">
               <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
             </div>
             <span className="text-slate-300">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" /></svg>
             </span>
          </div>
          <div>
            <p className="text-4xl font-black text-slate-800 mb-1">{totalTeachers}</p>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">أعضاء الهيئة التدريسية</p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 hover:-translate-y-1 transition-all duration-300">
          <div className="flex justify-between items-start mb-6">
             <div className="p-4 bg-emerald-50 rounded-2xl text-emerald-600">
               <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
             </div>
             <div className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black">نشط</div>
          </div>
          <div>
            <p className="text-4xl font-black text-slate-800 mb-1">{totalEntries}</p>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">مجموع الحصص الموزعة</p>
          </div>
        </div>

        <div className={`bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden`}>
          {conflicts.length > 0 && <div className="absolute top-0 left-0 w-full h-1 bg-red-500"></div>}
          <div className="flex justify-between items-start mb-6">
             <div className={`p-4 rounded-2xl ${conflicts.length > 0 ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-400'}`}>
               <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
             </div>
             {conflicts.length > 0 && <span className="w-3 h-3 bg-red-500 rounded-full animate-ping"></span>}
          </div>
          <div>
            <p className={`text-4xl font-black mb-1 ${conflicts.length > 0 ? 'text-red-600' : 'text-slate-800'}`}>{conflicts.length}</p>
            <p className={`text-xs font-bold uppercase tracking-widest ${conflicts.length > 0 ? 'text-red-400' : 'text-slate-400'}`}>
              {conflicts.length > 0 ? 'تنبيهات تضارب الجدول' : 'لا توجد مشاكل'}
            </p>
          </div>
        </div>
      </div>

      {/* Teacher Workload Summary */}
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-black text-slate-800">نصاب الحصص والمستحقات</h3>
            <p className="text-slate-400 text-xs font-bold mt-1 uppercase tracking-widest">نظرة عامة على توزيع الجدول</p>
          </div>
          <button className="text-indigo-600 hover:bg-indigo-50 p-2 rounded-xl transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" /></svg>
          </button>
        </div>
        <div className="p-8 bg-slate-50/50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teacherWorkload.map((t) => {
              const percentage = Math.min((t.count / 24) * 100, 100);
              const colorClass = t.count > 20 ? 'bg-orange-500' : t.count > 15 ? 'bg-blue-500' : 'bg-emerald-500';
              
              return (
                <div key={t.id} className="bg-white border border-slate-100 p-6 rounded-[2rem] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-sm ${t.jobType === 'أهلي' ? 'bg-orange-500' : 'bg-indigo-600'}`}>
                        {t.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-black text-slate-800 text-sm group-hover:text-indigo-600 transition-colors">{t.name}</h4>
                        <p className="text-[10px] text-slate-400 font-bold">{t.specialization}</p>
                      </div>
                    </div>
                    <div className="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 text-center">
                      <span className="text-lg font-black text-slate-800 block leading-none">{t.count}</span>
                      <span className="text-[8px] text-slate-400 font-bold uppercase">حصة</span>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-4">
                    <div 
                      className={`h-full transition-all duration-1000 rounded-full ${colorClass}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  
                  <div className="flex justify-between items-center pt-2 border-t border-slate-50">
                    <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${t.jobType === 'أهلي' ? 'bg-orange-50 text-orange-600' : 'bg-indigo-50 text-indigo-600'}`}>
                      {t.jobType}
                    </span>
                    {t.jobType === 'أهلي' && (
                      <span className="text-xs font-black text-slate-700">
                        {t.totalEarnings.toLocaleString()} د.ع
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {totalTeachers === 0 && (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-slate-100 rounded-full mx-auto flex items-center justify-center mb-4">
                 <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              </div>
              <p className="font-bold text-slate-400 text-sm">ابدأ بإضافة الكادر التدريسي من القائمة الجانبية</p>
            </div>
          )}
        </div>
      </div>

      {/* Conflict Details (if any) */}
      {conflicts.length > 0 && (
        <div className="bg-red-50 rounded-[3rem] border border-red-100 shadow-xl overflow-hidden p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center text-red-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <div>
               <h3 className="text-xl font-black text-red-800">تفاصيل التضارب في الجدول</h3>
               <p className="text-red-400 text-xs font-bold mt-1">يرجى معالجة هذه الحالات لضمان سير الجدول بشكل صحيح</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {conflicts.map((conflict, idx) => (
              <div key={idx} className="bg-white p-5 rounded-3xl border border-red-100 flex items-center gap-4 shadow-sm">
                <span className="w-8 h-8 bg-red-50 text-red-600 rounded-xl flex items-center justify-center font-black text-sm shrink-0">
                  {idx + 1}
                </span>
                <div>
                  <p className="font-black text-slate-800 text-sm">{conflict.teacherName}</p>
                  <p className="text-xs text-red-500 font-bold mt-0.5">يوم {conflict.day} - الحصة {conflict.period}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
