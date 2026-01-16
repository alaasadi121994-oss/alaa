
import React from 'react';
import { Day, ScheduleEntry, Teacher } from '../types';
import { DAYS, PERIODS } from '../constants';

interface TeacherScheduleProps {
  teacher: Teacher;
  entries: ScheduleEntry[];
}

const TeacherSchedule: React.FC<TeacherScheduleProps> = ({ teacher, entries }) => {
  const teacherEntries = entries.filter(e => e.teacherId === teacher.id);

  const getEntry = (day: Day, period: number) => {
    return teacherEntries.find(e => e.day === day && e.period === period);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mt-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">جدول الأستاذ: {teacher.name}</h2>
        <span className="bg-blue-100 text-blue-800 px-4 py-1 rounded-full text-sm font-medium">مدرس مشترك</span>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr>
              <th className="border p-3 bg-gray-50 text-gray-700 font-medium">الحصة</th>
              {DAYS.map(day => (
                <th key={day} className="border p-3 bg-gray-50 text-gray-700 font-medium">{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PERIODS.map(period => (
              <tr key={period}>
                <td className="border p-3 bg-gray-50 font-bold text-center text-gray-600">الحصة {period}</td>
                {DAYS.map(day => {
                  const entry = getEntry(day, period);
                  return (
                    <td key={day} className="border p-3 h-20 text-center">
                      {entry ? (
                        <div className="flex flex-col">
                          <span className="font-bold text-blue-800 text-sm">{entry.subject}</span>
                          <span className="text-gray-500 text-xs mt-1">({entry.level})</span>
                        </div>
                      ) : (
                        <span className="text-gray-300">-</span>
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

export default TeacherSchedule;
