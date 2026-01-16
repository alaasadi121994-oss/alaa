
import React, { useState } from 'react';
import { Teacher, Absence, Day, ScheduleEntry } from '../types';
import { DAYS } from '../constants';

interface AbsencesViewProps {
  teachers: Teacher[];
  absences: Absence[];
  entries: ScheduleEntry[];
  onAddAbsence: (absence: Absence) => void;
  onDeleteAbsence: (id: string) => void;
}

const AbsencesView: React.FC<AbsencesViewProps> = ({ teachers, absences, entries, onAddAbsence, onDeleteAbsence }) => {
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [selectedDay, setSelectedDay] = useState<Day>(Day.SUNDAY);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().substr(0, 10));

  const handleAdd = () => {
    if (!selectedTeacherId) return;
    onAddAbsence({
      id: Math.random().toString(36).substr(2, 9),
      teacherId: selectedTeacherId,
      day: selectedDay,
      date: selectedDate
    });
  };

  const getMissedLessons = (teacherId: string, day: Day) => {
    return entries.filter(e => e.teacherId === teacherId && e.day === day);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100">
        <div className="flex items-center gap-4 mb-8">
           <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
           </div>
           <div>
              <h2 className="text-2xl font-black text-slate-800">سجل الغيابات والتقارير الفرعية</h2>
              <p className="text-red-500 font-bold text-[10px] uppercase tracking-widest">إدارة غيابات الكادر وعرض الحصص المتأثرة</p>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-red-50 p-6 rounded-3xl border border-red-100 mb-8">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-red-400 mr-2">اسم التدريسي</label>
            <select className="w-full p-3 border-2 rounded-xl font-bold bg-white" value={selectedTeacherId} onChange={e => setSelectedTeacherId(e.target.value)}>
              <option value="">اختر المدرس</option>
              {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-red-400 mr-2">اليوم المفقود</label>
            <select className="w-full p-3 border-2 rounded-xl font-bold bg-white" value={selectedDay} onChange={e => setSelectedDay(e.target.value as Day)}>
              {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-red-400 mr-2">التاريخ</label>
            <input type="date" className="w-full p-3 border-2 rounded-xl font-bold bg-white" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
          </div>
          <div className="flex items-end">
            <button onClick={handleAdd} className="w-full bg-red-600 text-white font-black py-3.5 rounded-xl shadow-lg hover:bg-red-700 transition-all">تسجيل غياب وتحليل الحصص</button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b-2">
              <tr>
                <th className="p-4">التدريسي</th>
                <th className="p-4 text-center">التوقيت</th>
                <th className="p-4">الحصص المتأثرة (تقرير فرعي)</th>
                <th className="p-4 text-center">إجراء</th>
              </tr>
            </thead>
            <tbody className="text-sm font-bold text-slate-700">
              {absences.map(a => {
                const teacher = teachers.find(t => t.id === a.teacherId);
                const missed = getMissedLessons(a.teacherId, a.day);
                return (
                  <tr key={a.id} className="border-b last:border-0 hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                       <p className="font-black text-slate-800">{teacher?.name || '---'}</p>
                       <p className="text-[9px] text-slate-400 font-bold uppercase">{teacher?.specialization}</p>
                    </td>
                    <td className="p-4 text-center">
                       <p className="font-black">{a.day}</p>
                       <p className="text-[10px] font-mono text-slate-400">{a.date}</p>
                    </td>
                    <td className="p-4">
                       <div className="flex flex-wrap gap-2">
                          {missed.length > 0 ? missed.map((m, idx) => (
                             <div key={idx} className="bg-red-50 border border-red-100 p-2 rounded-xl flex items-center gap-2">
                                <span className="bg-red-200 text-red-700 w-5 h-5 flex items-center justify-center rounded-lg text-[9px] font-black">{m.period}</span>
                                <div className="leading-tight">
                                   <p className="text-[10px] font-black text-red-800">{m.subject}</p>
                                   <p className="text-[8px] text-red-400 font-bold">{m.grade}</p>
                                </div>
                             </div>
                          )) : (
                             <span className="text-slate-300 text-[10px] font-bold italic">لا توجد حصص مجدولة لهذا اليوم</span>
                          )}
                       </div>
                    </td>
                    <td className="p-4 text-center">
                      <button onClick={() => onDeleteAbsence(a.id)} className="p-2 text-slate-300 hover:text-red-500 transition-all hover:scale-125">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </td>
                  </tr>
                );
              })}
              {absences.length === 0 && <tr><td colSpan={4} className="p-12 text-center text-slate-300 font-black">لا توجد سجلات غياب للمراجعة</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 flex items-center gap-4">
         <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-red-600 shadow-sm">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
         </div>
         <p className="text-[10px] text-slate-500 font-black leading-relaxed">تنبيه: يتم تحليل الحصص المفقودة آلياً بمجرد تسجيل الغياب بناءً على الجدول الأسبوعي الحالي المعتمد في النظام.</p>
      </div>
    </div>
  );
};

export default AbsencesView;
