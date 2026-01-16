
import React, { useState, useMemo } from 'react';
import { 
  InstitutionInfo, 
  ScheduleEntry, 
  Teacher, 
  Subject, 
  Absence, 
  SchoolLevel, 
  Day, 
  PrintSettings,
  Holiday
} from '../types';
import { DAYS, PERIODS, GRADES_BY_LEVEL, LEVELS } from '../constants';

interface ReportViewProps {
  institution: InstitutionInfo;
  entries: ScheduleEntry[];
  teachers: Teacher[];
  subjects: Subject[];
  absences: Absence[];
  holidays: Holiday[];
  printSettings: PrintSettings;
}

type ReportCategory = 'schedules' | 'staff' | 'subjects' | 'salaries';
type ScheduleReportType = 'by-grade' | 'by-teacher' | 'by-level-day' | 'by-level-week';

const dayToNumber: Record<string, number> = {
  'الأحد': 0, 'الاثنين': 1, 'الثلاثاء': 2, 'الأربعاء': 3, 'الخميس': 4, 'الجمعة': 5, 'السبت': 6
};

const ReportView: React.FC<ReportViewProps> = ({ 
  institution, 
  entries, 
  teachers, 
  subjects, 
  absences,
  holidays,
  printSettings 
}) => {
  const [category, setCategory] = useState<ReportCategory>('schedules');
  const [scheduleType, setScheduleType] = useState<ScheduleReportType>('by-grade');
  
  // Selection States
  const [selectedLevel, setSelectedLevel] = useState<SchoolLevel>(LEVELS[0]);
  const [selectedGrade, setSelectedGrade] = useState<string>(GRADES_BY_LEVEL[LEVELS[0]][0]);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(teachers[0]?.id || '');
  const [selectedDay, setSelectedDay] = useState<Day>(DAYS[0]);
  
  // Salary Period State
  const [salaryStartDate, setSalaryStartDate] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
  });
  const [salaryEndDate, setSalaryEndDate] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split('T')[0];
  });

  const activeTeacher = useMemo(() => teachers.find(t => t.id === selectedTeacherId), [teachers, selectedTeacherId]);

  const escapeCSV = (str: string) => {
    if (!str) return '';
    return `"${str.replace(/"/g, '""')}"`;
  };

  // Salary Calc Helper for Report
  const getSalaryReportData = () => {
    const occurrences: Record<string, number> = {};
    DAYS.forEach(d => occurrences[d] = 0);
    const start = new Date(salaryStartDate);
    const end = new Date(salaryEndDate);
    
    // Day occurrences for nominal salary
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dayIndex = d.getDay();
      const dayName = Object.keys(dayToNumber).find(key => dayToNumber[key] === dayIndex);
      if (dayName && occurrences[dayName] !== undefined) occurrences[dayName]++;
    }

    return teachers.map(t => {
      const teacherEntries = entries.filter(e => e.teacherId === t.id);
      let totalLectures = 0;
      let nominalSalary = 0;
      let holidayDeduction = 0;

      // 1. Calculate Nominal
      teacherEntries.forEach(entry => {
         const subInfo = subjects.find(s => s.name === entry.subject && s.grade === entry.grade && s.level === entry.level);
         const price = subInfo ? subInfo.price : 0;
         const count = occurrences[entry.day] || 0;
         nominalSalary += price * count;
         totalLectures += count;
      });

      // 2. Calculate Holiday Deductions
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const activeHoliday = holidays.find(h => {
            const hStart = new Date(h.startDate);
            const hEnd = new Date(h.startDate);
            hEnd.setDate(hEnd.getDate() + (h.daysCount - 1));
            return d >= hStart && d <= hEnd;
        });

        if (activeHoliday) {
            const dayIndex = d.getDay();
            const dayName = Object.keys(dayToNumber).find(key => dayToNumber[key] === dayIndex) as Day;
            
            if (dayName && !activeHoliday.exceptionTeacherIds.includes(t.id)) {
                const lecturesOnDay = teacherEntries.filter(e => e.day === dayName);
                lecturesOnDay.forEach(entry => {
                    const subInfo = subjects.find(s => s.name === entry.subject && s.grade === entry.grade && s.level === entry.level);
                    holidayDeduction += subInfo ? subInfo.price : 0;
                });
            }
        }
      }

      const netSalary = nominalSalary - holidayDeduction;

      return { teacher: t, totalLectures, nominalSalary, holidayDeduction, netSalary };
    });
  };

  const exportToExcel = () => {
    let csvContent = "\uFEFF"; // BOM for Arabic support
    
    if (category === 'staff') {
      csvContent += "اسم المدرس,رقم الهاتف,الاختصاص,نوع العمل\n";
      teachers.forEach(t => csvContent += `${escapeCSV(t.name)},${escapeCSV(t.phoneNumber)},${escapeCSV(t.specialization)},${escapeCSV(t.jobType)}\n`);
    } else if (category === 'subjects') {
      csvContent += "المادة,المرحلة,الصف,السعر\n";
      subjects.forEach(s => csvContent += `${escapeCSV(s.name)},${escapeCSV(s.level)},${escapeCSV(s.grade)},${s.price}\n`);
    } else if (category === 'salaries') {
      csvContent += `تقرير الرواتب من ${salaryStartDate} الى ${salaryEndDate}\n`;
      csvContent += "اسم المدرس,عدد الحصص الفعلي,الراتب المستحق,استقطاع العطل,الراتب الصافي\n";
      const data = getSalaryReportData();
      let totalSum = 0;
      data.forEach(d => {
        csvContent += `${escapeCSV(d.teacher.name)},${d.totalLectures},${d.nominalSalary},${d.holidayDeduction},${d.netSalary}\n`;
        totalSum += d.netSalary;
      });
      csvContent += `المجموع الكلي,,,,${totalSum}\n`;
    } else if (category === 'schedules') {
        if (scheduleType === 'by-grade') {
            csvContent += `جدول الصف: ${selectedGrade} - ${selectedLevel}\n`;
            csvContent += "اليوم," + PERIODS.map(p => `الحصة ${p}`).join(",") + "\n";
            DAYS.forEach(d => {
                let row = `${d}`;
                PERIODS.forEach(p => {
                    const entry = entries.find(e => e.day === d && e.period === p && e.grade === selectedGrade && e.level === selectedLevel);
                    row += `,${entry ? escapeCSV(entry.subject) : '-'}`;
                });
                csvContent += row + "\n";
            });
        } else if (scheduleType === 'by-teacher') {
            const tName = teachers.find(t => t.id === selectedTeacherId)?.name || '';
            csvContent += `جدول المدرس: ${tName}\n`;
            csvContent += "اليوم," + PERIODS.map(p => `الحصة ${p}`).join(",") + "\n";
            DAYS.forEach(d => {
                let row = `${d}`;
                PERIODS.forEach(p => {
                    const entry = entries.find(e => e.day === d && e.period === p && e.teacherId === selectedTeacherId);
                    row += `,${entry ? `${escapeCSV(entry.subject)} (${escapeCSV(entry.grade)})` : '-'}`;
                });
                csvContent += row + "\n";
            });
        } else if (scheduleType === 'by-level-day') {
            csvContent += `جدول يوم: ${selectedDay} - ${selectedLevel}\n`;
            csvContent += "الحصة," + GRADES_BY_LEVEL[selectedLevel].map(g => escapeCSV(g)).join(",") + "\n";
            PERIODS.forEach(p => {
                let row = `الحصة ${p}`;
                GRADES_BY_LEVEL[selectedLevel].forEach(g => {
                    const entry = entries.find(e => e.day === selectedDay && e.period === p && e.grade === g && e.level === selectedLevel);
                    const tName = entry ? teachers.find(t => t.id === entry.teacherId)?.name : '';
                    row += `,${entry ? `${escapeCSV(entry.subject)} - ${escapeCSV(tName || '')}` : '-'}`;
                });
                csvContent += row + "\n";
            });
        } else if (scheduleType === 'by-level-week') {
            csvContent += `الجدول الشامل الأسبوعي - ${selectedLevel}\n`;
            csvContent += "اليوم,الحصة," + GRADES_BY_LEVEL[selectedLevel].map(g => escapeCSV(g)).join(",") + "\n";
            DAYS.forEach(d => {
                PERIODS.forEach(p => {
                    let row = `${d},${p}`;
                    GRADES_BY_LEVEL[selectedLevel].forEach(g => {
                        const entry = entries.find(e => e.day === d && e.period === p && e.grade === g && e.level === selectedLevel);
                        row += `,${entry ? escapeCSV(entry.subject) : '-'}`;
                    });
                    csvContent += row + "\n";
                });
            });
        }
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `تقرير_${category}_${new Date().toLocaleDateString().replace(/\//g, '-')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderHeader = (title: string) => (
    <div className="flex justify-between items-center border-b-4 border-slate-800 pb-4 mb-6">
      <div className="flex items-center gap-4">
        {institution.logo && <img src={institution.logo} className="h-20 w-20 object-contain shadow-sm rounded-lg" alt="Logo" />}
        <div className="text-right">
          <h2 className="text-2xl font-black text-slate-900">{institution.name}</h2>
          <p className="text-sm font-bold text-slate-500">نظام الإدارة المدرسية الذكي</p>
        </div>
      </div>
      <div className="text-center bg-slate-100 px-8 py-3 rounded-2xl border border-slate-200">
        <h3 className="text-lg font-black text-slate-800">{title}</h3>
      </div>
      <div className="text-left">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">تاريخ الاستخراج</p>
        <p className="text-xs font-bold text-slate-700">{new Date().toLocaleDateString('ar-EG')}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Category Selection Hub */}
      <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-4 no-print">
        <ReportCard active={category === 'schedules'} onClick={() => setCategory('schedules')} label="تقارير الجداول" icon="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" color="blue" />
        <ReportCard active={category === 'staff'} onClick={() => setCategory('staff')} label="تقرير الكادر" icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857" color="indigo" />
        <ReportCard active={category === 'subjects'} onClick={() => setCategory('subjects')} label="تقرير المواد" icon="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253" color="emerald" />
        <ReportCard active={category === 'salaries'} onClick={() => setCategory('salaries')} label="تقرير الرواتب" icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2" color="orange" />
      </div>

      {/* Dynamic Filters per Category */}
      <div className="bg-white p-6 rounded-[2rem] shadow-lg border border-slate-100 no-print flex flex-wrap gap-6 items-end">
        {category === 'schedules' && (
          <>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 mr-2 uppercase tracking-widest">نوع تقرير الجدول</label>
              <select className="w-64 p-2.5 border-2 rounded-xl font-bold text-xs bg-slate-50" value={scheduleType} onChange={e => setScheduleType(e.target.value as ScheduleReportType)}>
                <option value="by-grade">جدول صف محدد (أسبوعي)</option>
                <option value="by-teacher">جدول مدرس محدد (أسبوعي)</option>
                <option value="by-level-day">جدول المرحلة (يومي - شامل)</option>
                <option value="by-level-week">الجدول الشامل (أسبوعي - لكافة الصفوف)</option>
              </select>
            </div>
            
            {(scheduleType === 'by-grade') && (
              <>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 mr-2 uppercase tracking-widest">المرحلة</label>
                  <select className="p-2.5 border-2 rounded-xl font-bold text-xs bg-slate-50" value={selectedLevel} onChange={e => setSelectedLevel(e.target.value as SchoolLevel)}>
                    {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 mr-2 uppercase tracking-widest">الصف</label>
                  <select className="p-2.5 border-2 rounded-xl font-bold text-xs bg-slate-50" value={selectedGrade} onChange={e => setSelectedGrade(e.target.value)}>
                    {GRADES_BY_LEVEL[selectedLevel].map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              </>
            )}

            {(scheduleType === 'by-level-day' || scheduleType === 'by-level-week') && (
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 mr-2 uppercase tracking-widest">المرحلة</label>
                <select className="p-2.5 border-2 rounded-xl font-bold text-xs bg-slate-50" value={selectedLevel} onChange={e => setSelectedLevel(e.target.value as SchoolLevel)}>
                  {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            )}

            {scheduleType === 'by-level-day' && (
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 mr-2 uppercase tracking-widest">اليوم</label>
                <select className="p-2.5 border-2 rounded-xl font-bold text-xs bg-slate-50" value={selectedDay} onChange={e => setSelectedDay(e.target.value as Day)}>
                  {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            )}

            {scheduleType === 'by-teacher' && (
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 mr-2 uppercase tracking-widest">اسم التدريسي</label>
                <select className="w-64 p-2.5 border-2 rounded-xl font-bold text-xs bg-slate-50" value={selectedTeacherId} onChange={e => setSelectedTeacherId(e.target.value)}>
                  {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
            )}
          </>
        )}

        {category === 'salaries' && (
          <>
             <div className="space-y-1">
               <label className="text-[10px] font-black text-slate-400 mr-2 uppercase tracking-widest">من تاريخ</label>
               <input 
                  type="date" 
                  className="p-2.5 border-2 rounded-xl font-bold text-xs bg-slate-50" 
                  value={salaryStartDate} 
                  onChange={e => setSalaryStartDate(e.target.value)} 
               />
             </div>
             <div className="space-y-1">
               <label className="text-[10px] font-black text-slate-400 mr-2 uppercase tracking-widest">إلى تاريخ</label>
               <input 
                  type="date" 
                  className="p-2.5 border-2 rounded-xl font-bold text-xs bg-slate-50" 
                  value={salaryEndDate} 
                  onChange={e => setSalaryEndDate(e.target.value)} 
               />
             </div>
          </>
        )}

        <div className="flex-1"></div>
        
        <div className="flex gap-3">
          <button onClick={() => window.print()} className="bg-slate-800 text-white px-6 py-2.5 rounded-xl font-black text-xs shadow-lg hover:bg-slate-700 transition-all flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
            طباعة التقرير
          </button>
          <button onClick={exportToExcel} className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-black text-xs shadow-lg hover:bg-emerald-500 transition-all flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            تصدير Excel
          </button>
        </div>
      </div>

      {/* Main Report Canvas */}
      <div className="bg-white p-12 rounded-[2.5rem] shadow-2xl border border-gray-200 min-h-[700px]">
        {category === 'schedules' && (
          <div className="report-card">
            {scheduleType === 'by-grade' && (
              <>
                {renderHeader(`جدول الصف: ${selectedGrade} (${selectedLevel})`)}
                <table className="w-full border-collapse border-2 border-slate-900 text-center text-xs font-bold">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="border-2 border-slate-900 p-3 w-32">اليوم / الحصة</th>
                      {PERIODS.map(p => <th key={p} className="border-2 border-slate-900 p-3">الحصة {p}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {DAYS.map(d => (
                      <tr key={d}>
                        <td className="border-2 border-slate-900 p-3 bg-slate-50 font-black h-16">{d}</td>
                        {PERIODS.map(p => {
                          const entry = entries.find(e => e.day === d && e.period === p && e.grade === selectedGrade && e.level === selectedLevel);
                          const teacher = entry ? teachers.find(t => t.id === entry.teacherId) : null;
                          return (
                            <td key={p} className="border-2 border-slate-900 p-3">
                              {entry ? (
                                <div className="space-y-1">
                                  <p className="text-sm font-black text-slate-800">{entry.subject}</p>
                                  <p className="text-[10px] text-slate-500 font-bold">{teacher?.name}</p>
                                </div>
                              ) : '-'}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}

            {/* Other Schedule Types Omitted for brevity, they remain same structure */}
            {scheduleType === 'by-teacher' && (
              <>
                {renderHeader(`جدول حصص التدريسي: ${activeTeacher?.name || '---'}`)}
                <div className="mb-4 bg-slate-50 p-4 rounded-xl border border-slate-200 flex justify-between">
                    <p className="font-bold text-xs">الاختصاص: <span className="text-slate-600">{activeTeacher?.specialization}</span></p>
                    <p className="font-bold text-xs">نوع العمل: <span className="text-slate-600">{activeTeacher?.jobType}</span></p>
                    <p className="font-bold text-xs">إجمالي الحصص: <span className="text-blue-600">{entries.filter(e => e.teacherId === selectedTeacherId).length}</span></p>
                </div>
                <table className="w-full border-collapse border-2 border-slate-900 text-center text-xs font-bold">
                  <thead>
                    <tr className="bg-indigo-50">
                      <th className="border-2 border-slate-900 p-3 w-32">اليوم / الحصة</th>
                      {PERIODS.map(p => <th key={p} className="border-2 border-slate-900 p-3">الحصة {p}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {DAYS.map(d => (
                      <tr key={d}>
                        <td className="border-2 border-slate-900 p-3 bg-slate-50 font-black h-16">{d}</td>
                        {PERIODS.map(p => {
                          const entry = entries.find(e => e.day === d && e.period === p && e.teacherId === selectedTeacherId);
                          return (
                            <td key={p} className="border-2 border-slate-900 p-3">
                              {entry ? (
                                <div className="space-y-1">
                                  <p className="text-sm font-black text-indigo-900">{entry.subject}</p>
                                  <p className="text-[9px] text-slate-500 font-bold bg-slate-100 rounded px-1 inline-block">{entry.grade}</p>
                                </div>
                              ) : '-'}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
            
            {/* Same for by-level-day and by-level-week */}
            {scheduleType === 'by-level-day' && (
              <>
                {renderHeader(`المخطط اليومي الشامل - يوم ${selectedDay} (${selectedLevel})`)}
                <table className="w-full border-collapse border-2 border-slate-900 text-center text-xs font-bold">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="border-2 border-slate-900 p-3 w-24">الحصة / الصف</th>
                      {GRADES_BY_LEVEL[selectedLevel].map(g => <th key={g} className="border-2 border-slate-900 p-3">{g}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {PERIODS.map(p => (
                      <tr key={p}>
                        <td className="border-2 border-slate-900 p-3 bg-slate-50 font-black h-20">الحصة {p}</td>
                        {GRADES_BY_LEVEL[selectedLevel].map(g => {
                          const entry = entries.find(e => e.day === selectedDay && e.period === p && e.grade === g && e.level === selectedLevel);
                          const teacher = entry ? teachers.find(t => t.id === entry.teacherId) : null;
                          return (
                            <td key={g} className="border-2 border-slate-900 p-3">
                              {entry ? (
                                <div className="space-y-1">
                                  <p className="font-black text-slate-800">{entry.subject}</p>
                                  <p className="text-[9px] text-blue-600">{teacher?.name}</p>
                                </div>
                              ) : '-'}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}

            {scheduleType === 'by-level-week' && (
              <>
                {renderHeader(`الجدول الشامل الأسبوعي - ${selectedLevel}`)}
                <table className="w-full border-collapse border-2 border-slate-900 text-center text-[10px] font-bold">
                  <thead>
                    <tr className="bg-slate-800 text-white">
                      <th className="border-2 border-slate-900 p-2 w-20">اليوم</th>
                      <th className="border-2 border-slate-900 p-2 w-16">الحصة</th>
                      {GRADES_BY_LEVEL[selectedLevel].map(g => (
                        <th key={g} className="border-2 border-slate-900 p-2">{g}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {DAYS.map(day => (
                      <React.Fragment key={day}>
                        {PERIODS.map((period, pIndex) => (
                          <tr key={`${day}-${period}`} className={pIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                            {pIndex === 0 && (
                              <td rowSpan={PERIODS.length} className="border-2 border-slate-900 p-2 bg-slate-200 font-black align-middle text-sm">
                                <div className="vertical-text-if-needed">{day}</div>
                              </td>
                            )}
                            <td className="border-2 border-slate-900 p-1 bg-slate-100 font-bold">{period}</td>
                            {GRADES_BY_LEVEL[selectedLevel].map(grade => {
                              const entry = entries.find(e => e.day === day && e.period === period && e.level === selectedLevel && e.grade === grade);
                              const teacher = entry ? teachers.find(t => t.id === entry.teacherId) : null;
                              return (
                                <td key={grade} className="border-2 border-slate-900 p-1 h-12">
                                   {entry ? (
                                     <div className="flex flex-col justify-center h-full">
                                       <span className="font-black text-black leading-tight text-[9px]">{entry.subject}</span>
                                       <span className="text-[8px] text-slate-600">{teacher?.name}</span>
                                     </div>
                                   ) : ''}
                                </td>
                              )
                            })}
                          </tr>
                        ))}
                        <tr className="bg-slate-800 h-1"><td colSpan={GRADES_BY_LEVEL[selectedLevel].length + 2}></td></tr>
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </div>
        )}

        {category === 'staff' && (
          <div className="report-card">
            {renderHeader("تقرير الكادر التعليمي المتكامل")}
            <table className="w-full border-collapse border-2 border-slate-900 text-xs text-right">
              <thead>
                <tr className="bg-slate-800 text-white">
                  <th className="border-2 border-slate-900 p-4">الاسم الكامل للتدريسي</th>
                  <th className="border-2 border-slate-900 p-4">رقم التواصل</th>
                  <th className="border-2 border-slate-900 p-4">الاختصاص العام</th>
                  <th className="border-2 border-slate-900 p-4 text-center">نوع العقد</th>
                  <th className="border-2 border-slate-900 p-4 text-center">عدد الحصص</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map(t => (
                  <tr key={t.id} className="border-b-2 border-slate-900">
                    <td className="border-2 border-slate-900 p-4 font-black text-slate-900">{t.name}</td>
                    <td className="border-2 border-slate-900 p-4 font-mono text-slate-600">{t.phoneNumber}</td>
                    <td className="border-2 border-slate-900 p-4">{t.specialization}</td>
                    <td className="border-2 border-slate-900 p-4 text-center">
                        <span className={`px-4 py-1 rounded-full text-[10px] font-black ${t.jobType === 'أهلي' ? 'bg-orange-100 text-orange-700' : 'bg-emerald-100 text-emerald-700'}`}>{t.jobType}</span>
                    </td>
                    <td className="border-2 border-slate-900 p-4 text-center font-black text-blue-600">
                        {entries.filter(e => e.teacherId === t.id).length}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {category === 'subjects' && (
          <div className="report-card">
            {renderHeader("كشف المواد الدراسية والتسعير")}
            <table className="w-full border-collapse border-2 border-slate-900 text-xs text-right">
              <thead>
                <tr className="bg-emerald-800 text-white">
                  <th className="border-2 border-emerald-700 p-4">اسم المادة</th>
                  <th className="border-2 border-emerald-700 p-4 text-center">المرحلة</th>
                  <th className="border-2 border-emerald-700 p-4 text-center">الصف الدراسي</th>
                  <th className="border-2 border-emerald-700 p-4 text-center">سعر المحاضرة</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map(s => (
                  <tr key={s.id} className="border-b-2 border-slate-900">
                    <td className="border-2 border-slate-900 p-4 font-black text-slate-900">{s.name}</td>
                    <td className="border-2 border-slate-900 p-4 text-center font-bold">{s.level}</td>
                    <td className="border-2 border-slate-900 p-4 text-center font-bold">{s.grade}</td>
                    <td className="border-2 border-slate-900 p-4 text-center font-mono text-emerald-700">{(s.price || 0).toLocaleString()} د.ع</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {category === 'salaries' && (
          <div className="report-card">
            {renderHeader(`كشف الاستحقاقات المالية للفترة من ${salaryStartDate} إلى ${salaryEndDate}`)}
            <table className="w-full border-collapse border-2 border-slate-900 text-xs text-center">
              <thead>
                <tr className="bg-slate-800 text-white">
                  <th className="border-2 border-slate-700 p-4 text-right">اسم المدرس</th>
                  <th className="border-2 border-slate-700 p-4">نوع العمل</th>
                  <th className="border-2 border-slate-700 p-4">عدد المحاضرات (فعلي)</th>
                  <th className="border-2 border-slate-700 p-4">الراتب المستحق</th>
                  <th className="border-2 border-slate-700 p-4">استقطاع العطل</th>
                  <th className="border-2 border-slate-700 p-4">الاستحقاق الصافي</th>
                  <th className="border-2 border-slate-700 p-4">التوقيع</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const salaryData = getSalaryReportData();
                  const totalSum = salaryData.reduce((acc, curr) => acc + curr.netSalary, 0); // Corrected to sum Net Salary
                  
                  return (
                    <>
                      {salaryData.map(data => (
                        <tr key={data.teacher.id} className="border-b-2 border-slate-900">
                          <td className="border-2 border-slate-900 p-4 text-right font-black text-slate-900">{data.teacher.name}</td>
                          <td className="border-2 border-slate-900 p-4 font-bold text-slate-500">{data.teacher.jobType}</td>
                          <td className="border-2 border-slate-900 p-4 font-black text-blue-700">{data.totalLectures}</td>
                          <td className="border-2 border-slate-900 p-4 font-mono">{data.nominalSalary.toLocaleString()}</td>
                          <td className="border-2 border-slate-900 p-4 font-mono text-pink-600">{data.holidayDeduction.toLocaleString()}</td>
                          <td className="border-2 border-slate-900 p-4 font-black text-emerald-700 bg-emerald-50">{data.netSalary.toLocaleString()} د.ع</td>
                          <td className="border-2 border-slate-900 p-4 h-16 w-32"></td>
                        </tr>
                      ))}
                      <tr className="bg-slate-800 text-white font-black text-sm">
                        <td colSpan={5} className="border-2 border-slate-900 p-4 text-left pl-8">المجموع الكلي للرواتب (للفترة المحددة)</td>
                        <td className="border-2 border-slate-900 p-4 bg-emerald-700 text-white">{totalSum.toLocaleString()} د.ع</td>
                        <td className="border-2 border-slate-900 p-4 bg-slate-900"></td>
                      </tr>
                    </>
                  );
                })()}
              </tbody>
            </table>
            <div className="mt-12 grid grid-cols-3 gap-8 text-center no-print">
               <div className="space-y-2">
                 <p className="font-black text-xs">توقيع المحاسب</p>
                 <div className="h-20 border-2 border-dashed border-slate-200 rounded-2xl"></div>
               </div>
               <div className="space-y-2">
                 <p className="font-black text-xs">توقيع مدير المؤسسة</p>
                 <div className="h-20 border-2 border-dashed border-slate-200 rounded-2xl"></div>
               </div>
               <div className="space-y-2">
                 <p className="font-black text-xs">ختم المؤسسة</p>
                 <div className="h-20 border-2 border-dashed border-slate-200 rounded-2xl"></div>
               </div>
            </div>
            
            <div className="mt-4 text-[9px] text-slate-400 font-bold no-print">
               * تم احتساب الاستقطاعات بناءً على جدول العطل الرسمية والاستثناءات المسجلة.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ReportCard = ({ active, onClick, label, icon, color }: any) => (
  <button 
    onClick={onClick}
    className={`p-6 rounded-[2.5rem] border-2 transition-all flex flex-col items-center gap-3 text-center ${active ? `bg-${color}-600 border-${color}-600 text-white shadow-2xl scale-[1.03]` : `bg-white border-slate-100 text-slate-400 hover:bg-slate-50`}`}
  >
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${active ? 'bg-white/20' : 'bg-slate-50 text-slate-400'}`}>
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={icon} /></svg>
    </div>
    <span className="text-[11px] font-black uppercase tracking-wider">{label}</span>
  </button>
);

export default ReportView;
