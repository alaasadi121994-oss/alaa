
import React, { useState } from 'react';
import { Holiday, Teacher } from '../types';

interface HolidaysManagementProps {
  holidays: Holiday[];
  teachers: Teacher[];
  onAddHoliday: (holiday: Holiday) => void;
  onDeleteHoliday: (id: string) => void;
  onUpdateHoliday: (holiday: Holiday) => void;
}

const HolidaysManagement: React.FC<HolidaysManagementProps> = ({ 
  holidays, 
  teachers, 
  onAddHoliday, 
  onDeleteHoliday, 
  onUpdateHoliday 
}) => {
  const [formData, setFormData] = useState<Partial<Holiday>>({
    name: '',
    startDate: new Date().toISOString().split('T')[0],
    daysCount: 1,
    exceptionTeacherIds: []
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.startDate) return;

    const holidayData: Holiday = {
      id: editingId || Math.random().toString(36).substr(2, 9),
      name: formData.name,
      startDate: formData.startDate,
      daysCount: formData.daysCount || 1,
      exceptionTeacherIds: formData.exceptionTeacherIds || []
    };

    if (editingId) {
      onUpdateHoliday(holidayData);
      setEditingId(null);
    } else {
      onAddHoliday(holidayData);
    }
    
    setFormData({
      name: '',
      startDate: new Date().toISOString().split('T')[0],
      daysCount: 1,
      exceptionTeacherIds: []
    });
  };

  const handleEdit = (h: Holiday) => {
    setEditingId(h.id);
    setFormData({
      name: h.name,
      startDate: h.startDate,
      daysCount: h.daysCount,
      exceptionTeacherIds: h.exceptionTeacherIds
    });
  };

  const toggleException = (teacherId: string) => {
    const current = formData.exceptionTeacherIds || [];
    if (current.includes(teacherId)) {
      setFormData({ ...formData, exceptionTeacherIds: current.filter(id => id !== teacherId) });
    } else {
      setFormData({ ...formData, exceptionTeacherIds: [...current, teacherId] });
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100">
        <div className="flex items-center gap-4 mb-8">
           <div className="w-14 h-14 bg-pink-100 rounded-2xl flex items-center justify-center">
              <svg className="w-8 h-8 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
           </div>
           <div>
              <h2 className="text-2xl font-black text-slate-800">إدارة العطل الرسمية والاستثناءات</h2>
              <p className="text-pink-500 font-bold text-[10px] uppercase tracking-widest">تحديد أيام العطل واستقطاعات الرواتب مع استثناء الكوادر المداومة</p>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-1 bg-pink-50 p-6 rounded-3xl border border-pink-100">
             <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="font-black text-pink-900 mb-4">{editingId ? 'تعديل بيانات العطلة' : 'إضافة عطلة جديدة'}</h3>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-pink-800 mr-2">اسم المناسبة / العطلة</label>
                  <input 
                    type="text" 
                    className="w-full p-3 border-2 border-pink-200 rounded-xl font-bold bg-white focus:ring-4 focus:ring-pink-200 outline-none" 
                    placeholder="مثال: عيد الفطر المبارك"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                   <div className="space-y-1">
                      <label className="text-[10px] font-black text-pink-800 mr-2">تاريخ البدء</label>
                      <input 
                        type="date" 
                        className="w-full p-3 border-2 border-pink-200 rounded-xl font-bold bg-white text-xs" 
                        value={formData.startDate}
                        onChange={e => setFormData({...formData, startDate: e.target.value})}
                        required
                      />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[10px] font-black text-pink-800 mr-2">عدد الأيام</label>
                      <input 
                        type="number" 
                        min="1"
                        className="w-full p-3 border-2 border-pink-200 rounded-xl font-bold bg-white text-center" 
                        value={formData.daysCount}
                        onChange={e => setFormData({...formData, daysCount: parseInt(e.target.value)})}
                        required
                      />
                   </div>
                </div>

                <div className="space-y-2 pt-2">
                   <label className="text-[10px] font-black text-pink-800 mr-2 block">استثناءات الكادر (من داوم في العطلة)</label>
                   <div className="bg-white border-2 border-pink-200 rounded-xl p-2 h-40 overflow-y-auto custom-scrollbar">
                      {teachers.length === 0 && <p className="text-center text-xs text-slate-400 p-4">لا يوجد مدرسين</p>}
                      {teachers.map(t => (
                        <div key={t.id} onClick={() => toggleException(t.id)} className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${formData.exceptionTeacherIds?.includes(t.id) ? 'bg-pink-100' : 'hover:bg-slate-50'}`}>
                           <div className={`w-4 h-4 rounded border flex items-center justify-center ${formData.exceptionTeacherIds?.includes(t.id) ? 'bg-pink-500 border-pink-500' : 'border-slate-300'}`}>
                              {formData.exceptionTeacherIds?.includes(t.id) && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                           </div>
                           <span className="text-xs font-bold text-slate-700">{t.name}</span>
                        </div>
                      ))}
                   </div>
                   <p className="text-[9px] text-pink-600 font-bold">* المدرس المحدد هنا لن يتم استقطاع راتبه لهذه العطلة.</p>
                </div>

                <div className="flex gap-2 pt-4">
                   <button type="submit" className="flex-1 bg-pink-600 text-white py-3 rounded-xl font-black text-xs shadow-lg hover:bg-pink-700 transition-all">
                     {editingId ? 'حفظ التعديلات' : 'إضافة العطلة'}
                   </button>
                   {editingId && (
                     <button type="button" onClick={() => { setEditingId(null); setFormData({ name: '', startDate: new Date().toISOString().split('T')[0], daysCount: 1, exceptionTeacherIds: [] }); }} className="px-4 bg-white text-slate-500 border-2 border-slate-200 py-3 rounded-xl font-black text-xs hover:bg-slate-50">
                       إلغاء
                     </button>
                   )}
                </div>
             </form>
          </div>

          {/* List */}
          <div className="lg:col-span-2">
             <div className="overflow-hidden rounded-3xl border border-slate-200 shadow-sm">
                <table className="w-full text-right bg-white">
                   <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase tracking-widest font-black">
                      <tr>
                         <th className="p-4">اسم العطلة</th>
                         <th className="p-4 text-center">التاريخ والمدة</th>
                         <th className="p-4">المستثنون (الدوام)</th>
                         <th className="p-4 text-center">إجراءات</th>
                      </tr>
                   </thead>
                   <tbody className="text-sm font-bold text-slate-700 divide-y divide-slate-100">
                      {holidays.map(h => (
                         <tr key={h.id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-4 font-black text-pink-900">{h.name}</td>
                            <td className="p-4 text-center">
                               <div className="bg-slate-100 rounded-lg px-3 py-1 inline-block">
                                  <span className="text-slate-800">{h.startDate}</span>
                                  <span className="text-slate-400 mx-2">|</span>
                                  <span className="text-pink-600">{h.daysCount} يوم</span>
                               </div>
                            </td>
                            <td className="p-4">
                               <div className="flex flex-wrap gap-1">
                                  {h.exceptionTeacherIds.length > 0 ? (
                                     h.exceptionTeacherIds.map(tid => {
                                        const t = teachers.find(tea => tea.id === tid);
                                        return <span key={tid} className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-[10px] border border-emerald-100">{t?.name}</span>
                                     })
                                  ) : (
                                     <span className="text-slate-400 text-[10px] italic">لا يوجد استثناءات (استقطاع للجميع)</span>
                                  )}
                               </div>
                            </td>
                            <td className="p-4 text-center">
                               <div className="flex justify-center gap-2">
                                  <button onClick={() => handleEdit(h)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                  </button>
                                  <button onClick={() => onDeleteHoliday(h.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                  </button>
                               </div>
                            </td>
                         </tr>
                      ))}
                      {holidays.length === 0 && (
                         <tr><td colSpan={4} className="p-8 text-center text-slate-300 font-bold">لم يتم إضافة عطل رسمية بعد</td></tr>
                      )}
                   </tbody>
                </table>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HolidaysManagement;
