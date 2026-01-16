
import React, { useState } from 'react';

interface LoginProps {
  onLogin: (user: string, pass: string) => boolean;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onLogin(username, password)) {
      setError(false);
    } else {
      setError(true);
      setTimeout(() => setError(false), 3000);
    }
  };

  return (
    <div className="h-screen w-screen bg-slate-900 flex items-center justify-center p-4 overflow-hidden relative font-tajawal" dir="rtl">
      {/* Abstract Background Shapes */}
      <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-600/30 rounded-full blur-[150px] animate-pulse"></div>
      <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-purple-600/20 rounded-full blur-[150px] animate-pulse" style={{animationDelay: '1s'}}></div>

      <div className="w-full max-w-md bg-white/10 backdrop-blur-2xl border border-white/10 rounded-[3rem] p-10 shadow-2xl z-10 animate-fade-in relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
        
        <div className="text-center mb-10 mt-2">
          <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[2rem] mx-auto flex items-center justify-center shadow-2xl mb-6 shadow-indigo-500/30 transform rotate-3 hover:rotate-0 transition-transform duration-500">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-black text-white mb-2">تسجيل الدخول</h1>
          <p className="text-indigo-200 text-sm font-bold uppercase tracking-widest opacity-80">نظام إدارة المؤسسة الذكي</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-indigo-200 mr-2 uppercase tracking-widest block">اسم المستخدم</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-slate-900/50 border border-indigo-500/30 rounded-2xl py-4 px-6 text-white outline-none focus:bg-slate-900/80 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/20 transition-all font-bold text-sm placeholder-slate-500"
              placeholder="اسم الحساب..."
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-indigo-200 mr-2 uppercase tracking-widest block">كلمة المرور</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-900/50 border border-indigo-500/30 rounded-2xl py-4 px-6 text-white outline-none focus:bg-slate-900/80 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/20 transition-all font-bold text-sm placeholder-slate-500"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-200 text-xs p-4 rounded-2xl text-center font-bold animate-bounce backdrop-blur-md">
              بيانات الدخول غير صحيحة!
            </div>
          )}

          <button 
            type="submit" 
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-2xl font-black text-sm shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:scale-[1.02] active:scale-[0.98] transition-all mt-4"
          >
            دخول آمن للنظام
          </button>
        </form>
        
        <p className="text-center text-slate-500 text-[10px] mt-8 font-bold opacity-50">الإصدار 2.0 - جميع الحقوق محفوظة</p>
      </div>
    </div>
  );
};

export default Login;
