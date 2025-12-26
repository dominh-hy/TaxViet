
import React, { useState, useEffect, useCallback } from 'react';
import { AppView, TaxCalculationData, TaxRecord, UserProfile } from './types';
import WelcomeScreen from './components/WelcomeScreen';
import LoginScreen from './components/LoginScreen';
import RegisterScreen from './components/RegisterScreen';
import ForgotPasswordScreen from './components/ForgotPasswordScreen';
import Dashboard from './components/Dashboard';
import TaxAssistant from './components/TaxAssistant';
import TaxCalculator from './components/TaxCalculator';
import TaxResults from './components/TaxResults';
import SettingsScreen from './components/SettingsScreen';
import TransactionHistory from './components/TransactionHistory';
import HelpCenter from './components/HelpCenter';
import TermsOfUse from './components/TermsOfUse';

interface RegisteredUser {
  emailOrPhone: string;
  fullName: string;
  password: string; // Bắt buộc
}

const INITIAL_PROFILE: UserProfile = {
  name: 'Người dùng mới',
  mst: 'Chưa cập nhật',
  type: 'Hộ kinh doanh cá thể',
  avatarUrl: 'https://picsum.photos/seed/taxviet/100/100',
  businessCategoryId: '1',
  vatRate: 0.01,
  pitRate: 0.005
};

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.WELCOME);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(() => {
    return localStorage.getItem('last-session-user');
  });
  
  const [users, setUsers] = useState<RegisteredUser[]>(() => {
    const saved = localStorage.getItem('registered-users');
    return saved ? JSON.parse(saved) : [];
  });

  const [records, setRecords] = useState<TaxRecord[]>([]);
  const [profile, setProfile] = useState<UserProfile>(INITIAL_PROFILE);
  const [calcData, setCalcData] = useState<TaxCalculationData | null>(null);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'system'>(() => (localStorage.getItem('theme-mode') as any) || 'system');
  const [language, setLanguage] = useState<'vi' | 'en'>(() => (localStorage.getItem('app-language') as any) || 'vi');
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(() => JSON.parse(localStorage.getItem('notifications-enabled') || 'false'));
  const [faceIdEnabled, setFaceIdEnabled] = useState<boolean>(() => JSON.parse(localStorage.getItem('faceid-enabled') || 'false'));

  useEffect(() => {
    if (currentUserEmail) {
      const savedRecords = localStorage.getItem(`tax-records-${currentUserEmail.toLowerCase()}`);
      const savedProfile = localStorage.getItem(`user-profile-${currentUserEmail.toLowerCase()}`);
      
      setRecords(savedRecords ? JSON.parse(savedRecords) : []);
      const user = users.find(u => u.emailOrPhone.toLowerCase() === currentUserEmail.toLowerCase());
      setProfile(savedProfile ? JSON.parse(savedProfile) : { ...INITIAL_PROFILE, name: user?.fullName || 'Người dùng' });
      localStorage.setItem('last-session-user', currentUserEmail.toLowerCase());
    } else {
      setRecords([]);
      setProfile(INITIAL_PROFILE);
      localStorage.removeItem('last-session-user');
    }
  }, [currentUserEmail, users]);

  useEffect(() => {
    if (currentUserEmail) {
      localStorage.setItem(`tax-records-${currentUserEmail.toLowerCase()}`, JSON.stringify(records));
    }
  }, [records, currentUserEmail]);

  useEffect(() => {
    if (currentUserEmail) {
      localStorage.setItem(`user-profile-${currentUserEmail.toLowerCase()}`, JSON.stringify(profile));
    }
  }, [profile, currentUserEmail]);

  useEffect(() => {
    localStorage.setItem('registered-users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    const root = window.document.documentElement;
    localStorage.setItem('theme-mode', themeMode);
    const applyTheme = (isDark: boolean) => {
      if (isDark) { root.classList.add('dark'); root.classList.remove('light'); }
      else { root.classList.add('light'); root.classList.remove('dark'); }
    };
    if (themeMode === 'system') {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)');
      applyTheme(systemDark.matches);
    } else {
      applyTheme(themeMode === 'dark');
    }
  }, [themeMode]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogin = (email: string, password?: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    const user = users.find(u => u.emailOrPhone.toLowerCase() === normalizedEmail);
    
    if (!user) {
      showToast("Tài khoản không tồn tại", "error");
      return;
    }
    
    if (password && user.password !== password) {
      showToast("Mật khẩu không chính xác", "error");
      return;
    }

    setCurrentUserEmail(normalizedEmail);
    setCurrentView(AppView.DASHBOARD);
    showToast(`Chào mừng quay lại, ${user.fullName}`);
  };

  const handleRegister = (userData: RegisteredUser) => {
    const normalizedEmail = userData.emailOrPhone.trim().toLowerCase();
    const existing = users.find(u => u.emailOrPhone.toLowerCase() === normalizedEmail);
    
    if (existing) {
      showToast("Email/SĐT này đã được đăng ký", "error");
      return;
    }

    const newUser = {
      ...userData,
      emailOrPhone: normalizedEmail
    };

    setUsers(prev => [...prev, newUser]);
    setCurrentUserEmail(normalizedEmail);
    setCurrentView(AppView.DASHBOARD);
    showToast("Đăng ký thành công!");
  };

  const handleLogout = () => {
    setCurrentUserEmail(null);
    setCurrentView(AppView.WELCOME);
  };

  const handleSaveResult = (finalTaxAmount: number) => {
    if (!calcData) return;
    
    const now = new Date();
    const dateStr = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;
    const periodLabel = calcData.period === 'quarter' ? 'Quý 2026' : 'Năm 2026';

    const newRecord: TaxRecord = {
      id: Date.now().toString(),
      month: `Dự toán ${periodLabel} (${dateStr})`,
      revenue: calcData.revenue,
      taxAmount: finalTaxAmount,
      status: 'pending'
    };
    
    setRecords(prev => [newRecord, ...prev]);
    showToast("Đã lưu vào lịch sử cá nhân");
    setCurrentView(AppView.DASHBOARD);
  };

  const renderView = () => {
    switch (currentView) {
      case AppView.WELCOME:
        return <WelcomeScreen onStart={() => setCurrentView(AppView.REGISTER)} onLogin={() => setCurrentView(AppView.LOGIN)} />;
      case AppView.LOGIN:
        return (
          <LoginScreen 
            faceIdEnabled={faceIdEnabled} 
            onLogin={handleLogin} 
            onBack={() => setCurrentView(AppView.WELCOME)} 
            onRegister={() => setCurrentView(AppView.REGISTER)} 
            onForgotPassword={() => setCurrentView(AppView.FORGOT_PASSWORD)}
          />
        );
      case AppView.REGISTER:
        return <RegisterScreen onBack={() => setCurrentView(AppView.LOGIN)} onLoginClick={() => setCurrentView(AppView.LOGIN)} onRegisterSuccess={handleRegister} />;
      case AppView.FORGOT_PASSWORD:
        return <ForgotPasswordScreen onBack={() => setCurrentView(AppView.LOGIN)} onLoginClick={() => setCurrentView(AppView.LOGIN)} />;
      case AppView.DASHBOARD:
        return <Dashboard 
                  records={records}
                  profile={profile}
                  onNavigate={setCurrentView} 
                  onLogout={handleLogout}
                  onDeleteRecord={(id) => setRecords(prev => prev.filter(r => r.id !== id))}
                  onToggleStatus={(id) => setRecords(prev => prev.map(r => r.id === id ? { ...r, status: r.status === 'paid' ? 'pending' : 'paid' } : r))}
                />;
      case AppView.ASSISTANT:
        return <TaxAssistant onBack={() => setCurrentView(AppView.DASHBOARD)} />;
      case AppView.CALCULATOR:
        return <TaxCalculator onBack={() => setCurrentView(AppView.DASHBOARD)} onCalculate={(data) => { setCalcData(data); setCurrentView(AppView.TAX_RESULT); }} />;
      case AppView.TAX_RESULT:
        return <TaxResults profile={profile} data={calcData} onBack={() => setCurrentView(AppView.CALCULATOR)} onSave={handleSaveResult} />;
      case AppView.SETTINGS:
        return <SettingsScreen 
                  profile={profile}
                  onUpdateProfile={(p) => { setProfile(p); showToast("Cập nhật thành công"); }}
                  onNavigate={setCurrentView} 
                  onLogout={handleLogout}
                  themeMode={themeMode}
                  onThemeChange={setThemeMode}
                  language={language}
                  onLanguageChange={setLanguage}
                  notificationsEnabled={notificationsEnabled}
                  onToggleNotifications={() => setNotificationsEnabled(!notificationsEnabled)}
                  faceIdEnabled={faceIdEnabled}
                  onToggleFaceId={() => setFaceIdEnabled(!faceIdEnabled)}
                />;
      case AppView.TRANSACTION_HISTORY:
        return <TransactionHistory 
                  records={records}
                  onBack={() => setCurrentView(AppView.DASHBOARD)}
                  onDeleteRecord={(id) => setRecords(prev => prev.filter(r => r.id !== id))}
                  onToggleStatus={(id) => setRecords(prev => prev.map(r => r.id === id ? { ...r, status: r.status === 'paid' ? 'pending' : 'paid' } : r))}
                />;
      case AppView.HELP_CENTER:
        return <HelpCenter onBack={() => setCurrentView(AppView.SETTINGS)} />;
      case AppView.TERMS_OF_USE:
        return <TermsOfUse onBack={() => setCurrentView(AppView.SETTINGS)} />;
      default:
        return <WelcomeScreen onStart={() => setCurrentView(AppView.REGISTER)} onLogin={() => setCurrentView(AppView.LOGIN)} />;
    }
  };

  return (
    <div className="w-full max-w-md mx-auto h-screen bg-background-light dark:bg-background-dark overflow-hidden flex flex-col shadow-2xl relative transition-colors duration-300">
      {renderView()}
      {toast && (
        <div className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 rounded-2xl shadow-2xl animate-in slide-in-from-bottom-10 flex items-center gap-3 backdrop-blur-xl border
          ${toast.type === 'success' ? 'bg-green-500/90 text-white border-green-400/50' : 'bg-red-500/90 text-white border-red-400/50'}`}>
          <span className="material-symbols-outlined text-[20px]">{toast.type === 'success' ? 'check_circle' : 'error'}</span>
          <span className="text-sm font-bold uppercase tracking-wide">{toast.message}</span>
        </div>
      )}
    </div>
  );
};

export default App;
