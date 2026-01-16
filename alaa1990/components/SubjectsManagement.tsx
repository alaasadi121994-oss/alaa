
import React, { useState } from 'react';
import { Subject, SchoolLevel } from '../types';
import { LEVELS, GRADES_BY_LEVEL } from '../constants';

interface SubjectsManagementProps {
  subjects: Subject[];
  onAddSubject: (subject: Subject) => void;
  onDeleteSubject: (id: string) => void;
  onUpdateSubject: (subject: Subject) => void;
}

const SubjectsManagement: React.FC<SubjectsManagementProps> = ({ subjects, onAddSubject, onDeleteSubject, onUpdateSubject }) => {
  const [formData, setFormData] = useState({
    name: '',
    level: SchoolLevel.PRIMARY,
    grade: GRADES_BY_LEVEL[SchoolLevel.PRIMARY][0],
    price: 0,
    sessionsPerWeek: 4
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleLevelChange = (lvl: SchoolLevel) => {
    setFormData({
      ...formData,
      level: lvl,
      grade: GRADES_BY_LEVEL[lvl][0]
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    if (editingId) {
      onUpdateSubject({
        id: editingId,
        ...formData
      });
      setEditingId(null);
    } else {
      onAddSubject({
        id: Math.random().toString(36).substr(2, 9),
        ...formData
      });
    }
    setFormData({ ...formData, name: '', price: 0, sessionsPerWeek: 4 });
  };

  const startEdit = (subject: Subject) => {
    setFormData({
      name: subject.name,
      level: subject.level,
      grade: subject.grade,
      price: subject.price,
      sessionsPerWeek: subject.sessionsPerWeek || 4
    });
    setEditingId(subject.id);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100">
        <div className="flex items-center gap-4 mb-8">
           <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center">
              <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
           </div>
           <div>
              <h2 className="text-2xl font-black text-slate-800">إدارة المواد والأسعار</h2>
              <p className="text-emerald-500 font-bold text-[10px] uppercase tracking-widest">تخصيص أسعار المحاضرات وعدد الحصص الأسبوعية</p>
           </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-6 gap-4 bg-slate-50 p-6 rounded-3xl border border-slate-100 mb-8">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 mr-2">اسم المادة</label>
            <input 
              type="text" 
              placeholder="كيمياء" 
              className="w-full p-3 border-2 rounded-xl outline-none focus:ring-4 focus:ring-emerald-100 font-bold" 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
              required 
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 mr-2">المرحلة</label>
            <select 
              className="w-full p-3 border-2 rounded-xl outline-none focus:ring-4 focus:ring-emerald-100 font-bold" 
              value={formData.level} 
              onChange={e => handleLevelChange(e.target.value as SchoolLevel)}
            >
              {LEVELS.map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 mr-2">الصف</label>
            <select 
              className="w-full p-3 border-2 rounded-xl outline-none focus:ring-4 focus:ring-emerald-100 font-bold" 
              value={formData.grade} 
              onChange={e => setFormData({...formData, grade: e.target.value})}
            >
              {GRADES_BY_LEVEL[formData.level].map(grd => <option key={grd} value={grd}>{grd}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 mr-2">الحصص/أسبوع</label>
            <input 
              type="number" 
              min="1" max="10"
              className="w-full p-3 border-2 rounded-xl outline-none focus:ring-4 focus:ring-emerald-100 font-bold" 
              value={formData.sessionsPerWeek} 
              onChange={e => setFormData({...formData, sessionsPerWeek: Number(e.target.value)})} 
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 mr-2">سعر المحاضرة</label>
            <input 
              type="number" 
              className="w-full p-3 border-2 rounded-xl outline-none focus:ring-4 focus:ring-emerald-100 font-bold" 
              value={formData.price} 
              onChange={e => setFormData({...formData, price: Number(e.target.value)})} 
              placeholder="0"
            />
          </div>
          <div className="flex items-end gap-2">
            <button type="submit" className={`flex-1 ${editingId ? 'bg-orange-500 hover:bg-orange-600' : 'bg-emerald-600 hover:bg-emerald-700'} text-white font-black py-3.5 rounded-xl shadow-lg transition-all`}>
              {editingId ? 'تحديث' : 'إضافة'}
            </button>
            {editingId && (
              <button type="button" onClick={() => { setEditingId(null); setFormData({ ...formData, name: '', price: 0, sessionsPerWeek: 4 }); }} className="bg-slate-200 text-slate-500 py-3.5 px-4 rounded-xl font-bold">
                إلغاء
              </button>
            )}
          </div>
        </form>

        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b-2">
              <tr>
                <th className="p-4">اسم المادة</th>
                <th className="p-4">المرحلة</th>
                <th className="p-4">الصف</th>
                <th className="p-4 text-center">حصص/أسبوع</th>
                <th className="p-4 text-center">سعر المحاضرة</th>
                <th className="p-4 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="text-sm font-bold text-slate-700">
              {subjects.map(s => (
                <tr key={s.id} className="border-b last:border-0 hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-black">{s.name}</td>
                  <td className="p-4"><span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg text-[10px]">{s.level}</span></td>
                  <td className="p-4"><span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-[10px]">{s.grade}</span></td>
                  <td className="p-4 text-center"><span className="font-black text-emerald-600">{s.sessionsPerWeek || 4}</span></td>
                  <td className="p-4 text-center font-mono text-emerald-600">{(s.price || 0).toLocaleString()} د.ع</td>
                  <td className="p-4 text-center flex justify-center gap-2">
                    <button onClick={() => startEdit(s)} className="p-2 text-slate-300 hover:text-blue-500 transition-colors bg-blue-50 rounded-lg">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                    <button onClick={() => onDeleteSubject(s.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors bg-red-50 rounded-lg">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SubjectsManagement;
