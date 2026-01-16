
import React, { useState } from 'react';
import { User, ViewType } from '../types';

interface UsersManagementProps {
  users: User[];
  onAddUser: (user: User) => void;
  onDeleteUser: (id: string) => void;
}

const ALL_PERMISSIONS: { id: ViewType; label: string }[] = [
  { id: 'dashboard', label: 'لوحة التحكم' },
  { id: 'master', label: 'الجدول العام' },
  { id: 'schedules', label: 'جداول الصفوف' },
  { id: 'subjects_manage', label: 'إدارة المواد' },
  { id: 'teachers_manage', label: 'إدارة المدرسين' },
  { id: 'absences', label: 'سجل الغيابات' },
  { id: 'salaries', label: 'نظام الرواتب' },
  { id: 'teachers_view', label: 'عرض الجداول' },
  { id: 'reports', label: 'مركز التقارير' },
  { id: 'management', label: 'إعدادات النظام' },
  { id: 'users_manage', label: 'إدارة المستخدمين' },
];

const UsersManagement: React.FC<UsersManagementProps> = ({ users, onAddUser, onDeleteUser }) => {
  const [newUser, setNewUser] = useState({ username: '', password: '', permissions: [] as ViewType[] });

  const handleTogglePermission = (p: ViewType) => {
    setNewUser(prev => ({
      ...prev,
      permissions: prev.permissions.includes(p)
        ? prev.permissions.filter(x => x !== p)
        : [...prev.permissions, p]
    }));
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.username || !newUser.password) return;
    onAddUser({
      id: Math.random().toString(36).substr(2, 9),
      ...newUser,
      role: 'staff'
    });
    setNewUser({ username: '', password: '', permissions: [] });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100">
        <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-2">
          <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
          إدارة مستخدمي النظام والصلاحيات
        </h2>

        <form onSubmit={handleAdd} className="bg-slate-50 p-6 rounded-3xl border border-slate-100 mb-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input 
              type="text" 
              placeholder="اسم المستخدم" 
              className="p-3 border-2 rounded-xl font-bold outline-none focus:ring-4 focus:ring-indigo-100" 
              value={newUser.username} 
              onChange={e => setNewUser({...newUser, username: e.target.value})} 
              required 
            />
            <input 
              type="password" 
              placeholder="كلمة المرور" 
              className="p-3 border-2 rounded-xl font-bold outline-none focus:ring-4 focus:ring-indigo-100" 
              value={newUser.password} 
              onChange={e => setNewUser({...newUser, password: e.target.value})} 
              required 
            />
          </div>

          <div>
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 block">تحديد نوافذ الصلاحيات المتاحة:</label>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {ALL_PERMISSIONS.map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleTogglePermission(p.id)}
                  className={`p-2 rounded-xl text-[9px] font-black transition-all border-2 ${newUser.permissions.includes(p.id) ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white text-slate-400 border-slate-100 hover:border-indigo-200'}`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" className="w-full bg-indigo-600 text-white font-black py-3 rounded-xl shadow-lg hover:bg-indigo-700 transition-all">إضافة مستخدم جديد</button>
        </form>

        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b-2">
              <tr>
                <th className="p-4">المستخدم</th>
                <th className="p-4">نوع الحساب</th>
                <th className="p-4">الصلاحيات الممنوحة</th>
                <th className="p-4 text-center">إجراء</th>
              </tr>
            </thead>
            <tbody className="text-sm font-bold text-slate-700">
              {users.map(u => (
                <tr key={u.id} className="border-b last:border-0 hover:bg-slate-50 transition-colors">
                  <td className="p-4">{u.username}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-lg text-[9px] ${u.role === 'admin' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>{u.role === 'admin' ? 'مدير نظام' : 'موظف'}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {u.permissions.map(permId => (
                        <span key={permId} className="bg-slate-200 px-2 py-0.5 rounded text-[8px]">{ALL_PERMISSIONS.find(ap => ap.id === permId)?.label}</span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    {u.role !== 'admin' && (
                      <button onClick={() => onDeleteUser(u.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    )}
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

export default UsersManagement;
