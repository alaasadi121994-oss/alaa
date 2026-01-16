
import React, { useState, useRef } from 'react';
import { InstitutionInfo, PrintSettings } from '../types';

interface ManagementProps {
  institution: InstitutionInfo;
  onUpdateInstitution: (info: InstitutionInfo) => void;
  userCredentials: {username: string, password: string};
  onUpdateCredentials: (creds: any) => void;
  onExportBackup: () => void;
  onExportExcel: () => void;
  onImportBackup: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isInstallable: boolean;
  onInstall: () => void;
  updateAvailable: boolean;
  isCheckingUpdate: boolean;
  onUpdateCheck: () => void;
  onUpdateApp: () => void;
  printSettings: PrintSettings;
  onUpdatePrintSettings: (settings: PrintSettings) => void;
  onPreviewWelcome: () => void;
}

const Management: React.FC<ManagementProps> = ({ 
  institution,
  onUpdateInstitution,
  userCredentials,
  onUpdateCredentials,
  onExportBackup,
  onExportExcel,
  onImportBackup,
  isInstallable,
  onInstall,
  updateAvailable,
  isCheckingUpdate,
  onUpdateCheck,
  onUpdateApp,
  printSettings,
  onUpdatePrintSettings,
  onPreviewWelcome
}) => {
  const [editCreds, setEditCreds] = useState({...userCredentials});
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showVbModal, setShowVbModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => onUpdateInstitution({ ...institution, logo: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  const updatePrint = (key: keyof PrintSettings, value: any) => {
    onUpdatePrintSettings({ ...printSettings, [key]: value });
  };

  return (
    <div className="space-y-8 pb-12 animate-fade-in custom-scrollbar">
      {/* VB/Offline Explanation Modal */}
      {showVbModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-[300] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl max-w-lg w-full p-8 border-4 border-white animate-fade-in text-center">
             <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
             </div>
             <h3 className="text-xl font-black text-slate-800 mb-2">البرنامج التنفيذي (Offline)</h3>
             <p className="text-sm font-bold text-slate-500 mb-6 leading-relaxed">
               هذا النظام مبني بأحدث تقنيات الويب (PWA) التي تتفوق على برامج الفيجوال بيسك القديمة.
               <br/><br/>
               للحصول على نسخة تعمل بدون إنترنت تماماً كبرنامج تنفيذي، قم بالضغط على زر 
               <span className="text-indigo-600 mx-1">"تنزيل وتثبيت البرنامج"</span> 
               أدناه. سيقوم النظام بتثبيت نفسه كبرنامج مستقل على جهازك.
             </p>
             <button onClick={() => setShowVbModal(false)} className="bg-slate-900 text-white px-8 py-3 rounded-xl font-black shadow-lg hover:bg-slate-800">حسناً، فهمت</button>
          </div>
        </div>
      )}

      {/* مركز إدارة البرنامج والتحديثات */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-indigo-100 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-500/5 rounded-full -ml-16 -mt-16"></div>
        <h2 className="text-xl font-black mb-6 text-indigo-900 flex items-center gap-3">
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          إعدادات النظام والصيانة
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-indigo-50 rounded-3xl border border-indigo-100 flex flex-col justify-between group hover:shadow-lg transition-all">
            <div>
              <h3 className="font-black text-indigo-900 mb-2 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                نسخة سطح المكتب (Offline)
              </h3>
              <p className="text-[11px] text-indigo-600 mb-6 font-bold leading-relaxed">قم بتنزيل البرنامج وتثبيته كأيقونة مستقلة تعمل بدون إنترنت، مع الاحتفاظ بكافة البيانات والتعديلات تلقائياً.</p>
            </div>
            <div className="space-y-3">
              <button 
                onClick={onInstall}
                disabled={!isInstallable}
                className={`flex items-center justify-center gap-3 w-full px-6 py-4 rounded-2xl font-black text-xs shadow-lg transition-all ${isInstallable ? 'bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-[1.02]' : 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-60'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                {isInstallable ? 'تنزيل وتثبيت البرنامج على الجهاز' : 'البرنامج مثبت حالياً على الجهاز'}
              </button>
              
              <button 
                onClick={() => setShowVbModal(true)}
                className="flex items-center justify-center gap-2 w-full px-6 py-3 rounded-2xl font-bold text-[10px] bg-white border border-indigo-200 text-indigo-600 hover:bg-indigo-50"
              >
                تحويل النظام لبرنامج تنفيذي (EXE)
              </button>
            </div>
          </div>

          <div className="p-6 bg-slate-800 rounded-3xl border border-slate-700 flex flex-col justify-between text-white group hover:shadow-lg transition-all">
            <div>
              <div className="flex justify-between items-start">
                <h3 className="font-black text-white mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                  تحديثات النظام
                </h3>
                {updateAvailable && <span className="bg-red-500 text-[8px] px-2 py-0.5 rounded-full animate-pulse font-black uppercase">جديد!</span>}
              </div>
              <p className="text-[11px] text-slate-400 mb-6 font-bold leading-relaxed">فحص وجود تحديثات برمجية جديدة لتحسين أداء النظام وإضافة مميزات جديدة.</p>
            </div>
            <button 
              onClick={updateAvailable ? onUpdateApp : onUpdateCheck}
              disabled={isCheckingUpdate}
              className={`flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-black text-xs shadow-lg transition-all ${updateAvailable ? 'bg-orange-600 text-white hover:bg-orange-500' : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'}`}
            >
              <svg className={`w-5 h-5 ${isCheckingUpdate ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              {isCheckingUpdate ? 'جاري الفحص المباشر...' : updateAvailable ? 'تثبيت التحديثات الجديدة الآن' : 'البحث عن تحديثات برمجية جديدة'}
            </button>
          </div>
        </div>
      </div>

      {/* إعدادات الطباعة والتقارير */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-emerald-100 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16"></div>
        <h2 className="text-xl font-black mb-6 text-emerald-900 flex items-center gap-3">
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
          إعدادات الطباعة والتقارير
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-emerald-50/30 p-6 rounded-3xl border border-emerald-100">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-emerald-700 uppercase tracking-widest block mr-2">اتجاه الصفحة</label>
            <div className="flex gap-2">
              <button 
                onClick={() => updatePrint('orientation', 'landscape')}
                className={`flex-1 py-3 rounded-xl font-bold text-xs transition-all border-2 ${printSettings.orientation === 'landscape' ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg' : 'bg-white text-emerald-600 border-emerald-100'}`}
              >
                أفقي (Landscape)
              </button>
              <button 
                onClick={() => updatePrint('orientation', 'portrait')}
                className={`flex-1 py-3 rounded-xl font-bold text-xs transition-all border-2 ${printSettings.orientation === 'portrait' ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg' : 'bg-white text-emerald-600 border-emerald-100'}`}
              >
                عمودي (Portrait)
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-emerald-700 uppercase tracking-widest block mr-2">حجم الورقة</label>
            <select 
              className="w-full p-3 border-2 border-emerald-100 rounded-xl font-bold text-sm bg-white outline-none focus:ring-4 focus:ring-emerald-200/20"
              value={printSettings.paperSize}
              onChange={(e) => updatePrint('paperSize', e.target.value)}
            >
              <option value="A4">A4 (قياسي)</option>
              <option value="A3">A3 (كبير)</option>
              <option value="Letter">Letter</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-emerald-700 uppercase tracking-widest block mr-2">تكبير الخط (مقياس)</label>
            <input 
              type="range" min="0.5" max="1.5" step="0.1" 
              className="w-full accent-emerald-600"
              value={printSettings.fontScale}
              onChange={(e) => updatePrint('fontScale', parseFloat(e.target.value))}
            />
            <div className="text-center text-[10px] font-bold text-emerald-600">{Math.round(printSettings.fontScale * 100)}%</div>
          </div>

          <div className="flex items-center gap-4 mt-4 bg-white p-3 rounded-2xl border border-emerald-100">
            <input 
              type="checkbox" 
              className="w-5 h-5 accent-emerald-600 cursor-pointer" 
              checked={printSettings.showHeaderLogo}
              onChange={(e) => updatePrint('showHeaderLogo', e.target.checked)}
              id="show-logo"
            />
            <label htmlFor="show-logo" className="text-xs font-black text-slate-700 cursor-pointer">إظهار شعار المؤسسة في التقارير</label>
          </div>

          <div className="flex items-center gap-4 mt-4 bg-white p-3 rounded-2xl border border-emerald-100">
            <input 
              type="checkbox" 
              className="w-5 h-5 accent-emerald-600 cursor-pointer" 
              checked={printSettings.showSignatureFields}
              onChange={(e) => updatePrint('showSignatureFields', e.target.checked)}
              id="show-sigs"
            />
            <label htmlFor="show-sigs" className="text-xs font-black text-slate-700 cursor-pointer">إظهار حقول التواقيع في الأسفل</label>
          </div>
        </div>
      </div>

      {/* هوية المؤسسة والرسالة الترحيبية */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
        <h2 className="text-xl font-black mb-6 flex items-center gap-3">
          <svg className="w-7 h-7 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
          هوية المؤسسة والرسائل
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 block mr-2 uppercase tracking-widest">اسم المدرسة/المؤسسة</label>
            <input type="text" className="w-full p-4 border-2 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-indigo-100" value={institution.name} onChange={e => onUpdateInstitution({ ...institution, name: e.target.value })} placeholder="اسم المؤسسة" />
            
            <label className="text-[10px] font-black text-slate-400 block mr-2 mt-4 uppercase tracking-widest">شعار المؤسسة الرسمي</label>
            <input type="file" accept="image/*" onChange={handleLogoChange} className="w-full text-xs font-bold file:p-3 file:rounded-xl file:bg-indigo-50 file:border-0 file:mr-4 file:cursor-pointer" />
            
            <div className="flex justify-center bg-slate-50 rounded-3xl p-6 items-center border-2 border-dashed border-slate-200 mt-4">
              {institution.logo ? <img src={institution.logo} className="max-h-40 object-contain shadow-lg rounded-xl" /> : <p className="text-slate-300 font-bold uppercase tracking-widest text-[10px]">معاينة الشعار تظهر هنا</p>}
            </div>
          </div>

          <div className="space-y-4 bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100">
             <h3 className="font-black text-indigo-900 mb-2">تخصيص الرسالة الترحيبية</h3>
             <label className="text-[10px] font-black text-slate-400 block mr-2 uppercase tracking-widest">عنوان الرسالة</label>
             <input type="text" className="w-full p-3 border-2 rounded-xl font-bold outline-none focus:ring-4 focus:ring-indigo-100" value={institution.welcomeTitle || ''} onChange={e => onUpdateInstitution({ ...institution, welcomeTitle: e.target.value })} placeholder="مثال: أهلاً بك في نظام الجداول" />
             
             <label className="text-[10px] font-black text-slate-400 block mr-2 mt-2 uppercase tracking-widest">نص الرسالة</label>
             <textarea 
               className="w-full p-3 border-2 rounded-xl font-bold outline-none focus:ring-4 focus:ring-indigo-100 h-32 resize-none" 
               value={institution.welcomeMessage || ''} 
               onChange={e => onUpdateInstitution({ ...institution, welcomeMessage: e.target.value })} 
               placeholder="اكتب رسالة ترحيبية أو تعليمات للمستخدمين ستظهر عند فتح البرنامج..." 
             />
             
             <button 
               onClick={onPreviewWelcome}
               className="w-full bg-indigo-600 text-white py-3 rounded-xl font-black text-xs shadow-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
             >
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
               حفظ ومعاينة الرسالة
             </button>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-l from-indigo-900 to-slate-900 p-8 rounded-[2.5rem] shadow-2xl text-white border border-white/10">
        <h2 className="text-xl font-black mb-6 flex items-center gap-3">
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          تحديث بيانات الدخول (حسابي)
        </h2>
        <form onSubmit={e => { e.preventDefault(); onUpdateCredentials(editCreds); setSaveSuccess(true); setTimeout(() => setSaveSuccess(false), 3000); }} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input type="text" className="bg-white/5 border border-white/10 p-4 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-blue-500/20" value={editCreds.username} onChange={e => setEditCreds({...editCreds, username: e.target.value})} placeholder="اسم المستخدم الجديد" />
          <input type="password" className="bg-white/5 border border-white/10 p-4 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-blue-500/20" value={editCreds.password} onChange={e => setEditCreds({...editCreds, password: e.target.value})} placeholder="كلمة المرور الجديدة" />
          <button type="submit" className="bg-indigo-600 p-4 rounded-2xl font-black text-sm shadow-xl hover:bg-indigo-500 transition-all">{saveSuccess ? 'تم تحديث البيانات!' : 'تحديث بياناتي'}</button>
        </form>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-blue-100 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16"></div>
        <h2 className="text-xl font-black mb-6 text-blue-900 flex items-center gap-3">
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
          قاعدة البيانات (Access / Excel Backup)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100 group hover:shadow-md transition-all">
            <h3 className="font-black text-blue-900 mb-2">تصدير قاعدة البيانات</h3>
            <p className="text-[11px] text-blue-600 mb-6 font-bold">حفظ نسخة كاملة من النظام لاستخدامها لاحقاً أو نقلها لجهاز آخر.</p>
            <div className="flex gap-2">
              <button 
                onClick={onExportBackup}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-2xl font-black text-xs shadow-lg hover:bg-blue-700 transition-all flex-1 justify-center"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                ملف النظام (.school)
              </button>
              <button 
                onClick={onExportExcel}
                className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-3 rounded-2xl font-black text-xs shadow-lg hover:bg-emerald-700 transition-all flex-1 justify-center"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                تصدير لـ Excel
              </button>
            </div>
          </div>

          <div className="p-6 bg-orange-50 rounded-3xl border border-orange-100 group hover:shadow-md transition-all">
            <h3 className="font-black text-orange-900 mb-2">استرجاع البيانات</h3>
            <p className="text-[11px] text-orange-600 mb-6 font-bold">رفع ملف قاعدة البيانات (.school) لاستعادة كافة البيانات والجداول.</p>
            <input 
              type="file" 
              accept=".school,.json" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={onImportBackup} 
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-3 bg-orange-600 text-white px-6 py-3 rounded-2xl font-black text-xs shadow-lg hover:bg-orange-700 transition-all w-full justify-center"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
              استيراد قاعدة بيانات من ملف
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Management;
