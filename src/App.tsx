/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { dbService } from './db/databaseService';
import { AppSettings, CartItem } from './types';
import Dashboard from './pages/Dashboard';
import Movies from './pages/Movies';
import SeriesPage from './pages/Series';
import SalesPage from './pages/Sales';
import SettingsPage from './pages/Settings';
import DBLogger from './components/DBLogger';
import CartBar from './components/CartBar';
import { 
  LayoutDashboard, 
  Film, 
  Tv, 
  CreditCard, 
  Settings as SettingsIcon, 
  Monitor, 
  Minimize2, 
  Maximize, 
  X, 
  Database,
  HelpCircle,
  RefreshCw,
  FolderOpen,
  Info,
  Sun,
  Moon
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'movies' | 'series' | 'sales' | 'settings'>('dashboard');
  const [appSettings, setAppSettings] = useState<AppSettings>(dbService.getSettings());
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showFileMenu, setShowFileMenu] = useState(false);

  // Active Customer and Shopping Cart States
  const [currentCustomer, setCurrentCustomer] = useState<string>(() => {
    return localStorage.getItem('mediacenter_active_customer') || '';
  });
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('mediacenter_active_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Sync state to localStorage on modifications
  useEffect(() => {
    localStorage.setItem('mediacenter_active_customer', currentCustomer);
  }, [currentCustomer]);

  useEffect(() => {
    localStorage.setItem('mediacenter_active_cart', JSON.stringify(cart));
  }, [cart]);

  // Cart operations helpers
  const handleAddToCart = (item: Omit<CartItem, 'id'>) => {
    const newItem: CartItem = {
      ...item,
      id: 'cart_' + Math.random().toString(36).substring(2, 9)
    };
    setCart(prev => [...prev, newItem]);
  };

  const handleRemoveCartItem = (id: string) => {
    setCart(prev => prev.filter(i => i.id !== id));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handleUpdateCartItemPrice = (id: string, price: number) => {
    setCart(prev => prev.map(item => item.id === id ? { ...item, salePrice: price } : item));
  };

  const handleInvoiceSettled = () => {
    setActiveTab('sales'); // Navigate directly to accounting page to view results
  };

  // Apply visual theme class (dark/light) to root HTML element
  useEffect(() => {
    const root = window.document.documentElement;
    if (appSettings.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [appSettings.theme]);

  // Quick theme toggler with database persistence
  const toggleTheme = () => {
    const newTheme = appSettings.theme === 'dark' ? 'light' : 'dark';
    const updatedSettings = {
      ...appSettings,
      theme: newTheme
    };
    dbService.updateSettings(updatedSettings);
    setAppSettings(updatedSettings);
    // Dispatch custom event to notify other mounted components (like settings page)
    window.dispatchEvent(new Event('theme_changed'));
  };

  // Deep linking callback: Go to movies or series catalog on request
  const handleViewMedia = (type: 'movie' | 'series', id: string) => {
    if (type === 'movie') {
      setActiveTab('movies');
    } else {
      setActiveTab('series');
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'داشبورد / پیش‌خوان', icon: LayoutDashboard },
    { id: 'movies', label: 'مدیریت فیلم‌ها', icon: Film },
    { id: 'series', label: 'مدیریت سریال‌ها', icon: Tv },
    { id: 'sales', label: 'فروش و مدیریت مالی', icon: CreditCard },
    { id: 'settings', label: 'تنظیمات مدیا سنتر', icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f172a] text-gray-800 dark:text-gray-100 font-sans flex flex-col selection:bg-indigo-500 selection:text-white" dir="rtl" id="app-root-shell">
      
      {/* 1. Desktop Menubar (The Native OS window frame is enabled, offering full drag and drop) */}
      <header className="h-12 bg-white dark:bg-[#1e293b] border-b border-gray-150 dark:border-gray-800 flex items-center justify-between px-4 select-none shrink-0" id="desktop-titlebar">
        {/* Right section: System logo & App Title */}
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20">
            <Tv className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-xs font-black tracking-tight text-gray-900 dark:text-gray-100">مدیا سنتر</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block" title="دیتابیس آماده هماهنگی است"></span>
          
          {/* Simulated File Menu Bar */}
          <div className="hidden sm:flex items-center gap-1.5 mr-4 text-[11px] font-semibold text-gray-550 dark:text-gray-300 relative">
            
            {/* File menu */}
            <div className="relative">
              <button 
                onClick={() => setShowFileMenu(!showFileMenu)} 
                className="px-2.5 py-1 rounded hover:bg-gray-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                id="menu-trigger-file"
              >
                فایل
              </button>
              {showFileMenu && (
                <div className="absolute right-0 top-full mt-1 bg-white dark:bg-[#1e293b] border border-gray-150 dark:border-gray-800 rounded-lg shadow-xl py-1.5 w-40 z-50 animate-fadeIn" id="file-dropdown">
                  <button 
                    onClick={() => { setShowFileMenu(false); setActiveTab('settings'); }}
                    className="w-full text-right px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-slate-800 text-[10.5px] font-bold block"
                  >
                    پشتیبان‌گیری دیتابیس
                  </button>
                  <button 
                    onClick={() => { setShowFileMenu(false); if (window.confirm('آیا مایلید تمام سوابق برنامه را بازنشانی کنید؟')) { dbService.resetDatabase(); window.location.reload(); } }}
                    className="w-full text-right px-3 py-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 text-[10.5px] font-bold block"
                  >
                    بازنشانی دیتابیس
                  </button>
                  <div className="border-t border-gray-100 dark:border-gray-800 my-1"></div>
                  <button 
                    onClick={() => { setShowFileMenu(false); alert('رابط کاربری شبیه‌ساز Electron باز است. برای خروج در نسخه دسکتاپ alt+f4 را بفشارید.'); }}
                    className="w-full text-right px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-slate-800 text-[10.5px] block"
                  >
                    خروج از برنامه
                  </button>
                </div>
              )}
            </div>

            <button onClick={() => window.location.reload()} className="px-2.5 py-1 rounded hover:bg-gray-100 dark:hover:bg-slate-800 cursor-pointer transition-colors">نمایش</button>
            <button onClick={() => setActiveTab('settings')} className="px-2.5 py-1 rounded hover:bg-gray-100 dark:hover:bg-slate-800 cursor-pointer transition-colors">ابزارها</button>
            <button onClick={() => setShowAboutModal(true)} className="px-2.5 py-1 rounded hover:bg-gray-100 dark:hover:bg-slate-800 cursor-pointer transition-colors" id="btn-about-trigger">درباره</button>
          </div>
        </div>

        {/* Left section (active status path & theme toggle displayed clearly) */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={toggleTheme}
            className="p-1 px-2 hover:bg-gray-100 active:bg-gray-150 dark:hover:bg-slate-800 dark:active:bg-slate-700 text-gray-600 dark:text-gray-300 rounded border border-gray-200 dark:border-gray-700 text-[10px] font-bold cursor-pointer flex items-center gap-1.5 transition-all"
            id="header-theme-toggle"
            title="تغییر سریع تم (روز / شب)"
          >
            {appSettings.theme === 'dark' ? (
              <>
                <Sun className="w-3 h-3 text-amber-500 fill-amber-500" />
                <span className="font-semibold text-amber-500">روز</span>
              </>
            ) : (
              <>
                <Moon className="w-3 h-3 text-indigo-500 fill-indigo-500" />
                <span className="font-semibold text-slate-700">شب</span>
              </>
            )}
          </button>

          <div className="hidden sm:block text-[10px] font-mono text-gray-400 font-bold bg-gray-50 dark:bg-slate-850 px-3 py-1 rounded border border-gray-150 dark:border-gray-705">
            {appSettings.defaultPaths.movies} \ db_sqlite.sys \ indexeddb_movies
          </div>
        </div>
      </header>

      {/* 2. Main Area: Sidebar Navigation & Content Area Grid */}
      <div className="flex-1 flex overflow-hidden" id="app-workspace">
        
        {/* Right Sidebar navigation (Farsi RTL compliant) */}
        <nav className="w-60 bg-white dark:bg-[#1e293b] border-l border-gray-150 dark:border-gray-800 p-4.5 flex flex-col justify-between select-none shrink-0 hidden md:flex" id="sidebar-navigation">
          <div className="space-y-6">
            <div className="pb-1">
              <span className="text-[10px] font-extrabold tracking-wider text-gray-400 block px-2.5 uppercase">منوی عملیاتی مدیا</span>
            </div>

            <div className="space-y-1.5" id="nav-pills">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    className={`w-full flex items-center gap-3 px-3 h-11 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/10' 
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800/60'
                    }`}
                    id={`nav-link-${item.id}`}
                  >
                    <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-white' : 'text-gray-400 dark:text-gray-450'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick instructions & branding */}
          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-3.5 rounded-xl space-y-2">
            <span className="text-[10px] bg-indigo-500/10 text-indigo-500 px-2 py-0.5 rounded font-extrabold">نسخه 1.0.1</span>
            <p className="text-[10px] text-gray-450 leading-relaxed font-semibold">برنامه مدیریت فیلم و سریال های سیستم. طراحی و توسعه توسط خدمات کامپیوتری پارس تک (مصطفی اکرادی) 09380072019</p>
          </div>
        </nav>

        {/* Dynamic content rendering frame */}
        <main className="flex-1 overflow-y-auto p-6 flex flex-col gap-5" id="main-content-canvas">
          
          {/* Global persistent multi-sales & Cart controls */}
          <CartBar 
            currentCustomer={currentCustomer}
            onChangeCustomer={setCurrentCustomer}
            cart={cart}
            onRemoveItem={handleRemoveCartItem}
            onClearCart={handleClearCart}
            onUpdateCartItemPrice={handleUpdateCartItemPrice}
            onInvoiceSettled={handleInvoiceSettled}
          />

          <div className="flex-1 min-h-0">
            {activeTab === 'dashboard' && <Dashboard onViewMedia={handleViewMedia} />}
            {activeTab === 'movies' && <Movies onAddToCart={handleAddToCart} activeCustomer={currentCustomer ? { id: 'c1', name: currentCustomer, phone: '' } : null} />}
            {activeTab === 'series' && <SeriesPage onAddToCart={handleAddToCart} activeCustomer={currentCustomer ? { id: 'c1', name: currentCustomer, phone: '' } : null} />}
            {activeTab === 'sales' && <SalesPage />}
            {activeTab === 'settings' && <SettingsPage onSettingsChange={setAppSettings} />}
          </div>
        </main>

      </div>

      {/* 3. Real-time SQL query audit console */}
      <DBLogger />

      {/* 4. ABOUT US MODAL OVERLAY */}
      {showAboutModal && (
        <div className="fixed inset-0 z-[120] bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1e293b] w-full max-w-sm rounded-xl shadow-2xl overflow-hidden border border-gray-150 dark:border-gray-805 animate-scaleIn">
            <div className="p-5 text-center space-y-4">
              <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400 rounded-2xl flex items-center justify-center mx-auto shadow shadow-indigo-500/10">
                <Tv className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">نرم‌افزار مدیا سنتر (Media Center Manager)</h3>
                <p className="text-[11px] text-gray-400 font-mono mt-1">نسخه ۲.۴.۰ (Electron + SQLite + IndexedDB)</p>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-300 leading-relaxed leading-loose">
                این برنامه برای مدیریت کامل فیلم‌ها و سریال‌ها، تنظیم فصول، مدیریت فاکتور با قابلیت فروش یکجای فصول به صورت دسکتاپ بر مبنای وب پیاده‌سازی شده است.
              </p>
              <button
                onClick={() => setShowAboutModal(false)}
                className="w-full h-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
                id="btn-close-about"
              >
                تایید و ادامه کار با سیستم
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Responsive mobile toolbar tab footer */}
      <div className="md:hidden h-14 bg-white dark:bg-[#1e293b] border-t border-gray-150 dark:border-gray-800 flex items-center justify-around z-30 select-none pb-0.5 no-print" id="mobile-toolbar">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`flex flex-col items-center justify-center gap-1.5 flex-1 h-full cursor-pointer transition-all ${
                isActive ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-gray-400 hover:text-gray-700'
              }`}
            >
              <Icon className="w-4.5 h-4.5" />
              <span className="text-[8px]">{item.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>

    </div>
  );
}
