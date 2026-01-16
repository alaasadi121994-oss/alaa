
import React from 'react';
import { Day, SchoolLevel, ScheduleEntry, Teacher } from '../types';
import { PERIODS, GRADES_BY_LEVEL } from '../constants';

interface MasterGridProps {
  level: SchoolLevel;
  day: Day;
  entries: ScheduleEntry[];
  teachers: Teacher[];
  onAddEntry: (day: Day, period: number, grade: string, level: SchoolLevel) => void;
  onDeleteEntry: (id: string) => void;
  conflicts: ScheduleEntry[];
  onAutoGenerate?: () => void;
}

const MasterGrid: React.FC<MasterGridProps> = ({ 
  level, 
  day,
  entries, 
  teachers, 
  onAddEntry, 
  onDeleteEntry,
  conflicts,
  onAutoGenerate
}) => {
  const grades = GRADES_BY_LEVEL[level];
  
  const getEntry = (period: number, grade: string) => {
    return entries.find(e => e.day === day && e.period === period && e.level === level && e.grade === grade);
  };

  const isConflicting = (id: string) => conflicts.some(c => c.id === id);

  return (
    <div className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-10 border-r-0 md:border-r-8 border-indigo-600 md:pr-6 gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">المخطط اليومي</h2>
          <p className="text-slate-400 text-sm mt-1 font-bold">يوم {day} - {level}</p>
        </div>
        <div className="flex flex-row md:flex-col items-center md:items-end gap-2 w-full md:w-auto justify-between md:justify-start">
          {onAutoGenerate && (
             <button 
              onClick={onAutoGenerate}
              className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-[10px] font-black shadow-lg flex items-center gap-2 hover:bg-emerald-700 transition-all"
             >
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
               توليد ذكي
             </button>
          )}
          <div className="text-[10px] font-black text-white bg-indigo-600 px-4 py-2 rounded-full uppercase tracking-widest shadow-lg">
            الصفوف: {grades.length}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto custom-scrollbar pb-4">
        <table className="min-w-full border-separate border-spacing-2">
          <thead>
            <tr>
              <th className="p-4 md:p-5 bg-slate-50 text-slate-700 font-black rounded-3xl text-xs sticky right-0 z-20 shadow-xl backdrop-blur-md">الحصة</th>
              {grades.map(grade => (
                <th key={grade} className="p-4 md:p-5 bg-slate-50 text-indigo-900 font-black rounded-3xl text-xs min-w-[140px] md:min-w-[160px] border-b-4 border-indigo-100/50">
                  {grade}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PERIODS.map(period => (
              <tr key={period} className="group">
                <td className="p-4 md:p-5 bg-indigo-50/50 font-black text-center text-indigo-700 rounded-3xl border border-indigo-100 shadow-sm sticky right-0 z-20 backdrop-blur-md group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  {period}
                </td>
                {grades.map(grade => {
                  const entry = getEntry(period, grade);
                  const teacher = entry ? teachers.find(t => t.id === entry.teacherId) : null;
                  const conflict = entry && isConflicting(entry.id);

                  return (
                    <td key={grade} className="relative h-28 group/cell">
                      {entry ? (
                        <div className={`p-3 md:p-4 rounded-3xl h-full flex flex-col justify-center text-center transition-all shadow-sm border-2 ${conflict ? 'bg-red-50 border-red-300 ring-4 ring-red-100 animate-pulse' : 'bg-white border-slate-100 hover:border-indigo-400 hover:shadow-2xl hover:scale-[1.03]'}`}>
                          <p className="font-black text-slate-800 text-xs mb-1.5 leading-tight truncate px-1">{entry.subject}</p>
                          <p className="text-indigo-600 text-[10px] font-black truncate bg-indigo-50/50 rounded-full px-2 py-0.5 inline-block mx-auto max-w-full">{teacher?.name || 'مدرس محذوف'}</p>
                          
                          {conflict && (
                            <div className="mt-2 flex items-center justify-center gap-1">
                               <span className="w-1.5 h-1.5 bg-red-600 rounded-full" />
                               <p className="text-red-700 font-black text-[8px] uppercase tracking-tighter">تضارب!</p>
                            </div>
                          )}
                          
                          <button 
                            onClick={() => onDeleteEntry(entry.id)}
                            className="absolute -top-1 -left-1 bg-white shadow-xl text-red-500 hover:bg-red-500 hover:text-white rounded-full p-2 opacity-100 md:opacity-0 group-hover/cell:opacity-100 transition-all border border-slate-100 scale-90 md:scale-90"
                            title="حذف الحصة"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => onAddEntry(day, period, grade, level)}
                          className="w-full h-full rounded-3xl border-2 border-dashed border-slate-100 flex items-center justify-center text-slate-200 hover:text-indigo-600 hover:border-indigo-400 hover:bg-indigo-50/30 transition-all group/btn"
                        >
                          <div className="bg-slate-50 p-2 md:p-3 rounded-2xl group-hover/btn:bg-indigo-100 transition-colors">
                            <svg className="w-5 h-5 md:w-6 md:h-6 transition-transform group-hover/btn:scale-125" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
                          </div>
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

export default MasterGrid;
