/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { dbService } from '../db/databaseService';
import { AppSettings, DefaultPaths } from '../types';
import { toPersianNums, formatCurrency } from './Dashboard';
import { 
  Settings, 
  Moon, 
  Sun, 
  Download, 
  Upload, 
  Database, 
  Trash2, 
  Folder, 
  Settings2, 
  Check, 
  Info, 
  RefreshCw 
} from 'lucide-react';

export default function SettingsPage({ onSettingsChange }: { onSettingsChange: (settings: AppSettings) => void }) {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  
  // Storage Paths
  const [pathMovies, setPathMovies] = useState('');
  const [pathSeries, setPathSeries] = useState('');
  const [pathMusic, setPathMusic] = useState('');
  const [pathBackups, setPathBackups] = useState('');

  const [pageSize, setPageSize] = useState<20 | 50 | 100>(20);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [defaultMoviePrice, setDefaultMoviePrice] = useState(2000);
  const [defaultSeriesPrice, setDefaultSeriesPrice] = useState(1500);

  // Shop Info
  const [shopName, setShopName] = useState('');
  const [shopAddress, setShopAddress] = useState('');
  const [shopPhone, setShopPhone] = useState('');
  const [shopPhoneSecondary, setShopPhoneSecondary] = useState('');

  // Load paste string
  const [restoreJson, setRestoreJson] = useState('');
  const [fileRestoreMessage, setFileRestoreMessage] = useState('');

  useEffect(() => {
    loadSettings();

    const handleThemeChangeExternal = () => {
      const s = dbService.getSettings();
      setTheme(s.theme);
    };
    window.addEventListener('theme_changed', handleThemeChangeExternal);
    return () => window.removeEventListener('theme_changed', handleThemeChangeExternal);
  }, []);

  const loadSettings = () => {
    const s = dbService.getSettings();
    setSettings(s);
    setPathMovies(s.defaultPaths.movies);
    setPathSeries(s.defaultPaths.series);
    setPathMusic(s.defaultPaths.music || 'D:\\Media\\Music');
    setPathBackups(s.defaultPaths.backups);
    setPageSize(s.pageSize);
    setTheme(s.theme);
    setDefaultMoviePrice(s.defaultMoviePrice !== undefined ? s.defaultMoviePrice : 2000);
    setDefaultSeriesPrice(s.defaultSeriesPrice !== undefined ? s.defaultSeriesPrice : 1500);
    setShopName(s.shopName || '');
    setShopAddress(s.shopAddress || '');
    setShopPhone(s.shopPhone || '');
    setShopPhoneSecondary(s.shopPhoneSecondary || '');
  };

  const triggerFolderBrowser = (type: 'movies' | 'series' | 'music' | 'backups', currentVal: string) => {
    if (window.electronAPI) {
      window.electronAPI.selectDirectory().then((dir) => {
        if (dir) {
          if (type === 'movies') setPathMovies(dir);
          if (type === 'series') setPathSeries(dir);
          if (type === 'music') setPathMusic(dir);
          if (type === 'backups') setPathBackups(dir);
        }
      }).catch((err) => console.error(err));
    } else {
      const promptMsg = {
        movies: 'مسیر پوشه فیلم‌ها را وارد کنید:',
        series: 'مسیر پوشه سریال‌ها را وارد کنید:',
        music: 'مسیر پوشه موسیقی را وارد کنید:',
        backups: 'مسیر پوشه پشتیبان‌گیری را وارد کنید:'
      }[type];
      const input = window.prompt(`(شبیه‌ساز آنلاین) ${promptMsg}`, currentVal);
      if (input !== null) {
        if (type === 'movies') setPathMovies(input);
        if (type === 'series') setPathSeries(input);
        if (type === 'music') setPathMusic(input);
        if (type === 'backups') setPathBackups(input);
      }
    }
  };

  const handleSavePaths = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = dbService.updateSettings({
      defaultPaths: {
        movies: pathMovies,
        series: pathSeries,
        music: pathMusic,
        backups: pathBackups
      },
      pageSize,
      theme,
      defaultMoviePrice: Number(defaultMoviePrice) || 2000,
      defaultSeriesPrice: Number(defaultSeriesPrice) || 1500,
      shopName,
      shopAddress,
      shopPhone,
      shopPhoneSecondary
    });
    setSettings(updated);
    onSettingsChange(updated);
    alert('تنظیمات عمومی با موفقیت ثبت شد.');
  };

  const handlePageSizeChange = (size: 20 | 50 | 100) => {
    setPageSize(size);
    const updated = dbService.updateSettings({ pageSize: size });
    setSettings(updated);
    onSettingsChange(updated);
  };

  const handleThemeChange = (t: 'light' | 'dark') => {
    setTheme(t);
    const updated = dbService.updateSettings({ theme: t });
    setSettings(updated);
    onSettingsChange(updated);
  };

  // 1. Export database backup as dynamic downloadable .json file 💾
  const handleExportDB = () => {
    try {
      const dataStr = dbService.exportDatabase();
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `mediacenter_backup_${new Date().toISOString().slice(0,10)}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      alert('فایل پشتیبان با موفقیت ساخته شد و دانلود گردید.');
    } catch {
      alert('خطا در تولید فایل پشتیبان دیتابیس.');
    }
  };

  // 2. Import database backup via File Upload Selector 📁
  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    const files = e.target.files;
    if (!files || files.length === 0) return;

    fileReader.onload = event => {
      const result = event.target?.result;
      if (typeof result === 'string') {
        const importRes = dbService.importDatabase(result);
        if (importRes.success) {
          setFileRestoreMessage('بازیابی دیتابیس موفقیت‌آمیز بود! در حال بارگذاری مجدد...');
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        } else {
          setFileRestoreMessage('خطا: ' + importRes.message);
        }
      }
    };
    fileReader.readAsText(files[0]);
  };

  // 3. Import database backup via Text Paste Area 📋
  const handlePasteImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!restoreJson.trim()) return;

    const importRes = dbService.importDatabase(restoreJson);
    alert(importRes.message);
    if (importRes.success) {
      setRestoreJson('');
      window.location.reload();
    }
  };

  // 4. Force Reset factory settings
  const handleResetFactory = () => {
    if (window.confirm('هشدار جدی: این کار تمامی داده‌های فیلم، سریال و تاریخچه فروش جاری شما را کاملاً پاک کرده و دیتابیس پیش‌فرض اولیه شرکت را جایگزین می‌کند. آیا مطمئنید؟')) {
      dbService.resetDatabase();
      alert('دیتابیس سنتر کاملاً بازنشانی شد.');
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6" id="settings-tab-content">
      {/* Title */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-150 dark:border-gray-800">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100" id="settings-title">تنظیمات مدیا سنتر</h2>
          <p className="text-xs text-gray-400 mt-1">تغییر پوسته تم، سفارشی‌سازی مسیر پوشه فیلم‌ها، تهیه نسخه پشتیبان دیتابیس و مدیریت سرور</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="settings-row">
        
        {/* Panel 1: Theme and general configurations */}
        <div className="bg-white dark:bg-[#1e293b] p-5 rounded-xl border border-gray-100 dark:border-gray-800 space-y-5 lg:col-span-2 shadow-sm" id="general-config-panel">
          <div>
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">تنظیمات اصلی و مسیرهای فیزیکی</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">مسیر‌های ذخیره‌سازی پیش‌فرض فیلم، سریال و صفحه‌بندی مراجعین</p>
          </div>

          <form onSubmit={handleSavePaths} className="space-y-4" id="paths-control-form">
            
            {/* Theme switcher */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 block">پوسته رنگی برنامه (Theme)</label>
              <div className="flex gap-3" id="theme-selectors">
                <button
                  type="button"
                  onClick={() => handleThemeChange('dark')}
                  className={`flex-1 flex items-center justify-center gap-2 h-11 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                    theme === 'dark' 
                      ? 'bg-slate-900 text-[#38bdf8] border-[#38bdf8]/40' 
                      : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <Moon className="w-4 h-4 text-sky-400" />
                  <span>پوسته تاریک (برگزیده دسکتاپ)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleThemeChange('light')}
                  className={`flex-1 flex items-center justify-center gap-2 h-11 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                    theme === 'light' 
                      ? 'bg-gray-100 text-indigo-700 border-indigo-200 shadow-sm' 
                      : 'bg-[#1e293b] dark:border-gray-850 text-gray-450 hover:bg-slate-800'
                  }`}
                >
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span>پوسته روشن (استاندارد محیط اداری)</span>
                </button>
              </div>
            </div>

            {/* Pagination configuration */}
            <div className="space-y-2 pt-1">
              <label className="text-xs font-bold text-gray-500 block">تعداد نمایش آیتم در هر صفحه (Pagination Size)</label>
              <div className="grid grid-cols-3 gap-2" id="grid-page-sizes">
                {[20, 50, 100].map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => handlePageSizeChange(size as any)}
                    className={`h-9 rounded-lg font-bold text-xs border transition-colors cursor-pointer ${
                      pageSize === size 
                        ? 'bg-indigo-600 border-indigo-600 text-white' 
                        : 'bg-gray-50 border-gray-205 dark:bg-slate-800 dark:border-gray-700 text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    {toPersianNums(size)} آیتم در صفحه
                  </button>
                ))}
              </div>
            </div>

            {/* Default physics movies storage path */}
            <div className="space-y-1.5 pt-1">
              <label className="text-[11px] font-bold text-gray-505 block">مسیر پیش‌فرض ذخیره‌سازی فیلم‌ها</label>
              <div className="relative">
                <input
                  type="text"
                  value={pathMovies}
                  onClick={() => triggerFolderBrowser('movies', pathMovies)}
                  className="w-full h-10 pl-24 pr-10 bg-gray-50 dark:bg-slate-800 rounded-lg text-xs font-mono border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
                  placeholder="D:\Media\Movies"
                  readOnly
                />
                <Folder className="absolute right-3 top-3 w-4.5 h-4.5 text-indigo-500 cursor-pointer" onClick={() => triggerFolderBrowser('movies', pathMovies)} />
                <button
                  type="button"
                  onClick={() => triggerFolderBrowser('movies', pathMovies)}
                  className="absolute left-2 top-2 h-6 px-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-650 dark:text-indigo-400 text-[10px] font-bold rounded cursor-pointer transition-colors"
                >
                  انتخاب پوشه
                </button>
              </div>
            </div>

            {/* Default series path */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-555 block">مسیر پیش‌فرض ذخیره‌سازی سریال‌ها</label>
              <div className="relative">
                <input
                  type="text"
                  value={pathSeries}
                  onClick={() => triggerFolderBrowser('series', pathSeries)}
                  className="w-full h-10 pl-24 pr-10 bg-gray-50 dark:bg-slate-800 rounded-lg text-xs font-mono border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
                  placeholder="D:\Media\Series"
                  readOnly
                />
                <Folder className="absolute right-3 top-3 w-4.5 h-4.5 text-indigo-500 cursor-pointer" onClick={() => triggerFolderBrowser('series', pathSeries)} />
                <button
                  type="button"
                  onClick={() => triggerFolderBrowser('series', pathSeries)}
                  className="absolute left-2 top-2 h-6 px-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-650 dark:text-indigo-400 text-[10px] font-bold rounded cursor-pointer transition-colors"
                >
                  انتخاب پوشه
                </button>
              </div>
            </div>

            {/* Default music path */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-555 block">مسیر پیش‌فرض ذخیره‌سازی فایل‌های صوتی عمومی</label>
              <div className="relative">
                <input
                  type="text"
                  value={pathMusic}
                  onClick={() => triggerFolderBrowser('music', pathMusic)}
                  className="w-full h-10 pl-24 pr-10 bg-gray-50 dark:bg-slate-800 rounded-lg text-xs font-mono border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
                  placeholder="D:\Media\Music"
                  readOnly
                />
                <Folder className="absolute right-3 top-3 w-4.5 h-4.5 text-indigo-500 cursor-pointer" onClick={() => triggerFolderBrowser('music', pathMusic)} />
                <button
                  type="button"
                  onClick={() => triggerFolderBrowser('music', pathMusic)}
                  className="absolute left-2 top-2 h-6 px-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-650 dark:text-indigo-400 text-[10px] font-bold rounded cursor-pointer transition-colors"
                >
                  انتخاب پوشه
                </button>
              </div>
            </div>

            {/* Global Film Pricing Configurations */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-indigo-500 block">قیمت ثابت فروش هر فیلم (تومان)</label>
                <input
                  type="number"
                  value={defaultMoviePrice}
                  onChange={(e) => setDefaultMoviePrice(Number(e.target.value))}
                  className="w-full h-10 px-3 bg-indigo-50/20 dark:bg-slate-800 rounded-lg text-xs font-extrabold border border-indigo-200 dark:border-gray-750 text-indigo-650 dark:text-indigo-400 focus:outline-none focus:border-indigo-500"
                  placeholder="مثال: 2000"
                />
                <span className="text-[10px] text-gray-400 block">قیمت ثابت محاسباتی فروش در صدور فاکتور: {formatCurrency(defaultMoviePrice)}</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-emerald-500 block">قیمت ثابت فروش هر قسمت سریال (تومان)</label>
                <input
                  type="number"
                  value={defaultSeriesPrice}
                  onChange={(e) => setDefaultSeriesPrice(Number(e.target.value))}
                  className="w-full h-10 px-3 bg-emerald-50/20 dark:bg-slate-800 rounded-lg text-xs font-extrabold border border-emerald-200 dark:border-gray-750 text-emerald-650 dark:text-emerald-400 focus:outline-none focus:border-emerald-500"
                  placeholder="مثال: 1500"
                />
                <span className="text-[10px] text-gray-400 block">قیمت ثابت محاسباتی فروش در صدور فاکتور: {formatCurrency(defaultSeriesPrice)}</span>
              </div>
            </div>

            {/* Backups folder storage */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-505 block">پوشه ذخیره‌سازی فایل‌های پشتیبان دیتابیس</label>
              <div className="relative">
                <input
                  type="text"
                  value={pathBackups}
                  onClick={() => triggerFolderBrowser('backups', pathBackups)}
                  className="w-full h-10 pl-24 pr-10 bg-gray-50 dark:bg-slate-800 rounded-lg text-xs font-mono border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
                  placeholder="D:\Media\Backups"
                  readOnly
                />
                <Folder className="absolute right-3 top-3 w-4.5 h-4.5 text-indigo-500 cursor-pointer" onClick={() => triggerFolderBrowser('backups', pathBackups)} />
                <button
                  type="button"
                  onClick={() => triggerFolderBrowser('backups', pathBackups)}
                  className="absolute left-2 top-2 h-6 px-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-650 dark:text-indigo-400 text-[10px] font-bold rounded cursor-pointer transition-colors"
                >
                  انتخاب پوشه
                </button>
              </div>
            </div>

            {/* Shop Information Section */}
            <div className="border-t border-gray-150 dark:border-gray-800 pt-4 mt-4 space-y-4">
              <div>
                <h4 className="text-xs font-bold text-indigo-600 dark:text-indigo-400">اطلاعات فروشگاه و فاکتور چاپی</h4>
                <p className="text-[10px] text-gray-400 mt-0.5">مشخصات مغازه شما که در بالای فاکتورهای چاپی و بخش‌های مختلف برنامه نقش می‌بندد.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-555 block">نام فروشگاه / مغازه</label>
                  <input
                    type="text"
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    className="w-full h-10 px-3 bg-gray-50 dark:bg-slate-800 rounded-lg text-xs font-medium border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 focus:outline-none focus:border-indigo-500"
                    placeholder="مثال: خدمات کامپیوتری پارس تک"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-555 block">شماره تماس اصلی</label>
                  <input
                    type="text"
                    value={shopPhone}
                    onChange={(e) => setShopPhone(e.target.value)}
                    className="w-full h-10 px-3 bg-gray-50 dark:bg-slate-800 rounded-lg text-xs font-medium border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 focus:outline-none focus:border-indigo-500 text-right"
                    placeholder="مثال: 021-88888888"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 col-span-1">
                  <label className="text-[11px] font-bold text-gray-555 block">شماره تماس دوم / همراه</label>
                  <input
                    type="text"
                    value={shopPhoneSecondary}
                    onChange={(e) => setShopPhoneSecondary(e.target.value)}
                    className="w-full h-10 px-3 bg-gray-50 dark:bg-slate-800 rounded-lg text-xs font-medium border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 focus:outline-none focus:border-indigo-500 text-right"
                    placeholder="مثال: 09123456789"
                  />
                </div>

                <div className="space-y-1.5 col-span-1">
                  <label className="text-[11px] font-bold text-gray-555 block">آدرس دقیق فروشگاه</label>
                  <input
                    type="text"
                    value={shopAddress}
                    onChange={(e) => setShopAddress(e.target.value)}
                    className="w-full h-10 px-3 bg-gray-50 dark:bg-slate-800 rounded-lg text-xs font-medium border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 focus:outline-none focus:border-indigo-500"
                    placeholder="مثال: اصفهان، خیابان بزرگمهر، نبش کوچه ۱۲"
                  />
                </div>
              </div>
            </div>

            {/* Submit button settings */}
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-1 px-5 h-10 bg-indigo-600 hover:bg-indigo-750 text-white rounded-lg text-xs font-bold shadow-md cursor-pointer"
                id="btn-settings-submit"
              >
                <Check className="w-4 h-4" />
                <span>ذخیره ترجیحات کاربر</span>
              </button>
            </div>

          </form>
        </div>

        {/* Panel 2: Database backup management */}
        <div className="bg-white dark:bg-[#1e293b] p-5 rounded-xl border border-gray-100 dark:border-gray-800 space-y-5 shadow-sm" id="db-backup-panel">
          <div>
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">امور پشتیبان‌گیری و دیتابیس</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">بازیابی و تهیۀ رونوشت از سوابق مدیا سنتر</p>
          </div>

          <div className="space-y-4" id="db-backup-actions">
            {/* Backup generator */}
            <div className="p-3.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-gray-800 rounded-lg space-y-2">
              <strong className="text-xs font-bold text-gray-800 dark:text-gray-200 block">رونوشت کامل (JSON Export)</strong>
              <p className="text-[10px] text-gray-400">تهیه خروجی کامل مستقل از فیلم‌ها، سریال‌ها و صورت‌حساب‌های فروش به عنوان فایل پشتیبان با قابلیت جابجایی مستقیم.</p>
              <button
                onClick={handleExportDB}
                className="w-full flex items-center justify-center gap-1.5 h-9 bg-[#10b981] hover:bg-teal-600 text-white text-xs font-semibold rounded shadow transition-all cursor-pointer"
                id="btn-export-backup"
              >
                <Download className="w-4 h-4 animate-bounce" />
                <span>بارگیری نسخه پشتیبان (.JSON)</span>
              </button>
            </div>

            {/* Import Backup File upload selector */}
            <div className="p-3.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-gray-800 rounded-lg space-y-2.5">
              <strong className="text-xs font-bold text-gray-800 dark:text-gray-200 block">بارگذاری فایل پشتیبان</strong>
              <p className="text-[10px] text-gray-400">فایل `.json` پشتیبان قبلی مدیا سنتر را انتخاب کنید تا دیتابیس فورا به همان تغییر یابد.</p>
              
              <div className="relative">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileImport}
                  className="w-full text-xs text-gray-400 file:ml-2.5 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-[11px] file:font-semibold file:bg-gray-200 file:text-gray-700 hover:file:bg-gray-300 dark:file:bg-slate-800 dark:file:text-gray-300 cursor-pointer"
                  id="import-file-selector"
                />
              </div>
              {fileRestoreMessage && (
                <p className="text-[10.5px] text-amber-500 font-bold bg-amber-500/10 px-2 py-1 rounded border border-amber-500/15">{fileRestoreMessage}</p>
              )}
            </div>

            {/* Import Paste text system */}
            <form onSubmit={handlePasteImport} className="p-3.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-gray-800 rounded-lg space-y-2">
              <strong className="text-xs font-bold text-gray-800 dark:text-gray-200 block">واردسازی با کد (Paste JSON)</strong>
              <textarea
                value={restoreJson}
                onChange={(e) => setRestoreJson(e.target.value)}
                placeholder="کد JSON فایل پشتیبان را بر روی این فرم پیست کنید..."
                className="w-full h-14 p-2 bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded text-[9.5px] font-mono resize-none focus:outline-none focus:border-indigo-500"
                id="textarea-json-paste"
              />
              <button
                type="submit"
                disabled={!restoreJson.trim()}
                className="w-full flex items-center justify-center gap-1 h-8.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded cursor-pointer disabled:opacity-40"
                id="btn-import-paste"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>اعتبارسنجی و بازیابی کد</span>
              </button>
            </form>

            {/* Factory settings RESET */}
            <div className="p-3.5 bg-red-50/50 dark:bg-red-950/10 border border-red-100 dark:border-red-900/40 rounded-lg space-y-2">
              <strong className="text-xs font-bold text-red-600 dark:text-red-400 block pb-0.5">بازگرداندن به حالت کارخانه</strong>
              <button
                onClick={handleResetFactory}
                className="w-full flex items-center justify-center gap-1.5 h-9 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded cursor-pointer"
                id="btn-reset-factory"
              >
                <Trash2 className="w-4 h-4" />
                <span>حذف همه اطلاعات و بازنشانی پیش‌فرض</span>
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
