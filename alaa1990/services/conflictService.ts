
import { ScheduleEntry, Conflict, Teacher } from '../types';

export const findConflicts = (entries: ScheduleEntry[], teachers: Teacher[]): Conflict[] => {
  const conflicts: Conflict[] = [];

  for (let i = 0; i < entries.length; i++) {
    for (let j = i + 1; j < entries.length; j++) {
      const a = entries[i];
      const b = entries[j];

      // تحقق إذا كان نفس المدرس محجوزاً في نفس اليوم ونفس الحصة (ولكن في سجلين مختلفين)
      if (
        a.teacherId === b.teacherId &&
        a.day === b.day &&
        a.period === b.period &&
        a.id !== b.id
      ) {
        const teacher = teachers.find(t => t.id === a.teacherId);
        conflicts.push({
          entryA: a,
          entryB: b,
          teacherName: teacher?.name || 'مدرس غير معروف',
          day: a.day,
          period: a.period
        });
      }
    }
  }

  return conflicts;
};
