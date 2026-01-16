
import React from 'react';
import { Day, SchoolLevel, ScheduleEntry, Teacher } from '../types';
import { DAYS, PERIODS } from '../constants';

interface TimetableGridProps {
  level: SchoolLevel;
  grade: string;
  entries: ScheduleEntry[];
  teachers: Teacher[];
  onAddEntry: (day: Day, period: number) => void;
  onDeleteEntry: (id: string) => void;
  conflicts: ScheduleEntry[];
  onAutoGenerate?: () => void;
}

const TimetableGrid: React.FC<TimetableGridProps> = ({ 
  level, 
  grade,
  entries, 
  teachers, 
  onAddEntry, 
  onDeleteEntry,
  conflicts,
  onAutoGenerate
}) => {
  const getEntry = (day: Day, period: number) => {
    return entries.find(e => e.day === day && e.period === period && e.level === level && e.grade === grade);
  };

  const isConflicting = (id: string) => conflicts.some(c => c.id === id);

  return (
    <div className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 border-r-0 md:border-r-8 border-blue-600 md:pr-6 gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-800">جدول الحصص</h2>
          <p className="text-slate-400 text-xs font-bold mt-1 uppercase tracking-widest">{grade} - {level}</p>
        </div>
        <div className="flex flex-row md:flex-col items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          {onAutoGenerate && (
            <button 
              onClick={onAutoGenerate}
              className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-[10px] font-black shadow-lg flex items-center gap-2 hover:bg-emerald-700 transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              توليد ذكي
            </button>
          )}
          <div className="text-xs font-black text-blue-600 bg-blue-50 px-5 py-2.5 rounded-2xl border border-blue-100 shadow-sm">
            الحصص: {entries.filter(e => e.level === level && e.grade === grade).length}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto custom-scrollbar pb-4">
        <table className="min-w-full border-separate border-spacing-3">
          <thead>
            <tr>
              <th className="p-4 bg-slate-50 text-slate-400 font-black rounded-2xl text-[10px] uppercase tracking-widest sticky right-0 z-10">الحصة</th>
              {DAYS.map(day => (
                <th key={day} className="p-4 bg-slate-50 text-slate-700 font-black rounded-2xl text-xs min-w-[140px] md:min-w-[150px]">{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PERIODS.map(period => (
              <tr key={period}>
                <td className="p-4 bg-indigo-50/50 font-black text-center text-indigo-700 rounded-2xl border border-indigo-100 shadow-sm min-w-[80px] sticky right-0 z-10">
                  {period}
                </td>
                {DAYS.map(day => {
                  const entry = getEntry(day, period);
                  const teacher = entry ? teachers.find(t => t.id === entry.teacherId) : null;
                  const conflict = entry && isConflicting(entry.id);

                  return (
                    <td key={day} className="relative h-32 min-w-[140px] md:min-w-[150px]">
                      {entry ? (
                        <div className={`group p-4 rounded-3xl h-full flex flex-col justify-center text-center transition-all shadow-sm border-2 ${conflict ? 'bg-red-50 border-red-200 ring-4 ring-red-100' : 'bg-white border-slate-100 hover:border-blue-400 hover:shadow-lg'}`}>
                          <div className="mb-2">
                            <span className="bg-indigo-100 text-indigo-700 text-[8px] font-black px-2 py-0.5 rounded-full uppercase mb-1 inline-block">مادة</span>
                            <p className="font-black text-slate-800 text-xs leading-tight">{entry.subject}</p>
                          </div>
                          <div className="pt-2 border-t border-slate-50">
                            <p className="text-slate-400 text-[9px] font-bold truncate">{teacher?.name || 'مدرس غير معرف'}</p>
                          </div>
                          {conflict && (
                            <div className="mt-2 animate-pulse text-red-600 font-black text-[8px]">تضارب!</div>
                          )}
                          <button 
                            onClick={() => onDeleteEntry(entry.id)}
                            className="absolute -top-1 -left-1 bg-white shadow-xl text-red-500 rounded-full p-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-all border border-slate-100 scale-90"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => onAddEntry(day, period)}
                          className="w-full h-full rounded-3xl border-2 border-dashed border-slate-100 flex items-center justify-center text-slate-200 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50/30 transition-all"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
                        </button>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TimetableGrid;
