
import React, { useState } from 'react';
import { Teacher, Subject, SchoolLevel, ScheduleEntry } from '../types';
import { LEVELS, GRADES_BY_LEVEL } from '../constants';

interface TeachersManagementProps {
  teachers: Teacher[];
  subjects: Subject[]; 
  entries: ScheduleEntry[];
  onAddTeacher: (teacher: Teacher) => void;
  onDeleteTeacher: (id: string) => void;
  onUpdateTeacher: (teacher: Teacher) => void;
}

const TeachersManagement: React.FC<TeachersManagementProps> = ({ teachers, subjects, entries, onAddTeacher, onDeleteTeacher, onUpdateTeacher }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    jobType: 'حكومي' as 'أهلي' | 'حكومي',
    lecturePrice: 0
  });
  
  // Assignment Form State
  const [assignLevel, setAssignLevel] = useState<SchoolLevel>(LEVELS[0]);
  const [assignGrade, setAssignGrade] = useState<string>('');
  const [assignSubjectId, setAssignSubjectId] = useState<string>('');
  
  // Temporary storage for assignments before saving teacher
  const [tempAssignments, setTempAssignments] = useState<string[]>([]); // Array of Subject IDs
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingChartId, setViewingChartId] = useState<string | null>(null);

  // Filter Logic
  const availableGrades = GRADES_BY_LEVEL[assignLevel];
  const availableSubjects = subjects.filter(s => s.level === assignLevel && (!assignGrade || s.grade === assignGrade));

  const handleAddAssignment = () => {
    if (!assignSubjectId) return;
    if (!tempAssignments.includes(assignSubjectId)) {
      setTempAssignments([...tempAssignments, assignSubjectId]);
    }
    setAssignSubjectId('');
  };

  const removeAssignment = (subId: string) => {
    setTempAssignments(tempAssignments.filter(id => id !== subId));
  };

  const resetForm = () => {
    setFormData({ name: '', phone: '', jobType: 'حكومي', lecturePrice: 0 });
    setTempAssignments([]);
    setEditingId(null);
    setAssignLevel(LEVELS[0]);
    setAssignGrade('');
    setAssignSubjectId('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    // Derive subject names from IDs for compatibility
    const subjectNames = tempAssignments.map(id => subjects.find(s => s.id === id)?.name || '').filter(n => n);

    const teacherData: Teacher = {
      id: editingId || Math.random().toString(36).substr(2, 9),
      name: formData.name,
      phoneNumber: formData.phone,
      specialization: subjectNames.join(', '), // Simple specialization string
      subjects: subjectNames,
      assignedSubjectIds: tempAssignments,
      jobType: formData.jobType,
      lecturePrice: formData.lecturePrice
    };

    if (editingId) {
      onUpdateTeacher(teacherData);
    } else {
      onAddTeacher(teacherData);
    }
    resetForm();
  };

  const startEdit = (t: Teacher) => {
    setFormData({
      name: t.name,
      phone: t.phoneNumber,
      jobType: t.jobType,
      lecturePrice: t.lecturePrice
    });
    setTempAssignments(t.assignedSubjectIds || []);
    setEditingId(t.id);
  };

  const viewingTeacher = teachers.find(t => t.id === viewingChartId);

  return (
    <div className="space-y-8 animate-fade-in relative">
      <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100">
        <div className="flex items-center gap-4 mb-8">
           <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
           </div>
           <div>
              <h2 className="text-2xl font-black text-slate-800">إدارة الكادر التدريسي</h2>
              <p className="text-blue-500 font-bold text-[10px] uppercase tracking-widest">إضافة المعلمين وتوزيع الحصص حسب المرحلة والصف</p>
           </div>
        </div>

        {/* Main Form */}
        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 mb-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <form onSubmit={handleSubmit} className="space-y-4">
             <h3 className="font-black text-slate-700 mb-4">بيانات المدرس الأساسية</h3>
             <div className="grid grid-cols-2 gap-4">
               <input type="text" placeholder="الاسم الكامل" className="p-3 border-2 rounded-xl outline-none focus:ring-4 focus:ring-blue-100 font-bold w-full" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
               <input type="text" placeholder="رقم الهاتف" className="p-3 border-2 rounded-xl outline-none focus:ring-4 focus:ring-blue-100 font-bold w-full" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
             </div>
             <div className="grid grid-cols-2 gap-4">
               <select className="p-3 border-2 rounded-xl outline-none focus:ring-4 focus:ring-blue-100 font-bold w-full" value={formData.jobType} onChange={e => setFormData({...formData, jobType: e.target.value as any})}>
                  <option value="حكومي">حكومي</option>
                  <option value="أهلي">أهلي</option>
               </select>
               {formData.jobType === 'أهلي' && (
                 <input type="number" placeholder="سعر الحصة" className="p-3 border-2 rounded-xl outline-none focus:ring-4 focus:ring-blue-100 font-bold w-full" value={formData.lecturePrice} onChange={e => setFormData({...formData, lecturePrice: Number(e.target.value)})} />
               )}
             </div>
             <div className="flex gap-2 mt-4">
                <button type="submit" className={`flex-1 ${editingId ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-600 hover:bg-blue-700'} text-white font-black py-3 rounded-xl shadow-lg transition-all`}>
                  {editingId ? 'حفظ التعديلات' : 'إضافة المدرس'}
                </button>
                {editingId && <button type="button" onClick={resetForm} className="bg-slate-200 text-slate-500 px-6 rounded-xl font-bold">إلغاء</button>}
             </div>
          </form>

          <div className="bg-white p-6 rounded-2xl border border-blue-100">
             <h3 className="font-black text-slate-700 mb-4">تخصيص المواد (التوزيع)</h3>
             <div className="space-y-3">
               <div className="grid grid-cols-3 gap-2">
                 <select className="p-2 border rounded-lg text-xs font-bold" value={assignLevel} onChange={e => { setAssignLevel(e.target.value as SchoolLevel); setAssignGrade(''); }}>
                   {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                 </select>
                 <select className="p-2 border rounded-lg text-xs font-bold" value={assignGrade} onChange={e => setAssignGrade(e.target.value)}>
                   <option value="">-- كل الصفوف --</option>
                   {availableGrades.map(g => <option key={g} value={g}>{g}</option>)}
                 </select>
                 <select className="p-2 border rounded-lg text-xs font-bold" value={assignSubjectId} onChange={e => setAssignSubjectId(e.target.value)}>
                   <option value="">-- اختر المادة --</option>
                   {availableSubjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.grade})</option>)}
                 </select>
               </div>
               <button type="button" onClick={handleAddAssignment} disabled={!assignSubjectId} className="w-full bg-indigo-50 text-indigo-700 font-bold py-2 rounded-lg hover:bg-indigo-100 text-xs border border-indigo-200">
                 + إضافة المادة للقائمة
               </button>
               
               <div className="mt-4 max-h-40 overflow-y-auto custom-scrollbar border-t pt-2">
                 {tempAssignments.length === 0 && <p className="text-[10px] text-slate-400 text-center italic">لم يتم تخصيص مواد بعد</p>}
                 {tempAssignments.map(subId => {
                   const sub = subjects.find(s => s.id === subId);
                   return (
                     <div key={subId} className="flex justify-between items-center bg-slate-50 p-2 rounded-lg mb-1 border border-slate-100">
                       <div>
                         <p className="text-xs font-black text-slate-700">{sub?.name}</p>
                         <p className="text-[9px] text-slate-400">{sub?.level} - {sub?.grade}</p>
                       </div>
                       <button onClick={() => removeAssignment(subId)} className="text-red-400 hover:text-red-600">
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                       </button>
                     </div>
                   );
                 })}
               </div>
             </div>
          </div>
        </div>

        {/* Teachers Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b-2">
              <tr>
                <th className="p-4">اسم المدرس</th>
                <th className="p-4">رقم الهاتف</th>
                <th className="p-4 text-center">نوع الوظيفة</th>
                <th className="p-4">ملخص المواد</th>
                <th className="p-4 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="text-sm font-bold text-slate-700">
              {teachers.map(t => (
                <tr key={t.id} className="border-b last:border-0 hover:bg-slate-50 transition-colors group">
                  <td className="p-4 font-black">{t.name}</td>
                  <td className="p-4 font-mono text-xs">{t.phoneNumber}</td>
                  <td className="p-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-[9px] ${t.jobType === 'أهلي' ? 'bg-orange-100 text-orange-700' : 'bg-emerald-100 text-emerald-700'}`}>{t.jobType}</span>
                  </td>
                  <td className="p-4">
                     <div className="flex flex-wrap gap-1">
                       {t.assignedSubjectIds?.slice(0, 3).map(sid => {
                         const s = subjects.find(sub => sub.id === sid);
                         return <span key={sid} className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-[9px] border border-indigo-100">{s?.name}</span>
                       })}
                       {(t.assignedSubjectIds?.length || 0) > 3 && <span className="text-[9px] text-slate-400">+{((t.assignedSubjectIds?.length || 0) - 3)} المزيد</span>}
                     </div>
                  </td>
                  <td className="p-4 text-center flex justify-center gap-2">
                    <button onClick={() => setViewingChartId(t.id)} className="p-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors" title="مخطط الحصص">
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                    </button>
                    <button onClick={() => startEdit(t)} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                    <button onClick={() => onDeleteTeacher(t.id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sub-window: Workload Chart Modal */}
      {viewingTeacher && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">
            <div className="bg-[#0f172a] p-6 text-white flex justify-between items-center shrink-0">
               <div>
                  <h2 className="text-xl font-black">مخطط توزيع الحصص</h2>
                  <p className="text-blue-300 text-xs font-bold">{viewingTeacher.name} - {viewingTeacher.jobType}</p>
               </div>
               <button onClick={() => setViewingChartId(null)} className="bg-white/10 hover:bg-white/20 p-2 rounded-xl transition-colors">
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
               </button>
            </div>
            
            <div className="p-8 overflow-y-auto">
               <table className="w-full text-right border-collapse">
                 <thead>
                   <tr className="bg-slate-100 text-slate-500 text-[10px] uppercase tracking-widest">
                     <th className="p-3 border rounded-tr-xl">المادة</th>
                     <th className="p-3 border">المرحلة</th>
                     <th className="p-3 border">الصف</th>
                     <th className="p-3 border text-center">المطلوب (Quota)</th>
                     <th className="p-3 border rounded-tl-xl text-center">الفعلي (Scheduled)</th>
                   </tr>
                 </thead>
                 <tbody className="text-sm font-bold text-slate-700">
                    {viewingTeacher.assignedSubjectIds?.map(sid => {
                      const sub = subjects.find(s => s.id === sid);
                      if (!sub) return null;
                      const scheduledCount = entries.filter(e => e.teacherId === viewingTeacher.id && e.level === sub.level && e.grade === sub.grade && e.subject === sub.name).length;
                      const required = sub.sessionsPerWeek || 4;
                      const statusColor = scheduledCount === required ? 'text-emerald-600' : scheduledCount > required ? 'text-red-500' : 'text-orange-500';
                      
                      return (
                        <tr key={sid} className="border-b border-slate-100">
                          <td className="p-3 border-l border-r border-slate-100 font-black">{sub.name}</td>
                          <td className="p-3 border-r border-slate-100">{sub.level}</td>
                          <td className="p-3 border-r border-slate-100">{sub.grade}</td>
                          <td className="p-3 border-r border-slate-100 text-center">{required}</td>
                          <td className={`p-3 border-l border-r border-slate-100 text-center font-black ${statusColor}`}>
                            {scheduledCount}
                          </td>
                        </tr>
                      );
                    })}
                    {(!viewingTeacher.assignedSubjectIds || viewingTeacher.assignedSubjectIds.length === 0) && (
                      <tr><td colSpan={5} className="p-8 text-center text-slate-400">لا توجد مواد مخصصة لهذا المدرس</td></tr>
                    )}
                 </tbody>
                 <tfoot className="bg-slate-50 font-black">
                    <tr>
                      <td colSpan={3} className="p-3 text-left pl-4">المجموع الكلي:</td>
                      <td className="p-3 text-center">
                        {viewingTeacher.assignedSubjectIds?.reduce((acc, sid) => acc + (subjects.find(s => s.id === sid)?.sessionsPerWeek || 4), 0) || 0}
                      </td>
                      <td className="p-3 text-center text-blue-600">
                        {entries.filter(e => e.teacherId === viewingTeacher.id).length}
                      </td>
                    </tr>
                 </tfoot>
               </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeachersManagement;
