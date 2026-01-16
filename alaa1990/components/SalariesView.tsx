
import React, { useState, useMemo } from 'react';
import { Teacher, ScheduleEntry, Subject, Absence, Day, SalaryRecord, Holiday } from '../types';
import { DAYS } from '../constants';

interface SalariesViewProps {
  teachers: Teacher[];
  entries: ScheduleEntry[];
  subjects: Subject[];
  absences: Absence[];
  holidays: Holiday[];
  salaryHistory: SalaryRecord[];
  onSaveHistory: (records: SalaryRecord[]) => void;
  onDeleteHistory?: (id: string) => void;
  onUpdateHistory?: (record: SalaryRecord) => void;
}

const dayToNumber: Record<string, number> = {
  'الأحد': 0, 'الاثنين': 1, 'الثلاثاء': 2, 'الأربعاء': 3, 'الخميس': 4, 'الجمعة': 5, 'السبت': 6
};

const SalariesView: React.FC<SalariesViewProps> = ({ 
  teachers, 
  entries, 
  subjects, 
  absences, 
  holidays,
  salaryHistory, 
  onSaveHistory,
  onDeleteHistory,
  onUpdateHistory
}) => {
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');
  
  // Current Calculation State - Range Based
  const [calcStartDate, setCalcStartDate] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
  });
  const [calcEndDate, setCalcEndDate] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split('T')[0];
  });

  const [adjustments, setAdjustments] = useState<Record<string, { reward: number, otherDeduction: number }>>({});

  // History Filter State
  const [historyFromMonth, setHistoryFromMonth] = useState(0);
  const [historyFromYear, setHistoryFromYear] = useState(new Date().getFullYear());
  const [historyToMonth, setHistoryToMonth] = useState(11);
  const [historyToYear, setHistoryToYear] = useState(new Date().getFullYear());

  // Edit Modal State
  const [editingRecord, setEditingRecord] = useState<SalaryRecord | null>(null);

  // استخراج تكرار أيام الأسبوع في الفترة المحددة
  const dayOccurrences = useMemo(() => {
    const occurrences: Record<string, number> = {};
    DAYS.forEach(d => occurrences[d] = 0);
    
    const start = new Date(calcStartDate);
    const end = new Date(calcEndDate);
    
    // Loop through dates
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dayIndex = d.getDay();
      const dayName = Object.keys(dayToNumber).find(key => dayToNumber[key] === dayIndex);
      if (dayName && occurrences[dayName] !== undefined) {
        occurrences[dayName]++;
      }
    }
    return occurrences;
  }, [calcStartDate, calcEndDate]);

  const calculateSalaryData = (teacher: Teacher) => {
    const teacherEntries = entries.filter(e => e.teacherId === teacher.id);
    let nominalSalary = 0;
    let totalLectures = 0;

    // 1. حساب الراتب الاسمي (الافتراضي بدون عطل وغيابات)
    teacherEntries.forEach(entry => {
      const subInfo = subjects.find(s => s.name === entry.subject && s.grade === entry.grade && s.level === entry.level);
      const price = subInfo ? subInfo.price : 0;
      const occurrences = dayOccurrences[entry.day] || 0;
      nominalSalary += price * occurrences;
      totalLectures += occurrences;
    });

    // 2. حساب استقطاع العطل الرسمية
    // Loop through all days in range, check if holiday, check if teacher has class that day, check if exception
    let holidayDeduction = 0;
    const start = new Date(calcStartDate);
    const end = new Date(calcEndDate);
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const currentDateStr = d.toISOString().split('T')[0];
        const dayIndex = d.getDay();
        const dayName = Object.keys(dayToNumber).find(key => dayToNumber[key] === dayIndex) as Day;
        
        // Find if this date is inside any holiday
        const activeHoliday = holidays.find(h => {
            const hStart = new Date(h.startDate);
            const hEnd = new Date(h.startDate);
            hEnd.setDate(hEnd.getDate() + (h.daysCount - 1));
            return d >= hStart && d <= hEnd;
        });

        if (activeHoliday && dayName) {
            // Check if teacher is excepted
            if (!activeHoliday.exceptionTeacherIds.includes(teacher.id)) {
                // Not excepted, calculate deduction for lectures on this day
                const lecturesOnThisDay = teacherEntries.filter(e => e.day === dayName);
                lecturesOnThisDay.forEach(entry => {
                    const subInfo = subjects.find(s => s.name === entry.subject && s.grade === entry.grade && s.level === entry.level);
                    holidayDeduction += subInfo ? subInfo.price : 0;
                });
            }
        }
    }

    // 3. استخراج غيابات المدرس في هذه الفترة (Absences deduction logic stays similar but typically absences are separate from official holidays)
    // Note: If a day is both a holiday AND marked as absence, we should probably only deduct once. 
    // However, usually users won't mark absence on a holiday. Assuming they are distinct events.
    const periodAbsences = absences.filter(a => {
      const d = new Date(a.date);
      const s = new Date(calcStartDate);
      const e = new Date(calcEndDate);
      return a.teacherId === teacher.id && d >= s && d <= e;
    });

    let absenceDeduction = 0;
    periodAbsences.forEach(abs => {
      const dayEntries = teacherEntries.filter(e => e.day === abs.day);
      dayEntries.forEach(entry => {
        const subInfo = subjects.find(s => s.name === entry.subject && s.grade === entry.grade && s.level === entry.level);
        absenceDeduction += subInfo ? subInfo.price : 0;
      });
    });

    const adj = adjustments[teacher.id] || { reward: 0, otherDeduction: 0 };
    
    // Net Salary Logic
    const netSalary = nominalSalary + adj.reward - absenceDeduction - holidayDeduction - adj.otherDeduction;

    return { 
      totalLectures, 
      nominalSalary, 
      reward: adj.reward, 
      absenceDeduction, 
      holidayDeduction,
      otherDeduction: adj.otherDeduction, 
      netSalary 
    };
  };

  const handleAdjust = (tid: string, key: 'reward' | 'otherDeduction', val: string) => {
    const num = parseInt(val) || 0;
    setAdjustments(prev => ({ 
      ...prev, 
      [tid]: { ...(prev[tid] || { reward: 0, otherDeduction: 0 }), [key]: num } 
    }));
  };

  const handleSaveToHistory = () => {
    const records: SalaryRecord[] = teachers.map(t => {
      const data = calculateSalaryData(t);
      return {
        id: Math.random().toString(36).substr(2, 9),
        teacherId: t.id,
        teacherName: t.name,
        startDate: calcStartDate,
        endDate: calcEndDate,
        month: new Date(calcStartDate).getMonth(), // For backward compatibility sorting
        year: new Date(calcStartDate).getFullYear(), // For backward compatibility sorting
        totalLectures: data.totalLectures,
        nominalSalary: data.nominalSalary,
        rewards: data.reward,
        absenceDeduction: data.absenceDeduction,
        holidayDeduction: data.holidayDeduction,
        otherDeduction: data.otherDeduction,
        netSalary: data.netSalary,
        archivedAt: new Date().toISOString()
      };
    });
    
    if (confirm(`هل تريد أرشفة رواتب الفترة من ${calcStartDate} إلى ${calcEndDate}؟`)) {
      onSaveHistory(records);
    }
  };

  const filteredHistory = useMemo(() => {
    const fromDate = new Date(historyFromYear, historyFromMonth, 1);
    const toDate = new Date(historyToYear, historyToMonth + 1, 0);

    return salaryHistory.filter(rec => {
      // Check if record start date falls within filter range
      const recDate = new Date(rec.startDate || `${rec.year}-${(rec.month || 0) + 1}-01`); 
      return recDate >= fromDate && recDate <= toDate;
    }).sort((a, b) => new Date(b.archivedAt).getTime() - new Date(a.archivedAt).getTime());
  }, [salaryHistory, historyFromMonth, historyFromYear, historyToMonth, historyToYear]);

  // Totals for Current Tab
  const currentTotalNet = useMemo(() => {
    return teachers.reduce((sum, t) => sum + calculateSalaryData(t).netSalary, 0);
  }, [teachers, entries, adjustments, calcStartDate, calcEndDate, holidays]); // Added holidays dependency

  // Totals for History Tab
  const historyTotalNet = useMemo(() => {
    return filteredHistory.reduce((sum, r) => sum + r.netSalary, 0);
  }, [filteredHistory]);

  const months = ["كانون الثاني", "شباط", "آذار", "نيسان", "أيار", "حزيران", "تموز", "آب", "أيلول", "تشرين الأول", "تشرين الثاني", "كانون الأول"];
  const years = [2024, 2025, 2026, 2027];

  const handleUpdateRecord = () => {
    if (editingRecord && onUpdateHistory) {
      // Recalculate net salary based on inputs
      // Note: holidayDeduction is preserved from the record unless we add a field to edit it manually
      const net = editingRecord.nominalSalary + editingRecord.rewards - editingRecord.absenceDeduction - (editingRecord.holidayDeduction || 0) - editingRecord.otherDeduction;
      onUpdateHistory({ ...editingRecord, netSalary: net });
      setEditingRecord(null);
    }
  };

  const handlePrint = () => {
    // A slight timeout allows UI to update before print dialog opens, improving rendering stability
    setTimeout(() => {
        window.print();
    }, 100);
  };

  return (
    <div className="space-y-6 animate-fade-in relative print-content">
      {/* Edit Modal */}
      {editingRecord && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 no-print">
           <div className="bg-white p-8 rounded-[2rem] shadow-2xl w-full max-w-md">
              <h3 className="text-xl font-black text-slate-800 mb-6 border-b pb-4">تعديل سجل راتب مؤرشف</h3>
              <div className="space-y-4">
                 <div className="flex justify-between font-bold text-sm text-slate-500 mb-2">
                    <span>{editingRecord.teacherName}</span>
                    <span>{editingRecord.startDate}</span>
                 </div>
                 
                 <div>
                    <label className="text-xs font-black text-slate-500 block mb-1">الراتب المستحق (الأساسي)</label>
                    <input type="number" className="w-full p-3 border-2 rounded-xl font-bold" value={editingRecord.nominalSalary} onChange={e => setEditingRecord({...editingRecord, nominalSalary: Number(e.target.value)})} />
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-black text-slate-500 block mb-1">المكافئات</label>
                        <input type="number" className="w-full p-3 border-2 rounded-xl font-bold text-emerald-600" value={editingRecord.rewards} onChange={e => setEditingRecord({...editingRecord, rewards: Number(e.target.value)})} />
                    </div>
                    <div>
                        <label className="text-xs font-black text-slate-500 block mb-1">استقطاعات أخرى</label>
                        <input type="number" className="w-full p-3 border-2 rounded-xl font-bold text-red-600" value={editingRecord.otherDeduction} onChange={e => setEditingRecord({...editingRecord, otherDeduction: Number(e.target.value)})} />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-black text-slate-500 block mb-1">استقطاع الغياب</label>
                        <input type="number" className="w-full p-3 border-2 rounded-xl font-bold text-red-600" value={editingRecord.absenceDeduction} onChange={e => setEditingRecord({...editingRecord, absenceDeduction: Number(e.target.value)})} />
                    </div>
                    <div>
                        <label className="text-xs font-black text-slate-500 block mb-1">استقطاع العطل</label>
                        <input type="number" className="w-full p-3 border-2 rounded-xl font-bold text-pink-600" value={editingRecord.holidayDeduction || 0} onChange={e => setEditingRecord({...editingRecord, holidayDeduction: Number(e.target.value)})} />
                    </div>
                 </div>
                 
                 <div className="pt-4 flex gap-3">
                    <button onClick={handleUpdateRecord} className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-black hover:bg-indigo-700">حفظ التغييرات</button>
                    <button onClick={() => setEditingRecord(null)} className="flex-1 bg-slate-200 text-slate-600 py-3 rounded-xl font-black hover:bg-slate-300">إلغاء</button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Header with filters */}
      <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-slate-100 flex flex-wrap items-center justify-between gap-6 no-print">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2" /></svg>
           </div>
           <div>
              <h3 className="font-black text-slate-800">نظام الرواتب الشامل</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">إدارة الرواتب والأرشفة</p>
           </div>
        </div>
        <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
          <button 
            onClick={() => setActiveTab('current')} 
            className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${activeTab === 'current' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-500 hover:bg-slate-200'}`}
          >
            الحساب الحالي (الحي)
          </button>
          <button 
            onClick={() => setActiveTab('history')} 
            className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${activeTab === 'history' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-500 hover:bg-slate-200'}`}
          >
            أرشيف السجلات (التاريخ)
          </button>
        </div>
      </div>

      {activeTab === 'current' && (
        <div className="print:block">
          <div className="bg-white p-4 rounded-3xl border border-indigo-100 flex flex-wrap items-center gap-4 no-print mb-4">
             <div className="flex items-center gap-2">
               <span className="text-xs font-black text-indigo-900">من تاريخ:</span>
               <input 
                  type="date" 
                  className="bg-slate-50 border p-2 rounded-lg font-bold text-xs" 
                  value={calcStartDate} 
                  onChange={e => setCalcStartDate(e.target.value)} 
               />
             </div>
             <div className="flex items-center gap-2">
               <span className="text-xs font-black text-indigo-900">إلى تاريخ:</span>
               <input 
                  type="date" 
                  className="bg-slate-50 border p-2 rounded-lg font-bold text-xs" 
                  value={calcEndDate} 
                  onChange={e => setCalcEndDate(e.target.value)} 
               />
             </div>
             
             <div className="flex-1"></div>
             
             <button onClick={handleSaveToHistory} className="bg-emerald-600 text-white px-4 py-2 rounded-xl font-black text-xs hover:bg-emerald-700 shadow-md flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                أرشفة هذه الفترة
             </button>
             <button onClick={handlePrint} className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-black text-xs hover:bg-indigo-500 shadow-md flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                طباعة الكشف
             </button>
          </div>

          <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden print:shadow-none print:border-none print:p-0">
            <h4 className="text-center font-black text-lg mb-4 print:block hidden">كشف رواتب الفترة من {calcStartDate} إلى {calcEndDate}</h4>
            <div className="overflow-x-auto print:overflow-visible">
              <table className="w-full text-right border-collapse min-w-[1000px] print:min-w-full print:text-[10pt]">
                <thead>
                  <tr className="bg-slate-800 text-white print:bg-white print:text-black">
                    <th className="p-4 text-xs font-black border border-slate-700 print:border-black">اسم التدريسي</th>
                    <th className="p-4 text-xs font-black border border-slate-700 text-center print:border-black">المحاضرات</th>
                    <th className="p-4 text-xs font-black border border-slate-700 text-center print:border-black">المستحق</th>
                    <th className="p-4 text-xs font-black border border-slate-700 text-center print:border-black">المكافئات</th>
                    <th className="p-4 text-xs font-black border border-slate-700 text-center print:border-black">استقطاع العطل</th>
                    <th className="p-4 text-xs font-black border border-slate-700 text-center print:border-black">استقطاع الغياب</th>
                    <th className="p-4 text-xs font-black border border-slate-700 text-center print:border-black">اخرى</th>
                    <th className="p-4 text-xs font-black border border-slate-700 text-center print:border-black">الصافي</th>
                    <th className="p-4 text-xs font-black border border-slate-700 text-center print:border-black">التوقيع</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-bold text-slate-700">
                  {teachers.map(teacher => {
                    const data = calculateSalaryData(teacher);
                    return (
                      <tr key={teacher.id} className="hover:bg-slate-50 border-b border-slate-100 transition-colors">
                        <td className="p-4 border border-slate-100 font-black text-indigo-900 print:border-black print:text-black">
                          <div>{teacher.name}</div>
                          <div className="text-[9px] text-slate-400 font-bold print:hidden">{teacher.jobType}</div>
                        </td>
                        <td className="p-4 border border-slate-100 text-center print:border-black">
                          <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg text-[11px] font-black print:bg-transparent print:text-black print:p-0">{data.totalLectures}</span>
                        </td>
                        <td className="p-4 border border-slate-100 text-center font-mono text-slate-600 print:border-black print:text-black">{(data.nominalSalary || 0).toLocaleString()}</td>
                        <td className="p-4 border border-slate-100 text-center no-print">
                          <input 
                            type="number" 
                            className="w-20 p-2 border-2 border-emerald-100 rounded-xl bg-emerald-50 text-emerald-700 text-center text-xs font-black outline-none focus:ring-4 focus:ring-emerald-200" 
                            value={adjustments[teacher.id]?.reward || ''} 
                            onChange={e => handleAdjust(teacher.id, 'reward', e.target.value)} 
                            placeholder="0"
                          />
                        </td>
                        <td className="p-4 border border-slate-100 text-center print:border-black font-mono hidden print:table-cell">{(data.reward || 0).toLocaleString()}</td>
                        <td className="p-4 border border-slate-100 text-center text-pink-600 font-mono print:border-black print:text-black">{(data.holidayDeduction || 0).toLocaleString()}</td>
                        <td className="p-4 border border-slate-100 text-center text-red-600 font-mono print:border-black print:text-black">{(data.absenceDeduction || 0).toLocaleString()}</td>
                        <td className="p-4 border border-slate-100 text-center no-print">
                          <input 
                            type="number" 
                            className="w-20 p-2 border-2 border-red-100 rounded-xl bg-red-50 text-red-700 text-center text-xs font-black outline-none focus:ring-4 focus:ring-red-200" 
                            value={adjustments[teacher.id]?.otherDeduction || ''} 
                            onChange={e => handleAdjust(teacher.id, 'otherDeduction', e.target.value)} 
                            placeholder="0"
                          />
                        </td>
                        <td className="p-4 border border-slate-100 text-center print:border-black font-mono hidden print:table-cell">{(data.otherDeduction || 0).toLocaleString()}</td>
                        <td className="p-4 border border-slate-100 text-center font-black text-emerald-600 bg-emerald-50/20 text-base print:bg-transparent print:border-black print:text-black">
                          {(data.netSalary || 0).toLocaleString()}
                        </td>
                        <td className="p-4 border border-slate-100 text-center print:border-black">
                           <div className="w-24 h-10 border-b-2 border-dotted border-slate-300 mx-auto print:border-black"></div>
                        </td>
                      </tr>
                    );
                  })}
                  {/* Total Row */}
                  <tr className="bg-slate-800 text-white print:bg-white print:text-black print:text-sm">
                     <td colSpan={7} className="p-4 border border-slate-600 font-black text-left pl-8 print:border-black">المجموع الكلي للرواتب المستحقة (الصافي)</td>
                     <td colSpan={2} className="p-4 border border-slate-600 font-black text-center text-lg bg-emerald-600/50 print:bg-transparent print:border-black">
                        {currentTotalNet.toLocaleString()} د.ع
                     </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="mt-8 text-[10px] text-slate-500 font-bold space-y-1 print:block hidden">
              <p>* الراتب المستحق = عدد الحصص الفعلي في الفترة المحددة × سعر المحاضرة.</p>
              <p>* يتم استقطاع أجور الحصص التي صادفت عطل رسمية (ما لم يكن المدرس مستثنى).</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="print:block">
          <div className="bg-white p-6 rounded-3xl border border-blue-100 no-print mb-4">
             <h4 className="font-black text-blue-900 mb-4">فلترة الأرشيف حسب الفترة الزمنية (لسجلات الأرشيف)</h4>
             <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 border p-2 rounded-xl bg-slate-50">
                  <span className="text-[10px] font-bold text-slate-500">من:</span>
                  <select className="bg-transparent font-bold text-xs outline-none" value={historyFromMonth} onChange={e => setHistoryFromMonth(Number(e.target.value))}>{months.map((m, i) => <option key={i} value={i}>{m}</option>)}</select>
                  <select className="bg-transparent font-bold text-xs outline-none" value={historyFromYear} onChange={e => setHistoryFromYear(Number(e.target.value))}>{years.map(y => <option key={y} value={y}>{y}</option>)}</select>
                </div>
                <div className="flex items-center gap-2 border p-2 rounded-xl bg-slate-50">
                  <span className="text-[10px] font-bold text-slate-500">إلى:</span>
                  <select className="bg-transparent font-bold text-xs outline-none" value={historyToMonth} onChange={e => setHistoryToMonth(Number(e.target.value))}>{months.map((m, i) => <option key={i} value={i}>{m}</option>)}</select>
                  <select className="bg-transparent font-bold text-xs outline-none" value={historyToYear} onChange={e => setHistoryToYear(Number(e.target.value))}>{years.map(y => <option key={y} value={y}>{y}</option>)}</select>
                </div>
                <div className="flex-1"></div>
                <button onClick={handlePrint} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-black text-xs hover:bg-blue-500 shadow-lg">طباعة التقرير التجميعي</button>
             </div>
          </div>

          <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-gray-100 print:shadow-none print:border-none print:p-0">
             <h4 className="text-center font-black text-lg mb-2 print:block hidden">تقرير الرواتب المؤرشفة</h4>
             
             <table className="w-full text-right border-collapse min-w-[1000px] print:min-w-full print:text-[10pt]">
                <thead>
                  <tr className="bg-slate-800 text-white print:bg-white print:text-black">
                    <th className="p-4 text-xs font-black border border-slate-700 print:border-black">اسم التدريسي</th>
                    <th className="p-4 text-xs font-black border border-slate-700 text-center print:border-black">الفترة المؤرشفة</th>
                    <th className="p-4 text-xs font-black border border-slate-700 text-center print:border-black">إجمالي الحصص</th>
                    <th className="p-4 text-xs font-black border border-slate-700 text-center print:border-black">الراتب المستحق</th>
                    <th className="p-4 text-xs font-black border border-slate-700 text-center print:border-black">صافي المصروف</th>
                    <th className="p-4 text-xs font-black border border-slate-700 text-center no-print">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-bold text-slate-700">
                  {filteredHistory.map((rec, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 border-b border-slate-100">
                      <td className="p-4 border border-slate-100 font-black text-indigo-900 print:border-black print:text-black">{rec.teacherName}</td>
                      <td className="p-4 border border-slate-100 text-center font-mono text-[10px] print:border-black print:text-black">
                        {rec.startDate} <span className="text-slate-400">إلى</span> {rec.endDate}
                      </td>
                      <td className="p-4 border border-slate-100 text-center font-mono print:border-black print:text-black">{rec.totalLectures}</td>
                      <td className="p-4 border border-slate-100 text-center font-mono print:border-black print:text-black">{(rec.nominalSalary).toLocaleString()}</td>
                      <td className="p-4 border border-slate-100 text-center font-black text-blue-700 bg-blue-50/30 print:bg-transparent print:border-black print:text-black">{(rec.netSalary).toLocaleString()} د.ع</td>
                      <td className="p-4 border border-slate-100 text-center no-print">
                        <div className="flex justify-center gap-2">
                           {onUpdateHistory && (
                             <button onClick={() => setEditingRecord(rec)} className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100" title="تعديل">
                               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                             </button>
                           )}
                           {onDeleteHistory && (
                             <button onClick={() => onDeleteHistory(rec.id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100" title="حذف">
                               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                             </button>
                           )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-slate-800 text-white print:bg-white print:text-black print:text-sm">
                     <td colSpan={4} className="p-4 border border-slate-600 font-black text-left pl-8 print:border-black">المجموع الكلي للأرشيف (الصافي)</td>
                     <td colSpan={2} className="p-4 border border-slate-600 font-black text-center text-lg bg-blue-600/50 print:bg-transparent print:border-black">
                        {historyTotalNet.toLocaleString()} د.ع
                     </td>
                  </tr>
                  {filteredHistory.length === 0 && (
                     <tr><td colSpan={6} className="p-8 text-center text-slate-400">لا توجد سجلات مؤرشفة في هذه الفترة</td></tr>
                  )}
                </tbody>
             </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalariesView;
