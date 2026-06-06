/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { dbService } from '../db/databaseService';
import { Movie, Series, Sale } from '../types';
import { 
  Film, 
  Tv, 
  TrendingUp, 
  CreditCard, 
  DollarSign, 
  ArrowUpRight, 
  Clock, 
  Award,
  ChevronLeft
} from 'lucide-react';

interface MonthData {
  name: string;
  amount: number;
}

// Helper to convert English numerals to Persian numerals
export function toPersianNums(num: number | string): string {
  if (num === undefined || num === null) return '';
  const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return num
    .toString()
    .replace(/[0-9]/g, (w) => farsiDigits[parseInt(w, 10)]);
}

// Convert numbers with thousands separator
export function formatCurrency(num: number): string {
  const formatted = num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return toPersianNums(formatted) + ' تومان';
}

export default function Dashboard({ onViewMedia }: { onViewMedia: (type: 'movie' | 'series', id: string) => void }) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [series, setSeries] = useState<Series[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);

  useEffect(() => {
    // Read current state from DB
    setMovies(dbService.getMovies());
    setSeries(dbService.getSeries());
    setSales(dbService.getSales());
  }, []);

  // 1. Calculations
  const totalMovies = movies.length;
  const totalSeries = series.length;

  // Calculate Sales Figures
  // Today's sales (filtering sales done on 2026-06-05)
  const todayStr = new Date('2026-06-05').toDateString();
  const todaySalesList = sales.filter(s => new Date(s.date).toDateString() === todayStr);
  const todaySalesCount = todaySalesList.length;
  const todaySalesAmount = todaySalesList.reduce((sum, s) => sum + (s.salePrice - s.discount), 0);

  // Total sales
  const salesCount = sales.length;
  const salesTotalRevenue = sales.reduce((sum, s) => sum + (s.salePrice - s.discount), 0);
  const salesTotalCost = sales.reduce((sum, s) => sum + s.purchasePrice, 0);
  const totalProfit = salesTotalRevenue - salesTotalCost;

  // Recent additions
  const latestMovies = [...movies].slice(0, 3);
  const latestSeries = [...series].slice(0, 3);

  // Top media sales (aggregating sales count by media id)
  const salesCountByMediaMap: Record<string, { count: number; name: string; type: string; price: number; income: number }> = {};
  sales.forEach(s => {
    if (!salesCountByMediaMap[s.mediaId]) {
      salesCountByMediaMap[s.mediaId] = {
        count: 0,
        name: s.mediaTitle,
        type: s.mediaType === 'movie' ? 'فیلم' : 'سریال',
        price: s.salePrice,
        income: 0
      };
    }
    salesCountByMediaMap[s.mediaId].count += 1;
    salesCountByMediaMap[s.mediaId].income += (s.salePrice - s.discount);
  });

  const topSellers = Object.values(salesCountByMediaMap)
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);

  // Monthly breakdown for Chart (Last 6 Persian months)
  // Farvardin (1), Ordibehesht (2), Khordad (3), Tir (4), Mordad (5), Shahrivar (6)
  // Let's create a solid display of Farvardin, Ordibehesht, Khordad (representing April, May, June 2026)
  const persianMonths = [
    { name: 'اسفند ۱۴۰۴', m: 1, amount: 150000, color: '#f59e0b' },
    { name: 'فروردین ۱۴۰۵', m: 2, amount: 125000, color: '#10b981' },
    { name: 'اردیبهشت ۱۴۰۵', m: 3, amount: 220000, color: '#3b82f6' },
    { name: 'خرداد ۱۴۰۵', m: 4, amount: 0, color: '#8b5cf6' } // Dynamic current month
  ];

  // Map Gregorian sales to Persian months
  sales.forEach(sale => {
    const saleDate = new Date(sale.date);
    const m = saleDate.getMonth(); // 0: Jan, 1: Feb, 2: Mar, 3: Apr, 4: May, 5: Jun
    const saleAmount = sale.salePrice - sale.discount;
    if (m === 3) {
      // April (Farvardin)
      persianMonths[1].amount += saleAmount;
    } else if (m === 4) {
      // May (Ordibehesht)
      persianMonths[2].amount += saleAmount;
    } else if (m === 5) {
      // June (Khordad) - matching 2026-06-05
      persianMonths[3].amount += saleAmount;
    }
  });

  const maxVal = Math.max(...persianMonths.map(p => p.amount), 300000);

  return (
    <div className="space-y-6" id="dashboard-tab-content">
      {/* Title */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-150 dark:border-gray-800">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100" id="dashboard-title">پیش‌خوان مدیا سنتر</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">خلاصه وضعیت، فاکتورها، عملکرد مالی و عناوین جدید سیستم</p>
        </div>
        <div className="text-xs font-mono bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700">
          امروز: {toPersianNums('۱۴۰۵/۰۳/۱۵')} | ساعت: {toPersianNums('۱۳:۱۰')}
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4" id="kpi-grid">
        {/* Card 1: Total Movies */}
        <div className="bg-white dark:bg-[#1e293b] p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4" id="kpi-total-movies">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-lg">
            <Film className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">تعداد کل فیلم‌ها</p>
            <p className="text-xl font-bold text-gray-800 dark:text-gray-100 mt-0.5">{toPersianNums(totalMovies)} <span className="text-xs font-normal text-gray-450">عنوان</span></p>
          </div>
        </div>

        {/* Card 2: Total Series */}
        <div className="bg-white dark:bg-[#1e293b] p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4" id="kpi-total-series">
          <div className="p-3 bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 rounded-lg">
            <Tv className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">تعداد کل سریال‌ها</p>
            <p className="text-xl font-bold text-gray-800 dark:text-gray-100 mt-0.5">{toPersianNums(totalSeries)} <span className="text-xs font-normal text-gray-450">عنوان</span></p>
          </div>
        </div>

        {/* Card 3: Today's Sales */}
        <div className="bg-white dark:bg-[#1e293b] p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4" id="kpi-today-sales">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-lg">
            <Clock className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">فروش ثبت شده امروز</p>
            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-450 mt-0.5" title={`${todaySalesCount} فروش`}>
              {formatCurrency(todaySalesAmount)}
            </p>
          </div>
        </div>

        {/* Card 4: Total Accumulated Sales */}
        <div className="bg-white dark:bg-[#1e293b] p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4" id="kpi-total-sales-amount">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-lg">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">فروش ناخالص کل</p>
            <p className="text-lg font-bold text-amber-600 dark:text-amber-450 mt-0.5" title={`${salesCount} تراکنش فروش`}>
              {formatCurrency(salesTotalRevenue)}
            </p>
          </div>
        </div>

        {/* Card 5: Net Profit */}
        <div className="bg-white dark:bg-[#1e293b] p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4" id="kpi-net-profit">
          <div className="p-3 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 rounded-lg">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">کل سود خالص کسب شده</p>
            <p className="text-lg font-bold text-purple-600 dark:text-purple-450 mt-0.5" title={`خرید: ${salesTotalCost} / فروش: ${salesTotalRevenue}`}>
              {formatCurrency(totalProfit)}
            </p>
          </div>
        </div>
      </div>

      {/* Main Row: Chart & Best Sellers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="dashboard-row-charts">
        {/* Sales Chart Panel */}
        <div className="bg-white dark:bg-[#1e293b] p-5 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm lg:col-span-2 space-y-4" id="chart-panel">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">نمودار فروش دوره‌ای (تطبیقی)</h3>
            <span className="text-[10px] text-gray-400 bg-gray-50 dark:bg-gray-800 px-2.5 py-1 rounded-full border border-gray-100 dark:border-gray-700">تومان در هر دوره</span>
          </div>

          {/* Premium Custom SVG Chart */}
          <div className="h-64 flex flex-col justify-end" id="svg-chart-container">
            <div className="flex-1 w-full flex items-end gap-1 px-4 relative pt-6" dir="rtl">
              {/* Grid Background lines */}
              <div className="absolute inset-0 flex flex-col justify-between py-2 pointer-events-none opacity-40">
                <div className="border-b border-dashed border-gray-200 dark:border-gray-700 h-0 w-full"></div>
                <div className="border-b border-dashed border-gray-200 dark:border-gray-700 h-0 w-full"></div>
                <div className="border-b border-dashed border-gray-200 dark:border-gray-700 h-0 w-full"></div>
                <div className="border-b border-dashed border-gray-200 dark:border-gray-700 h-0 w-full"></div>
              </div>

              {persianMonths.map((month, i) => {
                // Calculate percentage height
                const barHeightPct = (month.amount / maxVal) * 85; 
                return (
                  <div key={i} className="flex-1 flex flex-col items-center group relative z-10">
                    {/* Tooltip on Hover */}
                    <div className="absolute bottom-full mb-2 bg-gray-900 text-white text-[10px] py-1 px-2.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md pointer-events-none z-20">
                      {formatCurrency(month.amount)}
                    </div>
                    {/* Bar visual */}
                    <div 
                      className="w-14 rounded-t-lg transition-all duration-500 hover:brightness-105 shadow-sm"
                      style={{ 
                        height: `${Math.max(barHeightPct, 6)}%`, 
                        backgroundColor: month.color,
                        boxShadow: `0 4px 12px ${month.color}25`
                      }}
                    ></div>
                    {/* Label */}
                    <span className="text-[10px] font-medium text-gray-500 dark:text-gray-450 mt-2 truncate max-w-full">
                      {month.name}
                    </span>
                  </div>
                );
              })}
            </div>
            {/* Axis Baseline */}
            <div className="h-px bg-gray-200 dark:bg-gray-700 w-full"></div>
          </div>
        </div>

        {/* Best Selling Media List */}
        <div className="bg-white dark:bg-[#1e293b] p-5 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between space-y-4" id="top-sellers-panel">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Award className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">پرفروش‌ترین عناوین</h3>
            </div>
            <p className="text-[11px] text-gray-400">عناوینی که بیشترین درآمد و ثبت فروش را داشته‌اند</p>
          </div>

          <div className="flex-1 divide-y divide-gray-100 dark:divide-gray-800 space-y-2.5" id="top-sellers-list">
            {topSellers.length === 0 ? (
              <div className="flex items-center justify-center h-full text-xs text-gray-400 italic py-8">تراکنش فروشی ثبت نشده است.</div>
            ) : (
              topSellers.map((item, index) => (
                <div key={index} className="flex items-center justify-between pt-2.5 first:pt-0" id={`top-seller-${index}`}>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold rounded text-[10px]">
                      {toPersianNums(index + 1)}
                    </span>
                    <div>
                      <h4 className="text-xs font-semibold text-gray-800 dark:text-gray-100">{item.name}</h4>
                      <span className="text-[10px] text-gray-400 font-medium bg-gray-50 dark:bg-gray-800/60 px-1.5 py-0.5 rounded border border-gray-100 dark:border-gray-700 mt-0.5 inline-block">{item.type}</span>
                    </div>
                  </div>
                  <div className="text-left font-mono">
                    <p className="text-xs font-bold text-gray-700 dark:text-gray-200">{formatCurrency(item.income)}</p>
                    <p className="text-[9px] text-[#10b981] font-semibold mt-0.5">{toPersianNums(item.count)} فروش ثبت‌شده</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Grid: Last Movie and Series */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="dashboard-row-recent">
        {/* Last Movies */}
        <div className="bg-white dark:bg-[#1e293b] p-5 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-4" id="recent-movies-panel">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
              <Film className="w-4 h-4 text-indigo-500" />
              <span>آخرین فیلم‌های اضافه‌شده</span>
            </h3>
            <span className="text-[10px] text-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 px-2 py-0.5 rounded-full font-bold">بخش فیلم‌ها</span>
          </div>

          <div className="space-y-3" id="recent-movies-list">
            {latestMovies.map(movie => (
              <div 
                key={movie.id} 
                onClick={() => onViewMedia('movie', movie.id)}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors border border-transparent hover:border-gray-100 dark:hover:border-gray-700"
                id={`recent-movie-${movie.id}`}
              >
                <img 
                  src={movie.poster} 
                  alt={movie.titleFa} 
                  className="w-10 h-14 object-cover rounded shadow-sm bg-gray-100"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-gray-800 dark:text-gray-100 truncate">{movie.titleFa}</h4>
                  <p className="text-[10px] text-gray-400 mt-0.5 font-mono">{movie.titleEn} ({toPersianNums(movie.year)})</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-450 mt-1 flex items-center gap-1 truncate">
                    <span>کارگردان:</span>
                    <span className="font-semibold">{movie.director}</span>
                  </p>
                </div>
                <div className="text-left font-mono">
                  <span className="text-[10px] text-amber-500 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded">
                    ★ {toPersianNums(movie.imdbRating)}
                  </span>
                  <p className="text-[10px] font-bold text-emerald-500 mt-1.5">{formatCurrency(movie.salePrice)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Last Series */}
        <div className="bg-white dark:bg-[#1e293b] p-5 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-4" id="recent-series-panel">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
              <Tv className="w-4 h-4 text-sky-500" />
              <span>آخرین سریال‌های اضافه‌شده</span>
            </h3>
            <span className="text-[10px] text-sky-500 bg-sky-50 dark:bg-sky-950/30 px-2 py-0.5 rounded-full font-bold">بخش سریال‌ها</span>
          </div>

          <div className="space-y-3" id="recent-series-list">
            {latestSeries.map(ser => (
              <div 
                key={ser.id}
                onClick={() => onViewMedia('series', ser.id)}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors border border-transparent hover:border-gray-100 dark:hover:border-gray-700"
                id={`recent-series-${ser.id}`}
              >
                <img 
                  src={ser.poster} 
                  alt={ser.titleFa} 
                  className="w-10 h-14 object-cover rounded shadow-sm bg-gray-100"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-gray-800 dark:text-gray-100 truncate">{ser.titleFa}</h4>
                  <p className="text-[10px] text-gray-400 mt-0.5 font-mono">{ser.titleEn} ({toPersianNums(ser.year)})</p>
                  <p className="text-[10px] text-[#38bdf8] dark:text-sky-400 mt-1 font-semibold flex items-center gap-1">
                    <span>{toPersianNums(ser.seasons.length)} فصل</span>
                    <span>•</span>
                    <span>{toPersianNums(ser.seasons.reduce((sum, s) => sum + s.episodes.length, 0))} قسمت کل</span>
                  </p>
                </div>
                <div className="text-left font-mono">
                  <span className="text-[10px] text-amber-500 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded">
                    ★ {toPersianNums(ser.imdbRating)}
                  </span>
                  <p className="text-[10px] font-bold text-emerald-500 mt-1.5">{formatCurrency(ser.salePrice)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
