/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { dbService } from '../db/databaseService';
import { Movie, MediaCategory } from '../types';
import { toPersianNums, formatCurrency } from './Dashboard';
import { 
  Play, 
  FolderOpen, 
  Edit, 
  Trash2, 
  Plus, 
  Search, 
  SlidersHorizontal, 
  X, 
  Info, 
  Maximize2, 
  DollarSign, 
  Check, 
  AlertCircle,
  Film,
  Volume2,
  FileVideo,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';

export const CATEGORIES: MediaCategory[] = ['ایرانی', 'خارجی', 'انیمیشن', 'کره‌ای', 'هندی', 'متفرقه'];

const PRESET_POSTERS = [
  { name: 'درام/ملودرام', url: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&q=80&w=400' },
  { name: 'پلیسی/جنایی', url: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?auto=format&fit=crop&q=80&w=400' },
  { name: 'تخیلی/حماسی', url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=400' },
  { name: 'فانتزی/انیمیشن', url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=400' },
  { name: 'رایگان/سرگرمی', url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=400' }
];

export const POPULAR_GENRES = [
  'درام', 'کمدی', 'اکشن', 'علمی تخیلی', 'ترسناک', 
  'هیجان انگیز', 'مستند', 'خانوادگی', 'جنایی', 
  'معمایی', 'عاشقانه', 'تاریخی', 'بیوگرافی', 'ماجراجویی', 'انیمیشن'
];

interface MoviesProps {
  onAddToCart?: (item: any) => void;
  cartItems?: any[];
  activeCustomer?: { id: string; name: string; phone: string; } | null;
}

export default function Movies({ onAddToCart, cartItems = [], activeCustomer }: MoviesProps) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<MediaCategory | 'همه'>('همه');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Advanced filters
  const [filterCountry, setFilterCountry] = useState('');
  const [filterLanguage, setFilterLanguage] = useState('');
  const [filterGenre, setFilterGenre] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterQuality, setFilterQuality] = useState('');
  const [filterMinImdb, setFilterMinImdb] = useState('');
  const [filterCrew, setFilterCrew] = useState('');
  const [sortBy, setSortBy] = useState<'titleFa' | 'year' | 'imdbRating' | 'addedAt' | 'salePrice'>('addedAt');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [showFilters, setShowFilters] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // New & Edit Movie Mode
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);

  // Form Fields State
  const [formCategory, setFormCategory] = useState<MediaCategory>('ایرانی');
  const [formTitleFa, setFormTitleFa] = useState('');
  const [formTitleEn, setFormTitleEn] = useState('');
  const [formYear, setFormYear] = useState('');
  const [formDirector, setFormDirector] = useState('');
  const [formWriter, setFormWriter] = useState('');
  const [formActors, setFormActors] = useState('');
  const [formDuration, setFormDuration] = useState('');
  const [formCountry, setFormCountry] = useState('ایران');
  const [formLanguage, setFormLanguage] = useState('دوبله فارسی');
  const [formImdbRating, setFormImdbRating] = useState('');
  const [formQuality, setFormQuality] = useState('1080p Web-DL');
  const [formSubtitle, setFormSubtitle] = useState('دوبله فارسی');
  const [formGenres, setFormGenres] = useState<string[]>([]);
  const [formPoster, setFormPoster] = useState(PRESET_POSTERS[0].url);
  const [formSummary, setFormSummary] = useState('');
  const [formFilePath, setFormFilePath] = useState('');

  // Detail & Play Modals
  const [detailMovie, setDetailMovie] = useState<Movie | null>(null);
  const [zoomedPoster, setZoomedPoster] = useState<string | null>(null);
  const [playingMovie, setPlayingMovie] = useState<Movie | null>(null);
  const [exploringFolder, setExploringFolder] = useState<Movie | null>(null);
  const [sellingMovie, setSellingMovie] = useState<Movie | null>(null);

  // Sales Form fields (deprecated individual register modal)
  const [saleCustomerName, setSaleCustomerName] = useState('');
  const [salePrice, setSalePrice] = useState(2000);
  const [saleDiscount, setSaleDiscount] = useState(0);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setMovies(dbService.getMovies());
    const settings = dbService.getSettings();
    setPageSize(settings.pageSize || 20);
    setSalePrice(settings.defaultMoviePrice || 2000);
  };

  // Populate form with film details for editing
  const handleOpenEdit = (movie: Movie, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingMovie(movie);
    setFormCategory(movie.category);
    setFormTitleFa(movie.titleFa);
    setFormTitleEn(movie.titleEn);
    setFormYear(movie.year);
    setFormDirector(movie.director);
    setFormWriter(movie.writer);
    setFormActors(movie.actors);
    setFormDuration(movie.duration);
    setFormCountry(movie.country || 'ایران');
    setFormLanguage(movie.language || 'دوبله فارسی');
    setFormImdbRating(movie.imdbRating);
    setFormQuality(movie.quality);
    setFormSubtitle(movie.subtitle);
    setFormGenres(movie.genres || []);
    setFormPoster(movie.poster);
    setFormSummary(movie.summary);
    setFormFilePath(movie.filePath);
    setShowFormModal(true);
  };

  const handleOpenCreate = () => {
    setEditingMovie(null);
    setFormCategory('ایرانی');
    setFormTitleFa('');
    setFormTitleEn('');
    setFormYear('۱۴۰۳');
    setFormDirector('');
    setFormWriter('');
    setFormActors('');
    setFormDuration('۱۲۰ دقیقه');
    setFormCountry('ایران');
    setFormLanguage('دوبله فارسی');
    setFormImdbRating('۷.۵');
    setFormQuality('1080p Web-DL');
    setFormSubtitle('دوبله فارسی');
    setFormGenres(['درام', 'اجتماعی']);
    setFormPoster('');
    setFormSummary('');
    setFormFilePath('');
    setShowFormModal(true);
  };

  const handleDeleteMovie = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('آیا از حذف این فیلم اطمینان دارید؟')) {
      dbService.deleteMovie(id);
      refreshData();
      if (detailMovie && detailMovie.id === id) {
        setDetailMovie(null);
      }
    }
  };

  const handlePickPoster = async () => {
    if (window.electronAPI) {
      try {
        const path = await window.electronAPI.selectPoster();
        if (path) {
          setFormPoster(path);
        }
      } catch (err) {
        console.error('Failed to select poster:', err);
      }
    } else {
      // standard client web browser pick
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            if (typeof event.target?.result === 'string') {
              setFormPoster(event.target.result);
            }
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
    }
  };

  const handlePickFilePath = () => {
    if (window.electronAPI) {
      window.electronAPI.selectFile().then((path: string) => {
        if (path) setFormFilePath(path);
      }).catch((err: any) => {
        console.error('Failed to select file natively:', err);
      });
    } else {
      const inputPath = window.prompt('(شبیه‌ساز آنلاین) آدرس فیزیکی فایل این فیلم را وارد کنید:', formFilePath || 'D:\\Media\\Movies\\MovieName.mkv');
      if (inputPath !== null) {
        setFormFilePath(inputPath);
      }
    }
  };

  const handlePlayFile = async (filePath: string) => {
    if (!filePath) {
      alert('مسیری برای این فیلم ثبت نشده است. ابتدا اطلاعات را ویرایش کرده و آدرس فایل را وارد نمایید.');
      return;
    }
    if (window.electronAPI) {
      try {
        const res = await window.electronAPI.playVideoFile(filePath);
        if (res && !res.success) {
          alert('خطا در پخش فایل: ' + res.error);
        }
      } catch (err) {
        console.error('Failed to play natively:', err);
      }
    } else {
      alert('(شبیه‌ساز مرورگر) پخش فیلم به نرم‌افزار پیش‌فرض سیستم فرستاده می‌شود.\nمسیر فایل: ' + filePath);
    }
  };

  const handleOpenFolder = async (filePath: string) => {
    if (!filePath) {
      alert('مسیری برای این فیلم ثبت نشده است. ابتدا اطلاعات را ویرایش کرده و آدرس فایل را وارد نمایید.');
      return;
    }
    if (window.electronAPI) {
      try {
        const res = await window.electronAPI.openFileInExplorer(filePath);
        if (res && !res.success) {
          alert('خطا در باز کردن پوشه: ' + res.error);
        }
      } catch (err) {
        console.error('Failed to open folder natively:', err);
      }
    } else {
      alert('(شبیه‌ساز مرورگر) پوشه حاوی این فایل در سیستم باز می‌شود.\nمسیر فایل: ' + filePath);
    }
  };

  const handleSaveMovie = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitleFa || !formTitleEn) {
      alert('لطفا فیلدهای نام فارسی و انگلیسی فیلم را تکمیل کنید.');
      return;
    }

    const settings = dbService.getSettings();
    const payload = {
      category: formCategory,
      titleFa: formTitleFa,
      titleEn: formTitleEn,
      year: formYear,
      director: formDirector,
      writer: formWriter,
      actors: formActors,
      duration: formDuration,
      country: formCountry,
      language: formLanguage,
      imdbRating: formImdbRating,
      quality: formQuality,
      subtitle: formSubtitle,
      genres: formGenres,
      poster: formPoster || PRESET_POSTERS[4].url,
      summary: formSummary,
      filePath: formFilePath,
      purchasePrice: 0,
      salePrice: settings.defaultMoviePrice
    };

    if (editingMovie) {
      dbService.updateMovie(editingMovie.id, payload);
    } else {
      dbService.addMovie(payload);
    }

    setShowFormModal(false);
    refreshData();
  };

  // Open Direct Sale Dialog 💰
  const handleOpenSale = (movie: Movie, e: React.MouseEvent) => {
    e.stopPropagation();
    setSellingMovie(movie);
    const settings = dbService.getSettings();
    setSalePrice(settings.defaultMoviePrice || 2000);
    setSaleDiscount(0);
  };

  const handleRegisterSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sellingMovie) return;

    if (onAddToCart) {
      onAddToCart({
        mediaId: sellingMovie.id,
        mediaTitle: sellingMovie.titleFa,
        mediaType: 'movie',
        salesType: 'movie',
        details: `فیلم سینمایی (${sellingMovie.quality})`,
        purchasePrice: sellingMovie.purchasePrice,
        salePrice: Math.max(salePrice - saleDiscount, 0),
        filePath: sellingMovie.filePath,
        videoPaths: [sellingMovie.filePath]
      });
      setSellingMovie(null);
      return;
    }

    dbService.addSale({
      customerName: 'مشتری متفرقه دفتری',
      mediaId: sellingMovie.id,
      mediaTitle: sellingMovie.titleFa,
      mediaType: 'movie',
      salesType: 'movie',
      details: 'فروش مستقیم فیلم',
      purchasePrice: sellingMovie.purchasePrice,
      salePrice: Number(salePrice) || sellingMovie.salePrice,
      discount: Number(saleDiscount) || 0
    });

    setSellingMovie(null);
    alert('تراکنش فروش با موفقیت به دیتابیس مالی افزوده شد.');
  };

  // Helper to convert Persian numerals to English numerals
  const toGregorianNumStr = (str: string | number | undefined | null): string => {
    if (str === undefined || str === null) return '';
    return str.toString()
      .replace(/[۰-۹]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 1776))
      .replace(/[٠-٩]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 1632));
  };

  // Filter & Search Logic
  const filteredMovies = movies.filter(movie => {
    const matchesCategory = selectedCategory === 'همه' || movie.category === selectedCategory;
    const matchesSearch = 
      movie.titleFa.toLowerCase().includes(searchQuery.toLowerCase()) ||
      movie.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      movie.director.toLowerCase().includes(searchQuery.toLowerCase()) ||
      movie.actors.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCountry = !filterCountry || movie.country.includes(filterCountry);
    const matchesLanguage = !filterLanguage || movie.language.includes(filterLanguage);
    const matchesGenre = !filterGenre || movie.genres.some(g => g.includes(filterGenre));
    const matchesYear = !filterYear || toGregorianNumStr(movie.year).includes(toGregorianNumStr(filterYear));
    const matchesQuality = !filterQuality || movie.quality.toLowerCase().includes(filterQuality.toLowerCase());
    
    const imdbVal = parseFloat(toGregorianNumStr(movie.imdbRating)) || 0;
    const minImdbVal = parseFloat(toGregorianNumStr(filterMinImdb)) || 0;
    const matchesMinImdb = !filterMinImdb || imdbVal >= minImdbVal;
    
    const matchesCrew = !filterCrew || 
      movie.director.toLowerCase().includes(filterCrew.toLowerCase()) ||
      movie.actors.toLowerCase().includes(filterCrew.toLowerCase()) ||
      (movie.writer && movie.writer.toLowerCase().includes(filterCrew.toLowerCase()));

    return matchesCategory && matchesSearch && matchesCountry && matchesLanguage && matchesGenre && matchesYear && matchesQuality && matchesMinImdb && matchesCrew;
  });

  // Sorting
  const sortedMovies = [...filteredMovies].sort((a, b) => {
    let fieldA: any = a[sortBy];
    let fieldB: any = b[sortBy];

    // Numbers check
    if (sortBy === 'salePrice') {
      fieldA = a.salePrice;
      fieldB = b.salePrice;
    }

    if (sortOrder === 'desc') {
      return fieldA > fieldB ? -1 : 1;
    } else {
      return fieldA < fieldB ? -1 : 1;
    }
  });

  // Pagination Slicing
  const totalItems = sortedMovies.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedMovies = sortedMovies.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Helper to extract unique genres present for recommendation dropdown
  const allAvailableGenres = Array.from(new Set(movies.flatMap(m => m.genres)));

  return (
    <div className="space-y-6" id="movies-tab-content">
      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-4 border-b border-gray-150 dark:border-gray-800 gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100" id="movies-title">مدیریت فیلم‌ها</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">آرشیو و فروش فیلم‌ها در شش قالب مجزا با تفکیک ایرانی، خارجی، انیمیشن و...</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-1.5 px-4 h-10 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/10 transition-all self-start md:self-auto cursor-pointer"
          id="btn-add-movie"
        >
          <Plus className="w-4 h-4" />
          <span>افزودن فیلم جدید</span>
        </button>
      </div>

      {/* Categories Tabs Selector */}
      <div className="flex items-center overflow-x-auto gap-2 pb-1 scrollbar-none" id="movies-category-selector">
        <button
          onClick={() => { setSelectedCategory('همه'); setCurrentPage(1); }}
          className={`px-4 py-2 text-xs font-semibold rounded-lg shrink-0 transition-colors cursor-pointer ${
            selectedCategory === 'همه' 
              ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-950' 
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-150 dark:bg-[#1e293b] dark:text-gray-300 dark:border-gray-800 dark:hover:bg-slate-800'
          }`}
          id="cat-tab-all"
        >
          همه فیلم‌ها ({toPersianNums(movies.length)})
        </button>
        {CATEGORIES.map(cat => {
          const catCount = movies.filter(m => m.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => { setSelectedCategory(cat); setCurrentPage(1); }}
              className={`px-4 py-2 text-xs font-semibold rounded-lg shrink-0 transition-colors cursor-pointer ${
                selectedCategory === cat 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-150 dark:bg-[#1e293b] dark:text-gray-300 dark:border-gray-800 dark:hover:bg-slate-800'
              }`}
              id={`cat-tab-${cat}`}
            >
              {cat} ({toPersianNums(catCount)})
            </button>
          );
        })}
      </div>

      {/* Advanced Filter and Search Controls */}
      <div className="bg-white dark:bg-[#1e293b] p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-3" id="filters-container">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Main search */}
          <div className="flex-1 relative flex items-center">
            <Search className="absolute right-3.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="جستجو در فیلم‌ها بر اساس نام، کارگردان، بازیگران..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full pr-10 pl-4 h-10 bg-gray-50 dark:bg-slate-800/60 rounded-lg text-xs font-medium border border-gray-150 dark:border-gray-700 text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-indigo-500"
              id="movie-search-input"
            />
          </div>

          {/* Toggle advanced filter panel */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-4 h-10 rounded-lg text-xs font-semibold border cursor-pointer transition-colors ${
              showFilters 
                ? 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900' 
                : 'bg-white text-gray-600 dark:bg-[#1e293b] dark:border-gray-800 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 border-gray-200'
            }`}
            id="btn-advanced-filters"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>فیلترهای پیشرفته</span>
          </button>
        </div>

        {/* Floating Extended Filter Options */}
        {showFilters && (
          <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800 animate-fadeIn" id="advanced-filters-panel">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {/* Country search */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 block">کشور سازنده</label>
                <input
                  type="text"
                  placeholder="مثلا: ایران، آمریکا..."
                  value={filterCountry}
                  onChange={(e) => { setFilterCountry(e.target.value); setCurrentPage(1); }}
                  className="w-full h-8 px-2.5 bg-gray-50 dark:bg-slate-800/80 rounded-md text-[11px] border border-gray-200 dark:border-gray-750 text-gray-850 dark:text-gray-200 focus:outline-none focus:border-indigo-500 placeholder-gray-400"
                  id="filter-country"
                />
              </div>

              {/* Language filter */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 block">زبان فیلم</label>
                <select
                  value={filterLanguage}
                  onChange={(e) => { setFilterLanguage(e.target.value); setCurrentPage(1); }}
                  className="w-full h-8 px-2 bg-gray-50 dark:bg-slate-800/80 rounded-md text-[11px] border border-gray-200 dark:border-gray-750 text-gray-850 dark:text-gray-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                  id="filter-language"
                >
                  <option value="">همه زبان‌ها</option>
                  <option value="دوبله فارسی">دوبله فارسی</option>
                  <option value="زبان اصلی">زبان اصلی</option>
                  <option value="دوزبانه (دوبله و زبان اصلی)">دوزبانه (دوبله و زبان اصلی)</option>
                </select>
              </div>

              {/* Genre filter */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 block">ژانر فیلم</label>
                <select
                  value={filterGenre}
                  onChange={(e) => { setFilterGenre(e.target.value); setCurrentPage(1); }}
                  className="w-full h-8 px-2 bg-gray-50 dark:bg-slate-800/80 rounded-md text-[11px] border border-gray-200 dark:border-gray-750 text-gray-850 dark:text-gray-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                  id="filter-genre"
                >
                  <option value="">همه ژانرها</option>
                  {allAvailableGenres.map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              {/* Year filter */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 block">سال ساخت</label>
                <input
                  type="text"
                  placeholder="مثلا: ۱۴۰۲ یا ۲۰۲۳"
                  value={filterYear}
                  onChange={(e) => { setFilterYear(e.target.value); setCurrentPage(1); }}
                  className="w-full h-8 px-2.5 bg-gray-50 dark:bg-slate-800/80 rounded-md text-[11px] border border-gray-200 dark:border-gray-750 text-gray-850 dark:text-gray-200 focus:outline-none focus:border-indigo-500 placeholder-gray-400"
                  id="filter-year"
                />
              </div>

              {/* Quality selector */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 block">کیفیت فیلم</label>
                <select
                  value={filterQuality}
                  onChange={(e) => { setFilterQuality(e.target.value); setCurrentPage(1); }}
                  className="w-full h-8 px-2 bg-gray-50 dark:bg-slate-800/80 rounded-md text-[11px] border border-gray-200 dark:border-gray-750 text-gray-850 dark:text-gray-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                  id="filter-quality"
                >
                  <option value="">همه کیفیت‌ها</option>
                  <option value="1080p">1080p</option>
                  <option value="720p">720p</option>
                  <option value="4K">4K UHD</option>
                  <option value="BluRay">BluRay</option>
                  <option value="Web-DL">Web-DL</option>
                </select>
              </div>

              {/* IMDb filter */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 block">حداقل امتیاز IMDb</label>
                <select
                  value={filterMinImdb}
                  onChange={(e) => { setFilterMinImdb(e.target.value); setCurrentPage(1); }}
                  className="w-full h-8 px-2 bg-gray-50 dark:bg-slate-800/80 rounded-md text-[11px] border border-gray-200 dark:border-gray-750 text-gray-850 dark:text-gray-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                  id="filter-min-imdb"
                >
                  <option value="">همه امتیازها</option>
                  <option value="5">۵ و بالاتر</option>
                  <option value="6">۶ و بالاتر</option>
                  <option value="7">۷ و بالاتر</option>
                  <option value="8">۸ و بالاتر</option>
                  <option value="9">۹ و بالاتر</option>
                </select>
              </div>

              {/* Specific Crew search */}
              <div className="space-y-1 col-span-1 md:col-span-2 lg:col-span-1">
                <label className="text-[10px] font-bold text-gray-500 block">عوامل (کارگردان/بازیگر)</label>
                <input
                  type="text"
                  placeholder="جستجوی کارگردان...”"
                  value={filterCrew}
                  onChange={(e) => { setFilterCrew(e.target.value); setCurrentPage(1); }}
                  className="w-full h-8 px-2.5 bg-gray-50 dark:bg-slate-800/80 rounded-md text-[11px] border border-gray-200 dark:border-gray-750 text-gray-850 dark:text-gray-200 focus:outline-none focus:border-indigo-500 placeholder-gray-400"
                  id="filter-crew"
                />
              </div>

              {/* Sorting and Reset Controls */}
              <div className="flex gap-1.5 pt-4 lg:pt-0 col-span-2 md:col-span-4 lg:col-span-1 items-end justify-between">
                <div className="flex-1 space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 block">ترتیب بر اساس</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="w-full h-8 px-2 bg-gray-50 dark:bg-slate-800/80 rounded-md text-[11px] border border-gray-200 dark:border-gray-750 text-gray-850 dark:text-gray-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                    id="sort-by"
                  >
                    <option value="addedAt font-sans">تاریخ افزودن</option>
                    <option value="year font-sans">سال ساخت</option>
                    <option value="imdbRating font-sans">امتیاز IMDB</option>
                    <option value="titleFa font-sans">نام فارسی</option>
                    <option value="salePrice font-sans">قیمت فروش</option>
                  </select>
                </div>

                <button
                  onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                  className="h-8 w-8 flex items-center justify-center bg-gray-100 hover:bg-gray-150 dark:bg-[#1e293b] hover:dark:bg-slate-800 text-gray-600 dark:text-gray-300 rounded-md border border-gray-200 dark:border-gray-750 cursor-pointer text-xs font-semibold shrink-0"
                  title={sortOrder === 'desc' ? 'نزولی' : 'صعودی'}
                  id="btn-toggle-sort-order"
                >
                  {sortOrder === 'desc' ? '▼' : '▲'}
                </button>
              </div>
            </div>

            {/* Clear filters trigger row */}
            <div className="flex justify-end pt-1">
              <button
                onClick={() => {
                  setFilterCountry('');
                  setFilterLanguage('');
                  setFilterGenre('');
                  setFilterYear('');
                  setFilterQuality('');
                  setFilterMinImdb('');
                  setFilterCrew('');
                  setSortBy('addedAt');
                  setSortOrder('desc');
                  setSearchQuery('');
                  setSelectedCategory('همه');
                  setCurrentPage(1);
                }}
                className="px-3.5 py-1 text-[10px] font-extrabold text-red-600 hover:text-red-750 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 rounded transition-colors cursor-pointer"
                id="btn-clear-filters"
              >
                پاکسازی تمامی فیلترها ×
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Output list of Movies */}
      {paginatedMovies.length === 0 ? (
        <div className="bg-white dark:bg-[#1e293b] p-12 text-center rounded-xl border border-gray-150 dark:border-gray-800 shadow-sm" id="empty-movies">
          <Film className="w-10 h-10 text-gray-350 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">کوششی با فیلتر شما یافت نشد!</h3>
          <p className="text-xs text-gray-400 mt-1">مدیا سنتر آرشیوی ندارد یا فیلتر خیلی سختی اعمال کرده‌اید.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-5" id="movies-grid">
          {paginatedMovies.map(movie => (
            <div
              key={movie.id}
              onClick={() => setDetailMovie(movie)}
              className="bg-white dark:bg-[#1e293b] rounded-xl border border-gray-150 dark:border-[#1e293b] overflow-hidden hover:shadow-lg transition-all flex flex-col group cursor-pointer border-transparent dark:hover:border-slate-800 relative shadow-sm"
              id={`movie-card-${movie.id}`}
            >
              {/* Image thumbnail and quick triggers */}
              <div className="h-44 bg-gray-100 relative overflow-hidden group">
                <img 
                  src={movie.poster} 
                  alt={movie.titleFa}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 bg-gray-900"
                  referrerPolicy="no-referrer"
                />
                
                {/* Category tag */}
                <span className="absolute top-2 right-2 bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-md z-10">
                  {movie.category}
                </span>

                {/* IMDb Rating Badge */}
                <span className="absolute bottom-2 right-2 bg-black/75 text-amber-500 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shadow-md z-10">
                  ★ {toPersianNums(movie.imdbRating)}
                </span>

                {/* Overlay actions (Hove Triggered) */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2.5 transition-opacity z-20">
                  {/* Play Action ▶️ */}
                  <button
                    onClick={(e) => { e.stopPropagation(); handlePlayFile(movie.filePath); }}
                    className="p-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full transition-transform transform scale-95 hover:scale-105"
                    title="پخش ویدیو"
                    id={`btn-play-${movie.id}`}
                  >
                    <Play className="w-4 h-4 fill-current" />
                  </button>

                  {/* Folder Open Action 📁 */}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleOpenFolder(movie.filePath); }}
                    className="p-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-full transition-transform transform scale-95 hover:scale-105"
                    title="باز کردن مسیر فایل"
                    id={`btn-folder-${movie.id}`}
                  >
                    <FolderOpen className="w-4 h-4" />
                  </button>

                  {/* Poster zoom action */}
                  <button
                    onClick={(e) => { e.stopPropagation(); setZoomedPoster(movie.poster); }}
                    className="p-2 bg-orange-500 hover:bg-orange-600 text-white rounded-full transition-transform transform scale-95 hover:scale-105"
                    title="بزرگنمایی پوستر"
                    id={`btn-zoom-${movie.id}`}
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>

                  {/* Sell Directly 💰 Action */}
                  <button
                    onClick={(e) => handleOpenSale(movie, e)}
                    className="p-2 bg-amber-500 hover:bg-amber-600 text-white rounded-full transition-transform transform scale-95 hover:scale-105"
                    title="ثبت فروش این فیلم"
                    id={`btn-sell-${movie.id}`}
                  >
                    <DollarSign className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Text Meta Container */}
              <div className="p-3.5 flex-1 flex flex-col justify-between" id={`movie-meta-${movie.id}`}>
                <div>
                  <h3 className="text-xs font-bold text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate" title={movie.titleFa}>
                    {movie.titleFa}
                  </h3>
                  <p className="text-[10px] text-gray-400 font-mono truncate mt-0.5">{movie.titleEn}</p>
                  
                  <div className="flex items-center gap-1.5 flex-wrap mt-2">
                    <span className="text-[9px] bg-gray-50 text-gray-400 border border-gray-100 dark:bg-gray-800/50 dark:text-gray-300 dark:border-gray-700 px-1 py-0.5 rounded font-mono font-medium shrink-0">
                      {movie.quality}
                    </span>
                    <span className="text-[9px] bg-gray-50 text-gray-450 border border-gray-100 dark:bg-gray-800/10 dark:text-gray-300 dark:border-gray-700 px-1 py-0.5 rounded truncate max-w-[90px]">
                      {movie.subtitle}
                    </span>
                  </div>
                </div>

                <div className="border-t border-gray-100 dark:border-gray-800/60 mt-3 pt-3 flex items-center justify-between">
                  <span className="text-[10px] opacity-75 font-medium font-mono text-gray-500">{toPersianNums(movie.year)}</span>
                  <p className="text-xs font-bold text-emerald-600 font-mono">{formatCurrency(movie.salePrice || dbService.getSettings().defaultMoviePrice)}</p>
                </div>
              </div>

              {/* Operations Footer (Edit/Delete icons) */}
              <div className="bg-gray-50 dark:bg-[#1a2236]/30 px-3 py-1.5 flex justify-end gap-1.5 border-t border-gray-100 dark:border-slate-800" id={`movie-footer-${movie.id}`}>
                <button
                  onClick={(e) => handleOpenEdit(movie, e)}
                  className="p-1 text-gray-405 hover:text-indigo-600 transition-colors"
                  title="ویرایش فیلم"
                  id={`edit-movie-${movie.id}`}
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={(e) => handleDeleteMovie(movie.id, e)}
                  className="p-1 text-gray-405 hover:text-red-600 transition-colors"
                  title="حذف فیلم"
                  id={`delete-movie-${movie.id}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-4" id="movies-pagination">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="p-1.5 border border-gray-150 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-40"
            id="movies-paged-prev"
          >
            <ChevronRight className="w-5 h-5 text-gray-500" />
          </button>
          <span className="text-xs font-semibold text-gray-650">
            صفحه {toPersianNums(currentPage)} از {toPersianNums(totalPages)}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-1.5 border border-gray-150 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-40"
            id="movies-paged-next"
          >
            <ChevronLeft className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      )}

      {/* FORM MODAL (Add/Edit Film) */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto" id="movie-form-modal">
          <div className="bg-white dark:bg-[#1e293b] w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden animate-scaleIn border border-gray-100 dark:border-gray-800">
            {/* Modal Header */}
            <div className="px-5 py-4 bg-gray-50 dark:bg-slate-800/80 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100" id="form-modal-title">
                {editingMovie ? `ویرایش فیلم: ${editingMovie.titleFa}` : 'افزودن فیلم جدید به لیست'}
              </h3>
              <button 
                onClick={() => setShowFormModal(false)}
                className="p-1 hover:bg-gray-250 dark:hover:bg-gray-700 text-gray-400 rounded-full transition-colors"
                id="close-form-modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveMovie} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto" id="movie-catalog-form">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Persian title */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 block">نام فارسی فیلم *</label>
                  <input
                    type="text"
                    required
                    value={formTitleFa}
                    onChange={(e) => setFormTitleFa(e.target.value)}
                    className="w-full h-9 px-3 bg-gray-50 dark:bg-slate-800 rounded-lg text-xs border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-indigo-500"
                    placeholder="مثال: رستگاری در شاوشنگ"
                    id="input-title-fa"
                  />
                </div>

                {/* English title */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 block">نام انگلیسی فیلم *</label>
                  <input
                    type="text"
                    required
                    value={formTitleEn}
                    onChange={(e) => setFormTitleEn(e.target.value)}
                    className="w-full h-9 px-3 bg-gray-50 dark:bg-slate-800 rounded-lg text-xs border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-indigo-500"
                    placeholder="مثال: The Shawshank Redemption"
                    id="input-title-en"
                  />
                </div>

                {/* Category */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 block">دسته اصلی فیلم *</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as MediaCategory)}
                    className="w-full h-9 px-2 bg-gray-50 dark:bg-slate-800 rounded-lg text-xs border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                    id="input-category"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                {/* Year of publish */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 block">سال ساخت</label>
                  <input
                    type="text"
                    value={formYear}
                    onChange={(e) => setFormYear(e.target.value)}
                    className="w-full h-9 px-3 bg-gray-50 dark:bg-slate-800 rounded-lg text-xs border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-indigo-500"
                    placeholder="مثال: ۱۳۹۴ یا ۲۰۲۰"
                    id="input-year"
                  />
                </div>

                {/* Director */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 block">کارگردان</label>
                  <input
                    type="text"
                    value={formDirector}
                    onChange={(e) => setFormDirector(e.target.value)}
                    className="w-full h-9 px-3 bg-gray-50 dark:bg-slate-800 rounded-lg text-xs border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-indigo-500"
                    placeholder="نام نویسنده/کارگردان"
                    id="input-director"
                  />
                </div>

                {/* Producer/Writer */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 block">نویسنده</label>
                  <input
                    type="text"
                    value={formWriter}
                    onChange={(e) => setFormWriter(e.target.value)}
                    className="w-full h-9 px-3 bg-gray-50 dark:bg-slate-800 rounded-lg text-xs border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-indigo-500"
                    id="input-writer"
                  />
                </div>

                {/* Actors lists */}
                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] font-bold text-gray-500 block">بازیگران اصلی (با ویرگول جدا کنید)</label>
                  <input
                    type="text"
                    value={formActors}
                    onChange={(e) => setFormActors(e.target.value)}
                    className="w-full h-9 px-3 bg-gray-50 dark:bg-slate-800 rounded-lg text-xs border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-indigo-500"
                    placeholder="مثال: تیم رابینز، مورگان فریمن"
                    id="input-actors"
                  />
                </div>

                {/* Country */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 block">کشور سازنده</label>
                  <select
                    value={formCountry}
                    onChange={(e) => setFormCountry(e.target.value)}
                    className="w-full h-9 px-2 bg-gray-50 dark:bg-slate-800 rounded-lg text-xs border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                    id="input-country"
                  >
                    <option value="ایران">ایران</option>
                    <option value="آمریکا">آمریکا</option>
                    <option value="کره جنوبی">کره جنوبی</option>
                    <option value="هند">هند</option>
                    <option value="فرانسه">فرانسه</option>
                    <option value="انگلستان">انگلستان</option>
                    <option value="ژاپن">ژاپن</option>
                    <option value="ایتالیا">ایتالیا</option>
                    <option value="اسپانیا">اسپانیا</option>
                    <option value="آلمان">آلمان</option>
                    <option value="متفرقه">متفرقه / سایر</option>
                  </select>
                </div>

                {/* Language */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 block">زبان فیلم</label>
                  <select
                    value={formLanguage}
                    onChange={(e) => setFormLanguage(e.target.value)}
                    className="w-full h-9 px-2 bg-gray-50 dark:bg-slate-800 rounded-lg text-xs border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                    id="input-language"
                  >
                    <option value="دوبله فارسی">دوبله فارسی</option>
                    <option value="زبان اصلی">زبان اصلی</option>
                    <option value="دوزبانه (دوبله و زبان اصلی)">دوزبانه (دوبله و زبان اصلی)</option>
                  </select>
                </div>

                {/* IMDb score */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 block">امتیاز IMDB</label>
                  <input
                    type="text"
                    value={formImdbRating}
                    onChange={(e) => setFormImdbRating(e.target.value)}
                    className="w-full h-9 px-3 bg-gray-50 dark:bg-slate-800 rounded-lg text-xs border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-indigo-500"
                    placeholder="۸.۵"
                    id="input-imdb"
                  />
                </div>

                {/* Quality */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 block">کیفیت فیلم</label>
                  <select
                    value={formQuality}
                    onChange={(e) => setFormQuality(e.target.value)}
                    className="w-full h-9 px-2 bg-gray-50 dark:bg-slate-800 rounded-lg text-xs border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                    id="input-quality"
                  >
                    <option value="1080p Web-DL">1080p Web-DL</option>
                    <option value="1080p BluRay">1080p BluRay</option>
                    <option value="4K UHD Bluray">4K UHD Bluray</option>
                    <option value="720p HD">720p HD</option>
                  </select>
                </div>

                {/* Subtitle status */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 block">زیرنویس / دوبله</label>
                  <input
                    type="text"
                    value={formSubtitle}
                    onChange={(e) => setFormSubtitle(e.target.value)}
                    className="w-full h-9 px-3 bg-gray-50 dark:bg-slate-800 rounded-lg text-xs border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-indigo-500"
                    id="input-subtitle"
                  />
                </div>
              </div>

              {/* Genres array multi-select with custom checked label styles */}
              <div className="space-y-1.5 pt-1">
                <label className="text-[10px] font-bold text-gray-500 block">ژانرهای فیلم (برای انتخاب علامت بزنید)</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2 bg-gray-50 dark:bg-slate-800/50 p-3 rounded-lg border border-gray-200 dark:border-gray-700 h-[115px] overflow-y-auto">
                  {POPULAR_GENRES.map((g) => {
                    const isChecked = formGenres.includes(g);
                    return (
                      <label key={g} className="flex items-center gap-1.5 p-1 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 rounded cursor-pointer select-none text-[10.5px]">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            if (isChecked) {
                              setFormGenres(formGenres.filter(item => item !== g));
                            } else {
                              setFormGenres([...formGenres, g]);
                            }
                          }}
                          className="w-3.5 h-3.5 accent-indigo-650 cursor-pointer text-indigo-600 rounded"
                        />
                        <span className="text-gray-700 dark:text-gray-300 font-medium">{g}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Poster configuration with physical selector and fallbacks */}
              <div className="space-y-1.5 pt-1">
                <label className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 block">پوستر فیلم (بارگذاری فایل یا درج لینک وب)</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={formPoster}
                    onChange={(e) => setFormPoster(e.target.value)}
                    className="flex-1 h-9 px-3 bg-gray-50 dark:bg-slate-800 rounded-lg text-xs border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-indigo-500"
                    placeholder="آدرس اینترنتی تصویر یا مسیر فایل دیسک..."
                    id="input-poster"
                  />
                  <button
                    type="button"
                    onClick={handlePickPoster}
                    className="h-9 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0"
                    id="btn-pick-poster"
                  >
                    انتخاب فایل عکس...
                  </button>
                </div>
                <div className="flex gap-1 overflow-x-auto pt-0.5 pb-1 shrink-0" id="presets-list">
                  <span className="text-[9px] text-gray-400 self-center ml-2 hidden sm:inline">انتخاب سریع:</span>
                  {PRESET_POSTERS.map((preset, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setFormPoster(preset.url)}
                      className={`px-2 py-0.5 text-[8.5px] rounded font-bold border transition-all shrink-0 cursor-pointer ${
                        formPoster === preset.url 
                          ? 'bg-indigo-600 text-white border-indigo-600' 
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100 dark:bg-[#1a2236]/60 dark:border-gray-750 dark:text-gray-300'
                      }`}
                      id={`btn-preset-${i}`}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Physical Storage File Path (Satisfying Electron requirement) */}
              <div className="space-y-1 pt-1">
                <label className="text-[10px] font-bold text-emerald-500 dark:text-emerald-400 block">مسیر فیزیکی فایل فیلم در سیستم یا سرور (امکان باز کردن پوشه و پخش مستقیم)</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={formFilePath}
                      onChange={(e) => setFormFilePath(e.target.value)}
                      className="w-full h-9 pl-4 pr-9 bg-gray-50 dark:bg-slate-800 rounded-lg text-xs font-mono border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 focus:outline-none focus:border-indigo-500"
                      placeholder="D:\Media\Movies\A.Separation.1080p.mkv"
                      id="input-filepath"
                    />
                    <FileVideo className="absolute right-3 top-2.5 w-4 h-4 text-emerald-500" />
                  </div>
                  <button
                    type="button"
                    onClick={handlePickFilePath}
                    className="h-9 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0"
                    id="btn-pick-filepath"
                  >
                    جستجوی فایل...
                  </button>
                </div>
                <p className="text-[9px] text-gray-400">قیمت محاسباتی در صدور فاکتورها طبق تنظیمات عمومی اعمال خواهد شد.</p>
              </div>

              {/* Film synopsis / Narrative */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 block">خلاصه داستان / توضیحات برای مشتری</label>
                <textarea
                  value={formSummary}
                  onChange={(e) => setFormSummary(e.target.value)}
                  className="w-full py-2 px-3 bg-gray-50 dark:bg-slate-800 rounded-lg text-xs border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-indigo-500 h-20 resize-none"
                  placeholder="وارد کردن خلاصه فیلم جهت معرفی مراجعین..."
                  id="input-summary"
                />
              </div>

              {/* Form Actions Footer */}
              <div className="pt-4 border-t border-gray-150 dark:border-gray-800 flex justify-end gap-3.5">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-850 text-xs font-semibold text-gray-650 dark:text-gray-300 cursor-pointer"
                  id="btn-cancel-form"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow cursor-pointer"
                  id="btn-submit-form"
                >
                  <Check className="w-4 h-4" />
                  <span>ذخیره‌سازی اطلاعات</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAIL OVERLAY MODAL */}
      {detailMovie && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto" id="movie-detail-modal">
          <div className="bg-white dark:bg-[#1e293b] w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden animate-scaleIn border border-gray-200 dark:border-gray-800 flex flex-col md:flex-row relative">
            
            {/* Close button */}
            <button 
              onClick={() => setDetailMovie(null)}
              className="absolute top-3 left-3 z-[31] p-1.5 bg-black/40 text-white hover:bg-black/60 rounded-full transition-colors"
              id="close-detail-modal"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Poster column */}
            <div className="w-full md:w-2/5 h-64 md:h-auto bg-gray-950 relative overflow-hidden shrink-0">
              <img 
                src={detailMovie.poster} 
                alt={detailMovie.titleFa} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-l from-transparent to-black/40"></div>
              <button
                onClick={() => setZoomedPoster(detailMovie.poster)}
                className="absolute bottom-3 right-3 p-2 bg-black/50 text-white rounded-lg hover:bg-black/75 transition-colors text-xs flex items-center gap-1.5 font-bold"
                id="btn-zoom-detail-poster"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>بزرگنمایی</span>
              </button>
            </div>

            {/* Meta column */}
            <div className="p-5 flex-1 flex flex-col justify-between" id="detail-meta-column">
              <div className="space-y-3.5">
                <div>
                  <span className="text-[9px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded font-bold dark:bg-indigo-950 dark:text-indigo-300">{detailMovie.category}</span>
                  <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 mt-2">{detailMovie.titleFa}</h2>
                  <p className="text-xs text-gray-400 font-mono mt-0.5">{detailMovie.titleEn} | {toPersianNums(detailMovie.year)}</p>
                </div>

                <div className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed max-h-24 overflow-y-auto">
                  {detailMovie.summary || <span className="italic text-gray-400">هیچ خلاصه‌ای ثبت نشده است.</span>}
                </div>

                {/* Characteristics table */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-2 border-t border-gray-100 dark:border-gray-800 text-[11px]" id="detail-char-table">
                  <div>
                    <span className="text-gray-400">کارگردان:</span> <strong className="text-gray-700 dark:text-gray-200">{detailMovie.director || 'نامشخص'}</strong>
                  </div>
                  <div>
                    <span className="text-gray-400">کشور:</span> <strong className="text-gray-700 dark:text-gray-200">{detailMovie.country}</strong>
                  </div>
                  <div>
                    <span className="text-gray-400">زبان:</span> <strong className="text-gray-700 dark:text-gray-200">{detailMovie.language}</strong>
                  </div>
                  <div>
                    <span className="text-gray-400">رتبه:</span> <strong className="text-amber-500 font-bold font-mono">★ {toPersianNums(detailMovie.imdbRating)}</strong>
                  </div>
                  <div>
                    <span className="text-gray-400">نویسنده:</span> <strong className="text-gray-700 dark:text-gray-200">{detailMovie.writer || 'نامشخص'}</strong>
                  </div>
                  <div>
                    <span className="text-gray-400">زمان:</span> <strong className="text-gray-700 dark:text-gray-200">{toPersianNums(detailMovie.duration)}</strong>
                  </div>
                </div>

                {/* Subtitle status & Quality details */}
                <div className="flex gap-2" id="detail-qual-subtitle">
                  <span className="text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-150 dark:border-gray-700 px-2.5 py-1 rounded font-bold">{detailMovie.quality}</span>
                  <span className="text-[10px] bg-slate-50 dark:bg-slate-800 text-gray-600 dark:text-gray-300 border border-gray-150 dark:border-gray-700 px-2.5 py-1 rounded font-bold">{detailMovie.subtitle}</span>
                </div>
              </div>

              {/* Actions footer */}
              <div className="border-t border-gray-100 dark:border-gray-800 pt-4 mt-4 flex flex-col sm:flex-row gap-3" id="detail-action-buttons">
                {/* Sale direct registration */}
                <button
                  onClick={(e) => { setDetailMovie(null); handleOpenSale(detailMovie, e); }}
                  className="flex-1 flex items-center justify-center gap-1.5 h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow shadow-emerald-500/10 cursor-pointer"
                  id="btn-detail-sell"
                >
                  <DollarSign className="w-4 h-4" />
                  <span>ثبت و صدور فاکتور ({formatCurrency(detailMovie.salePrice)})</span>
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => { handlePlayFile(detailMovie.filePath); }}
                    className="p-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200 rounded-lg cursor-pointer"
                    title="پخش ویدیو ▶️"
                    id="btn-detail-play"
                  >
                    <Play className="w-4 h-4 fill-current text-indigo-500" />
                  </button>
                  <button
                    onClick={() => { handleOpenFolder(detailMovie.filePath); }}
                    className="p-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200 rounded-lg cursor-pointer"
                    title="موقعیت فیزیکی 📁"
                    id="btn-detail-explore"
                  >
                    <FolderOpen className="w-4 h-4 text-sky-500" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PORTAL SIMULATED VIDEO PLAYER MODAL ▶️ */}
      {playingMovie && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4" id="simulated-player-modal">
          <div className="bg-slate-950 w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden animate-scaleIn border border-slate-800 text-white flex flex-col">
            
            {/* Player Header */}
            <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between bg-black/30">
              <span className="flex items-center gap-2 text-xs text-indigo-400">
                <Play className="w-4 h-4 text-indigo-400 fill-current animate-pulse" />
                <span>پخش‌کننده مدیا (Desktop Player Link)</span>
              </span>
              <h4 className="text-xs font-bold text-gray-200">{playingMovie.titleFa}</h4>
              <button 
                onClick={() => setPlayingMovie(null)}
                className="text-gray-400 hover:text-white p-1 rounded-full bg-slate-900 transition-colors"
                id="close-player"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Play Area Canvas */}
            <div className="aspect-video bg-black flex flex-col items-center justify-center relative group" id="player-screen">
              {/* Virtual Film Poster underneath overlay */}
              <img 
                src={playingMovie.poster} 
                alt={playingMovie.titleFa} 
                className="absolute inset-0 w-full h-full object-cover opacity-20 blur-sm pointer-events-none"
                referrerPolicy="no-referrer"
              />

              {/* Decorative Audio frequencies */}
              <div className="z-10 flex items-end gap-1 h-12" id="simulated-equalizer">
                <div className="w-1 bg-indigo-500 rounded-full h-8 animate-pulse"></div>
                <div className="w-1 bg-sky-500 rounded-full h-12 animate-pulse animation-delay-200"></div>
                <div className="w-1 bg-[#10b981] rounded-full h-6 animate-pulse animation-delay-500"></div>
                <div className="w-1 bg-purple-500 rounded-full h-10 animate-pulse animation-delay-300"></div>
              </div>

              <div className="z-10 mt-4 text-center">
                <p className="text-xs font-bold tracking-wide">{playingMovie.titleEn}</p>
                <p className="text-[10px] text-gray-500 font-mono mt-1 pr-4 pl-4 truncate">{playingMovie.filePath}</p>
              </div>

              {/* Action alert */}
              <span className="absolute bottom-4 left-4 text-[9px] text-[#38bdf8] bg-[#38bdf8]/10 py-1 px-2.5 rounded-full border border-[#38bdf8]/20 font-mono">
                DESKTOP_PROCESS_ACTIVE (electron-spawn_success)
              </span>
            </div>

            {/* Custom Control Bar */}
            <div className="px-5 py-4 bg-slate-900 space-y-3" dir="ltr" id="player-controls">
              {/* Timeline slider representation */}
              <div className="flex items-center justify-between text-[11px] text-gray-400 font-mono gap-3.5 select-none">
                <span>01:14:02</span>
                <div className="flex-1 h-1 bg-slate-850 rounded-full relative overflow-hidden" id="timeline-track">
                  <div className="absolute left-0 top-0 bottom-0 bg-indigo-500 w-[45%]"></div>
                </div>
                <span>02:35:10</span>
              </div>

              {/* Control Triggers */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button className="p-1.5 hover:bg-slate-800 rounded transition-colors text-gray-300 hover:text-white" title="زیرنویس">CC</button>
                  <button className="p-1.5 hover:bg-slate-800 rounded transition-colors text-gray-300 hover:text-white" title="مسیر صدا">Audio Track</button>
                </div>

                <div className="flex items-center gap-4">
                  {/* Play simulation */}
                  <div className="bg-white text-slate-950 p-2.5 rounded-full hover:scale-105 transition-transform cursor-pointer">
                    <Play className="w-4 h-4 fill-current text-slate-950 ml-0.5" />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-gray-400" />
                  <div className="w-16 h-1 bg-slate-850 rounded" id="volume-track">
                    <div className="bg-indigo-500 h-full w-[80%] rounded"></div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* PORTAL SIMULATED DIRECTORY PATH FOLDER EXPLORER 📁 */}
      {exploringFolder && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" id="simulated-folder-modal">
          <div className="bg-white dark:bg-[#0f172a] w-full max-w-md rounded-xl shadow-2xl overflow-hidden animate-scaleIn border border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-100 flex flex-col">
            
            {/* Header */}
            <div className="px-4 py-3 bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs text-amber-500 font-bold">
                <FolderOpen className="w-4 h-4 text-amber-500" />
                <span>شبیه‌ساز فایل اکسپلورر دسکتاپ</span>
              </span>
              <button onClick={() => setExploringFolder(null)} className="text-gray-450 hover:text-gray-600 rounded">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body displaying Path */}
            <div className="p-5 space-y-4" id="folder-body">
              <p className="text-xs text-gray-550 dark:text-gray-300 mt-1 pb-1">سیستم‌عامل Electron دستور باز کردن پوشه فیزیکی زیر را در سیستم‌عامل کاربر اجرا کرده است:</p>
              
              <div className="bg-gray-50 dark:bg-slate-950 p-3 rounded-lg border border-gray-250 dark:border-slate-800 select-all font-mono text-[11px] text-[#38bdf8] select-all break-all leading-relaxed" dir="ltr">
                {exploringFolder.filePath.substring(0, exploringFolder.filePath.lastIndexOf('\\')) || 'D:\\Media\\Movies\\'}
              </div>

              <div className="p-3 bg-blue-50 dark:bg-slate-900 border border-blue-100 dark:border-slate-800 rounded-lg flex gap-3 text-xs text-blue-800 dark:text-gray-300" id="explorer-info-box">
                <Info className="w-4 h-4 shrink-0 mt-0.5 text-blue-500" />
                <div className="leading-relaxed">
                  <p className="font-bold">مجموعه پیوند سیستم</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">در محیط واقعی Electron، دستور <code>shell.showItemInFolder</code> مسیر فوق را مستقیماً در نرم‌افزار Windows Explorer یا Mac Finder باز می‌کند.</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-gray-50 dark:bg-slate-850 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2 text-xs">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(exploringFolder.filePath);
                  alert('مسیر فیزیکی فایل کپی شد: ' + exploringFolder.filePath);
                }}
                className="px-3 py-1.5 bg-gray-250 hover:bg-gray-300 dark:bg-slate-800 text-gray-750 dark:text-gray-300 rounded font-semibold transition-colors cursor-pointer"
                id="btn-copy-path"
              >
                کپی کردن مسیر فیزیکی
              </button>
              <button
                onClick={() => setExploringFolder(null)}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-bold transition-colors cursor-pointer"
                id="btn-close-folder"
              >
                تایید
              </button>
            </div>

          </div>
        </div>
      )}

      {/* PORTER ZOOM LIGHTBOX MODAL */}
      {zoomedPoster && (
        <div 
          onClick={() => setZoomedPoster(null)} 
          className="fixed inset-0 z-[110] bg-black/85 flex items-center justify-center p-4 cursor-zoom-out"
          id="poster-lightbox-modal"
        >
          <img 
            src={zoomedPoster} 
            alt="پوستر زوم‌شده" 
            className="max-h-[90vh] max-w-full rounded-lg shadow-2xl animate-scaleIn bg-gray-950" 
            referrerPolicy="no-referrer"
          />
        </div>
      )}

      {/* DIRECT SALE REGISTER FORM MODAL 💰 */}
      {sellingMovie && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" id="direct-sale-modal">
          <div className="bg-white dark:bg-[#1e293b] w-full max-w-md rounded-xl shadow-2xl overflow-hidden animate-scaleIn border border-gray-100 dark:border-gray-800 text-gray-850 dark:text-gray-150">
            {/* Header */}
            <div className="px-4 py-3.5 bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold dark:text-emerald-400">
                <DollarSign className="w-4 h-4 text-emerald-500 animate-bounce" />
                <span>ثبت فاکتور فروش برای فیلم</span>
              </span>
              <button onClick={() => setSellingMovie(null)} className="text-gray-400 hover:text-gray-600 rounded">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleRegisterSale} className="p-5 space-y-4" id="sale-registration-form">
              <div className="p-3 bg-indigo-50 dark:bg-slate-900 rounded-lg flex items-center gap-3 border border-indigo-100 dark:border-slate-800">
                <img src={sellingMovie.poster} alt="" className="w-10 h-14 object-cover rounded shadow-sm" referrerPolicy="no-referrer" />
                <div>
                  <h4 className="text-xs font-bold text-[#312e81] dark:text-gray-100">{sellingMovie.titleFa}</h4>
                  <p className="text-[10px] text-gray-400 mt-0.5">{sellingMovie.titleEn} ({toPersianNums(sellingMovie.year)})</p>
                  <p className="text-[10px] text-emerald-600 mt-1 font-mono">قیمت پایه فروش: {formatCurrency(sellingMovie.salePrice)}</p>
                </div>
              </div>

              {/* Customer Info (Read only indicator) */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-gray-500 block">اضافه شدن به سیستم سبد خرید</span>
                <p className="text-[11px] leading-relaxed text-gray-450 dark:text-gray-450">
                  این کالا مستقیماً پس از کلیک روی افزودن، به فاکتور تسویه‌نشده در بالای صفحه فرستاده می‌شود.
                </p>
              </div>

              {/* Real sale price */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 block columns-1">قیمت فروش برای مشتری (تومان)</label>
                  <input
                    type="number"
                    value={salePrice}
                    onChange={(e) => setSalePrice(Number(e.target.value))}
                    className="w-full h-9 px-3 bg-gray-50 dark:bg-slate-800 rounded-lg text-xs border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-100 focus:outline-none focus:border-indigo-500"
                    id="sale-price-input"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 block columns-1">کاهش / تخفیف جزئی (تومان)</label>
                  <input
                    type="number"
                    value={saleDiscount}
                    onChange={(e) => setSaleDiscount(Number(e.target.value))}
                    className="w-full h-9 px-3 bg-gray-50 dark:bg-slate-800 rounded-lg text-xs border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-red-500"
                    id="sale-discount-input"
                  />
                </div>
              </div>

              {/* Financial result estimation */}
              <div className="pt-2 text-[10px] text-gray-500 space-y-1 border-t border-gray-100 dark:border-gray-800">
                <div className="flex justify-between">
                  <span>سود ناخالص تقریبی این کالا:</span>
                  <span className="font-mono text-emerald-500 font-bold">
                    {formatCurrency(Math.max((salePrice - saleDiscount) - sellingMovie.purchasePrice, 0))}
                  </span>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-2 flex justify-end gap-3.5">
                <button
                  type="button"
                  onClick={() => setSellingMovie(null)}
                  className="px-4 py-2 border border-gray-205 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-xs font-semibold text-gray-650 cursor-pointer"
                  id="btn-cancel-sale"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-white text-xs font-bold rounded-lg shadow cursor-pointer bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/15 flex items-center gap-1"
                  id="btn-confirm-sale"
                >
                  <span>افزودن به سبد خرید 🛒</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
