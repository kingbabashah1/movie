/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { dbService } from '../db/databaseService';
import { Series, Season, Episode, MediaCategory } from '../types';
import { toPersianNums, formatCurrency } from './Dashboard';
import { CATEGORIES } from './Movies';
import { 
  Tv, 
  Plus, 
  Search, 
  SlidersHorizontal, 
  X, 
  Edit, 
  Trash2, 
  ListOrdered, 
  DollarSign, 
  Check, 
  PlusCircle, 
  FileVideo, 
  ArrowLeft, 
  Film,
  Menu,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Info,
  Play,
  FolderOpen
} from 'lucide-react';

interface SeriesProps {
  onAddToCart?: (item: any) => void;
  cartItems?: any[];
  activeCustomer?: { id: string; name: string; phone: string; } | null;
}

export default function SeriesPage({ onAddToCart, cartItems = [], activeCustomer }: SeriesProps) {
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<MediaCategory | 'همه'>('همه');
  const [searchQuery, setSearchQuery] = useState('');

  // Filters
  const [filterCountry, setFilterCountry] = useState('');
  const [filterLanguage, setFilterLanguage] = useState('');
  const [filterGenre, setFilterGenre] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterQuality, setFilterQuality] = useState('');
  const [filterMinImdb, setFilterMinImdb] = useState('');
  const [filterCrew, setFilterCrew] = useState('');
  const [sortBy, setSortBy] = useState<'titleFa' | 'year' | 'imdbRating' | 'addedAt'>('addedAt');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [showFilters, setShowFilters] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Modals Toggles
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingSeries, setEditingSeries] = useState<Series | null>(null);

  // Form Fields State
  const [formCategory, setFormCategory] = useState<MediaCategory>('ایرانی');
  const [formTitleFa, setFormTitleFa] = useState('');
  const [formTitleEn, setFormTitleEn] = useState('');
  const [formYear, setFormYear] = useState('');
  const [formDirector, setFormDirector] = useState('');
  const [formWriter, setFormWriter] = useState('');
  const [formActors, setFormActors] = useState('');
  const [formEpisodeDuration, setFormEpisodeDuration] = useState('');
  const [formCountry, setFormCountry] = useState('ایران');
  const [formLanguage, setFormLanguage] = useState('دوبله فارسی');
  const [formImdbRating, setFormImdbRating] = useState('');
  const [formQuality, setFormQuality] = useState('1080p Web-DL');
  const [formSubtitle, setFormSubtitle] = useState('دوبله فارسی');
  const [formGenres, setFormGenres] = useState<string[]>(['درام']);
  const [formPoster, setFormPoster] = useState('https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?auto=format&fit=crop&q=80&w=400');
  const [formSummary, setFormSummary] = useState('');
  const [formFilePath, setFormFilePath] = useState('');

  // Episode & Season Manager Modal
  const [managingSeries, setManagingSeries] = useState<Series | null>(null);
  const [activeSeasonId, setActiveSeasonId] = useState<string | null>(null); // active season ID being managed
  const [editingSeasonId, setEditingSeasonId] = useState<string | null>(null);
  const [editingSeasonName, setEditingSeasonName] = useState('');
  const [seasonFormName, setSeasonFormName] = useState('');
  
  const [showAddEpisodeBox, setShowAddEpisodeBox] = useState<string | null>(null); // seasonId to show box for Adding
  const [editingEpisodeId, setEditingEpisodeId] = useState<string | null>(null); // episode ID being edited
  const [episodeFormNum, setEpisodeFormNum] = useState(1);
  const [episodeFormName, setEpisodeFormName] = useState('');
  const [episodeFormFile, setEpisodeFormFile] = useState('');
  const [episodeFormDesc, setEpisodeFormDesc] = useState('');

  // Batch Generation States
  const [batchSeasonsCount, setBatchSeasonsCount] = useState(2);
  const [batchEpisodesForSeason, setBatchEpisodesForSeason] = useState<number[]>([10, 10]);

  // Sells modal 💰
  const [sellingSeries, setSellingSeries] = useState<Series | null>(null);
  const [saleCustomerName, setSaleCustomerName] = useState('');
  const [saleOption, setSaleOption] = useState<'full' | 'season' | 'episode'>('full');
  const [selectedSaleSeason, setSelectedSaleSeason] = useState('');
  const [selectedSaleEpisode, setSelectedSaleEpisode] = useState('');
  const [calculatedPrice, setCalculatedPrice] = useState(0);
  const [saleDiscount, setSaleDiscount] = useState(0);

  useEffect(() => {
    refreshData();
  }, []);

  // Auto path suggestions for new episodes
  useEffect(() => {
    if (managingSeries && activeSeasonId && showAddEpisodeBox === activeSeasonId && !editingEpisodeId) {
      const defaultPath = getEpisodeDefaultPath(managingSeries, activeSeasonId, episodeFormNum);
      setEpisodeFormFile(defaultPath);
    }
  }, [episodeFormNum, activeSeasonId, showAddEpisodeBox, editingEpisodeId, managingSeries?.filePath, managingSeries?.titleEn]);

  const refreshData = () => {
    setSeriesList(dbService.getSeries());
    const settings = dbService.getSettings();
    setPageSize(settings.pageSize || 20);
  };

  // 1. Populate form for Edit
  const handleOpenEdit = (series: Series, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSeries(series);
    setFormCategory(series.category);
    setFormTitleFa(series.titleFa);
    setFormTitleEn(series.titleEn);
    setFormYear(series.year);
    setFormDirector(series.director);
    setFormWriter(series.writer);
    setFormActors(series.actors);
    setFormEpisodeDuration(series.episodeDuration);
    setFormCountry(series.country || 'ایران');
    setFormLanguage(series.language || 'دوبله فارسی');
    setFormImdbRating(series.imdbRating);
    setFormQuality(series.quality);
    setFormSubtitle(series.subtitle);
    setFormGenres(series.genres || []);
    setFormPoster(series.poster);
    setFormSummary(series.summary);
    setFormFilePath(series.filePath || '');
    setShowFormModal(true);
  };

  const handleOpenCreate = () => {
    setEditingSeries(null);
    setFormCategory('ایرانی');
    setFormTitleFa('');
    setFormTitleEn('');
    setFormYear('۱۴۰۳');
    setFormDirector('');
    setFormWriter('');
    setFormActors('');
    setFormEpisodeDuration('۵۰ دقیقه');
    setFormCountry('ایران');
    setFormLanguage('دوبله فارسی');
    setFormImdbRating('۸.۰');
    setFormQuality('1080p Web-DL');
    setFormSubtitle('دوبله فارسی');
    setFormGenres(['درام', 'عاشقانه']);
    setFormPoster('https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?auto=format&fit=crop&q=80&w=400');
    setFormSummary('');
    setFormFilePath('');
    setShowFormModal(true);
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

  const handlePickEpisodeFilePath = () => {
    if (window.electronAPI) {
      window.electronAPI.selectFile().then((path: string) => {
        if (path) setEpisodeFormFile(path);
      }).catch((err: any) => {
        console.error('Failed to select file natively:', err);
      });
    } else {
      const inputPath = window.prompt('(شبیه‌ساز آنلاین) آدرس فیزیکی فایل این قسمت را وارد کنید:', episodeFormFile || 'D:\\Media\\Series\\EpisodeName.mkv');
      if (inputPath !== null) {
        setEpisodeFormFile(inputPath);
      }
    }
  };

  const handlePlayFile = async (filePath: string) => {
    if (!filePath) {
      alert('مسیری برای این رسانه ثبت نشده است. ابتدا اطلاعات ران ویرایش کرده و آدرس فایل را وارد نمایید.');
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
      alert('مسیری برای این رسانه ثبت نشده است. ابتدا اطلاعات را ویرایش کرده و آدرس فایل را وارد نمایید.');
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

  const handlePlayEpisode = (episode: Episode, series: Series) => {
    const path = episode.videoPath && episode.videoPath.trim() !== '' && episode.videoPath !== 'D:\\Media\\Series\\Video.mkv'
      ? episode.videoPath
      : (series.filePath || '');
    handlePlayFile(path);
  };

  const handleOpenEpisodeFolder = (episode: Episode, series: Series) => {
    const path = episode.videoPath && episode.videoPath.trim() !== '' && episode.videoPath !== 'D:\\Media\\Series\\Video.mkv'
      ? episode.videoPath
      : (series.filePath || '');
    handleOpenFolder(path);
  };

  const handleDeleteSeries = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('آیا از حذف این سریال به همراه تمامی فصل‌ها و قسمت‌ها اطمینان دارید؟')) {
      dbService.deleteSeries(id);
      refreshData();
      if (managingSeries && managingSeries.id === id) {
        setManagingSeries(null);
      }
    }
  };

  const handleSaveSeries = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitleFa || !formTitleEn) {
      alert('وارد کردن نام فارسی و انگلیسی اجباری است.');
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
      episodeDuration: formEpisodeDuration,
      country: formCountry,
      language: formLanguage,
      imdbRating: formImdbRating,
      quality: formQuality,
      subtitle: formSubtitle,
      genres: formGenres,
      poster: formPoster,
      summary: formSummary,
      filePath: formFilePath,
      purchasePrice: 0,
      salePrice: settings.defaultSeriesPrice * 10 // general season package baseline
    };

    if (editingSeries) {
      dbService.updateSeries(editingSeries.id, payload);
    } else {
      dbService.addSeries(payload);
    }

    setShowFormModal(false);
    refreshData();
  };

  // 2. Nesting Season Managers
  const handleAddNewSeason = (e: React.FormEvent) => {
    e.preventDefault();
    if (!managingSeries || !seasonFormName.trim()) return;

    const newSeason = dbService.addSeason(managingSeries.id, seasonFormName);
    setSeasonFormName('');
    // Reload managing series context
    const updated = dbService.getSeries().find(s => s.id === managingSeries.id);
    if (updated) {
      setManagingSeries(updated);
      if (newSeason) {
        setActiveSeasonId(newSeason.id);
      }
    }
    refreshData();
  };

  const handleDeleteSeason = (seasonId: string) => {
    if (!managingSeries) return;
    if (window.confirm('با حذف این فصل تمام قسمت‌های آن خارج خواهند شد. حذف شود؟')) {
      dbService.deleteSeason(managingSeries.id, seasonId);
      const updated = dbService.getSeries().find(s => s.id === managingSeries.id);
      if (updated) {
        setManagingSeries(updated);
        if (activeSeasonId === seasonId) {
          if (updated.seasons && updated.seasons.length > 0) {
            setActiveSeasonId(updated.seasons[0].id);
          } else {
            setActiveSeasonId(null);
          }
        }
      } else {
        setManagingSeries(null);
        setActiveSeasonId(null);
      }
      refreshData();
    }
  };

  const handleUpdateSeason = (seasonId: string) => {
    if (!managingSeries || !editingSeasonName.trim()) return;
    dbService.updateSeason(managingSeries.id, seasonId, editingSeasonName);
    setEditingSeasonId(null);
    setEditingSeasonName('');
    const updated = dbService.getSeries().find(s => s.id === managingSeries.id);
    if (updated) setManagingSeries(updated);
    refreshData();
  };

  // 3. Nesting Episode Actions
  const handleAddEpisode = (seasonId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!managingSeries) return;

    if (editingEpisodeId) {
      dbService.updateEpisode(managingSeries.id, seasonId, editingEpisodeId, {
        episodeNumber: Number(episodeFormNum) || 1,
        name: episodeFormName || `قسمت ${toPersianNums(episodeFormNum)}`,
        videoPath: episodeFormFile || `D:\\Media\\Series\\Video.mkv`,
        description: episodeFormDesc
      });
    } else {
      dbService.addEpisode(managingSeries.id, seasonId, {
        episodeNumber: Number(episodeFormNum) || 1,
        name: episodeFormName || `قسمت ${toPersianNums(episodeFormNum)}`,
        videoPath: episodeFormFile || `D:\\Media\\Series\\Video.mkv`,
        description: episodeFormDesc
      });
    }

    // Reset episode inputs
    setEpisodeFormNum(1);
    setEpisodeFormName('');
    setEpisodeFormFile('');
    setEpisodeFormDesc('');
    setShowAddEpisodeBox(null);
    setEditingEpisodeId(null);

    const updated = dbService.getSeries().find(s => s.id === managingSeries.id);
    if (updated) setManagingSeries(updated);
    refreshData();
  };

  const handleBatchSeasonsCountChange = (count: number) => {
    setBatchSeasonsCount(count);
    const newArr = [...batchEpisodesForSeason];
    if (count > newArr.length) {
      for (let i = newArr.length; i < count; i++) {
        newArr.push(10); // default 10 episodes
      }
    } else if (count < newArr.length) {
      newArr.length = count;
    }
    setBatchEpisodesForSeason(newArr);
  };

  const getEpisodeDefaultPath = (series: Series, seasonId: string | null, epNum: number) => {
    if (!series) return '';
    const folderPath = series.filePath || `D:\\Media\\Series\\${series.titleEn || ''}`;
    const enTitle = (series.titleEn || 'series').trim().toLowerCase().replace(/\s+/g, '-');
    
    let sNum = 1;
    if (series.seasons && seasonId) {
      const idx = series.seasons.findIndex(s => s.id === seasonId);
      if (idx !== -1) {
        sNum = idx + 1;
      }
    }
    const sStr = sNum.toString().padStart(2, '0');
    const eStr = epNum.toString().padStart(2, '0');
    
    return `${folderPath}\\Season-${sStr}\\${enTitle}-s${sStr}-e${eStr}.mkv`;
  };

  const handleGenerateBatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!managingSeries) return;

    if (window.confirm('توجه: تولید گروهی تمام فصل‌ها و قسمت‌های قبلی این سریال را حذف و به طور کامل بازنویسی خواهد کرد. آیا مطمئن هستید؟')) {
      let updatedSeasonsList: Season[] = [];
      const numSeasons = Number(batchSeasonsCount) || 1;
      const seasonNamesFa = ["اول", "دوم", "سوم", "چهارم", "پنجم", "ششم", "هفتم", "هشتم", "نهم", "دهم", "یازدهم", "دوازدهم", "سیزدهم", "چهاردهم", "پانزدهم"];

      const enTitle = (managingSeries.titleEn || 'series').trim().toLowerCase().replace(/\s+/g, '-');
      const rootPath = managingSeries.filePath || `D:\\Media\\Series\\${managingSeries.titleEn || 'SeriesName'}`;

      for (let sIdx = 0; sIdx < numSeasons; sIdx++) {
        const sName = `فصل ${seasonNamesFa[sIdx] || (sIdx + 1)}`;
        const numEpisodes = Number(batchEpisodesForSeason[sIdx]) || 10;
        const episodesList: Episode[] = [];
        const sStr = (sIdx + 1).toString().padStart(2, '0');

        for (let eIdx = 1; eIdx <= numEpisodes; eIdx++) {
          const eStr = eIdx.toString().padStart(2, '0');
          const autoPath = `${rootPath}\\Season-${sStr}\\${enTitle}-s${sStr}-e${eStr}.mkv`;

          episodesList.push({
            id: 'ep_' + Math.random().toString(36).substr(2, 9),
            episodeNumber: eIdx,
            name: `قسمت ${toPersianNums(eIdx)}`,
            videoPath: autoPath,
            description: ''
          });
        }

        updatedSeasonsList.push({
          id: 'se_' + Math.random().toString(36).substr(2, 9),
          name: sName,
          episodes: episodesList
        });
      }

      dbService.updateSeries(managingSeries.id, { seasons: updatedSeasonsList });
      
      const updated = dbService.getSeries().find(s => s.id === managingSeries.id);
      if (updated) {
        setManagingSeries(updated);
        if (updated.seasons && updated.seasons.length > 0) {
          setActiveSeasonId(updated.seasons[0].id);
        } else {
          setActiveSeasonId(null);
        }
      }
      refreshData();
      alert('فصل‌ها و قسمت‌ها به طور کامل و گروهی تولید شدند!');
    }
  };

  const handleDeleteEpisode = (seasonId: string, epId: string) => {
    if (!managingSeries) return;
    if (window.confirm('آیا قصد حذف این قسمت را دارید؟')) {
      dbService.deleteEpisode(managingSeries.id, seasonId, epId);
      const updated = dbService.getSeries().find(s => s.id === managingSeries.id);
      if (updated) setManagingSeries(updated);
      refreshData();
    }
  };

  // Helper: Retrieve the absolute latest added episode information
  const getLatestEpisodeInfo = (series: Series): string => {
    if (!series.seasons || series.seasons.length === 0) return 'بدون قسمت';
    
    // Scan all seasons and return the episode with the largest index or count
    const allEpisodes: { seasonName: string; ep: Episode }[] = [];
    series.seasons.forEach(season => {
      season.episodes.forEach(ep => {
        allEpisodes.push({ seasonName: season.name, ep });
      });
    });

    if (allEpisodes.length === 0) return 'فصل بدون قسمت';
    
    // Sort or return the last one in order
    const lastItem = allEpisodes[allEpisodes.length - 1];
    return `${lastItem.seasonName} - قسمت ${toPersianNums(lastItem.ep.episodeNumber)} (${lastItem.ep.name})`;
  };

  // 4. Advanced Sales overlay 💰
  const handleOpenSale = (series: Series, e: React.MouseEvent) => {
    e.stopPropagation();
    setSellingSeries(series);
    setSaleCustomerName(activeCustomer ? activeCustomer.name : '');
    setSaleOption('full');

    const settings = dbService.getSettings();
    const totalEpisodes = series.seasons.reduce((sum, s) => sum + s.episodes.length, 0);
    const computedFullPrice = totalEpisodes > 0 ? totalEpisodes * settings.defaultSeriesPrice : 10 * settings.defaultSeriesPrice;
    setCalculatedPrice(computedFullPrice);
    setSaleDiscount(0);

    // Pick first defaults if available
    if (series.seasons && series.seasons.length > 0) {
      setSelectedSaleSeason(series.seasons[0].id);
      if (series.seasons[0].episodes && series.seasons[0].episodes.length > 0) {
        setSelectedSaleEpisode(series.seasons[0].episodes[0].id);
      }
    }
  };

  // Recalculating slice prices dynamically based on user selections
  useEffect(() => {
    if (!sellingSeries) return;

    const settings = dbService.getSettings();
    if (saleOption === 'full') {
      const totalEpisodes = sellingSeries.seasons.reduce((sum, s) => sum + s.episodes.length, 0);
      const computed = totalEpisodes > 0 ? totalEpisodes * settings.defaultSeriesPrice : 10 * settings.defaultSeriesPrice;
      setCalculatedPrice(computed);
    } else if (saleOption === 'season') {
      const targetSeason = sellingSeries.seasons.find(s => s.id === selectedSaleSeason);
      const epCount = targetSeason?.episodes.length || 0;
      const computed = epCount > 0 ? epCount * settings.defaultSeriesPrice : 8 * settings.defaultSeriesPrice;
      setCalculatedPrice(computed);
    } else if (saleOption === 'episode') {
      setCalculatedPrice(settings.defaultSeriesPrice);
    }
  }, [saleOption, selectedSaleSeason, selectedSaleEpisode, sellingSeries]);

  const handleRegisterSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sellingSeries) return;

    let invoiceDetails = 'فروش فیلم/سریال';
    let baseCost = sellingSeries.purchasePrice;
    let filePathToOpen = '';

    if (saleOption === 'full') {
      invoiceDetails = 'فروش کامل سریال';
      if (sellingSeries.seasons.length > 0 && sellingSeries.seasons[0].episodes.length > 0) {
        filePathToOpen = sellingSeries.seasons[0].episodes[0].videoPath || sellingSeries.seasons[0].episodes[0].filePath || '';
      }
    } else if (saleOption === 'season') {
      const targetSeason = sellingSeries.seasons.find(s => s.id === selectedSaleSeason);
      invoiceDetails = `فروش تک فصل (${targetSeason?.name || 'فصل منتخب'})`;
      // Cost division proportionately
      baseCost = Math.round(sellingSeries.purchasePrice / (sellingSeries.seasons.length || 1));
      if (targetSeason && targetSeason.episodes.length > 0) {
        filePathToOpen = targetSeason.episodes[0].videoPath || targetSeason.episodes[0].filePath || '';
      }
    } else if (saleOption === 'episode') {
      const targetSeason = sellingSeries.seasons.find(s => s.id === selectedSaleSeason);
      const targetEpisode = targetSeason?.episodes.find(ep => ep.id === selectedSaleEpisode);
      invoiceDetails = `فروش تک قسمت (${targetSeason?.name} - قسمت ${targetEpisode?.episodeNumber})`;
      // Total episode division cost
      const totalEp = sellingSeries.seasons.reduce((sum, s) => sum + s.episodes.length, 0) || 12;
      baseCost = Math.round(sellingSeries.purchasePrice / totalEp);
      if (targetEpisode) {
        filePathToOpen = targetEpisode.videoPath || targetEpisode.filePath || '';
      }
    }

    if (onAddToCart) {
      let videoPaths: string[] = [];
      if (saleOption === 'full') {
        sellingSeries.seasons.forEach(s => {
          s.episodes.forEach(ep => {
            const p = ep.videoPath || ep.filePath || '';
            if (p) videoPaths.push(p);
          });
        });
      } else if (saleOption === 'season') {
        const targetSeason = sellingSeries.seasons.find(s => s.id === selectedSaleSeason);
        targetSeason?.episodes.forEach(ep => {
          const p = ep.videoPath || ep.filePath || '';
          if (p) videoPaths.push(p);
        });
      } else if (saleOption === 'episode') {
        const targetSeason = sellingSeries.seasons.find(s => s.id === selectedSaleSeason);
        const targetEpisode = targetSeason?.episodes.find(ep => ep.id === selectedSaleEpisode);
        const p = targetEpisode?.videoPath || targetEpisode?.filePath || '';
        if (p) videoPaths.push(p);
      }

      onAddToCart({
        mediaId: sellingSeries.id,
        mediaTitle: sellingSeries.titleFa,
        mediaType: 'series',
        salesType: saleOption === 'full' ? 'series_full' : saleOption === 'season' ? 'series_season' : 'series_episode',
        details: `${sellingSeries.titleFa} (${invoiceDetails})`,
        purchasePrice: baseCost,
        salePrice: Math.max((Number(calculatedPrice) || 0) - Number(saleDiscount || 0), 0),
        filePath: filePathToOpen,
        videoPaths: videoPaths
      });
      setSellingSeries(null);
      return;
    }

    dbService.addSale({
      customerName: 'مشتری صوتی و تصویری دفتری',
      mediaId: sellingSeries.id,
      mediaTitle: sellingSeries.titleFa,
      mediaType: 'series',
      salesType: saleOption === 'full' ? 'series_full' : saleOption === 'season' ? 'series_season' : 'series_episode',
      details: invoiceDetails,
      purchasePrice: baseCost,
      salePrice: Number(calculatedPrice) || 0,
      discount: Number(saleDiscount) || 0
    });

    setSellingSeries(null);
    alert('فاکتور فروش با موفقیت به سرور مالی افزوده و سود خالص آن ثبت شد.');
  };

  // Helper to convert Persian numerals to English numerals
  const toGregorianNumStr = (str: string | number | undefined | null): string => {
    if (str === undefined || str === null) return '';
    return str.toString()
      .replace(/[۰-۹]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 1776))
      .replace(/[٠-٩]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 1632));
  };

  // Filter List Logic
  const filteredSeries = seriesList.filter(item => {
    const matchesCategory = selectedCategory === 'همه' || item.category === selectedCategory;
    const matchesSearch = 
      item.titleFa.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.director.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.actors.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCountry = !filterCountry || item.country.includes(filterCountry);
    const matchesLanguage = !filterLanguage || item.language.includes(filterLanguage);
    const matchesGenre = !filterGenre || (item.genres && item.genres.some(g => g.includes(filterGenre)));
    const matchesYear = !filterYear || toGregorianNumStr(item.year).includes(toGregorianNumStr(filterYear));
    const matchesQuality = !filterQuality || (item.quality && item.quality.toLowerCase().includes(filterQuality.toLowerCase()));
    
    const imdbVal = parseFloat(toGregorianNumStr(item.imdbRating)) || 0;
    const minImdbVal = parseFloat(toGregorianNumStr(filterMinImdb)) || 0;
    const matchesMinImdb = !filterMinImdb || imdbVal >= minImdbVal;
    
    const matchesCrew = !filterCrew || 
      item.director.toLowerCase().includes(filterCrew.toLowerCase()) ||
      item.actors.toLowerCase().includes(filterCrew.toLowerCase()) ||
      (item.writer && item.writer.toLowerCase().includes(filterCrew.toLowerCase()));

    return matchesCategory && matchesSearch && matchesCountry && matchesLanguage && matchesGenre && matchesYear && matchesQuality && matchesMinImdb && matchesCrew;
  });

  // Sort
  const sortedSeries = [...filteredSeries].sort((a, b) => {
    let fieldA: any = a[sortBy];
    let fieldB: any = b[sortBy];

    if (sortBy === 'imdbRating') {
      fieldA = Number(a.imdbRating) || 0;
      fieldB = Number(b.imdbRating) || 0;
    }

    if (sortOrder === 'desc') {
      return fieldA > fieldB ? -1 : 1;
    } else {
      return fieldA < fieldB ? -1 : 1;
    }
  });

  // Paginated List
  const totalItems = sortedSeries.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedSeries = sortedSeries.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Helper to extract unique genres present in seriesList
  const allAvailableGenres = Array.from(new Set(seriesList.flatMap(s => s.genres || [])));

  return (
    <div className="space-y-6" id="series-tab-content">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-4 border-b border-gray-150 dark:border-gray-800 gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100" id="series-title">مدیریت سریال‌ها</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">مدیریت فصول، قسمت‌ها و همچنین سیستم فروش مستقل هر سریال یا فصول مستقل آن</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-1.5 px-4 h-10 bg-[#38bdf8] hover:bg-sky-500 text-slate-950 text-xs font-bold rounded-xl shadow-lg shadow-sky-400/10 transition-all self-start md:self-auto cursor-pointer"
          id="btn-add-series"
        >
          <Plus className="w-4 h-4 text-slate-950" />
          <span>افزودن سریال جدید</span>
        </button>
      </div>

      {/* Tabs Selector category */}
      <div className="flex items-center overflow-x-auto gap-2 pb-1 scrollbar-none" id="series-category-selector">
        <button
          onClick={() => { setSelectedCategory('همه'); setCurrentPage(1); }}
          className={`px-4 py-2 text-xs font-semibold rounded-lg shrink-0 transition-colors cursor-pointer ${
            selectedCategory === 'همه' 
              ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-950' 
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-150 dark:bg-[#1e293b] dark:text-gray-300 dark:border-gray-800 dark:hover:bg-slate-800'
          }`}
          id="series-cat-all"
        >
          همه سریال‌ها ({toPersianNums(seriesList.length)})
        </button>
        {CATEGORIES.map(cat => {
          const count = seriesList.filter(s => s.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => { setSelectedCategory(cat); setCurrentPage(1); }}
              className={`px-4 py-2 text-xs font-semibold rounded-lg shrink-0 transition-colors cursor-pointer ${
                selectedCategory === cat 
                  ? 'bg-sky-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-150 dark:bg-[#1e293b] dark:text-gray-300 dark:border-gray-800 dark:hover:bg-slate-800'
              }`}
              id={`series-cat-${cat}`}
            >
              {cat} ({toPersianNums(count)})
            </button>
          );
        })}
      </div>

      {/* Search and Sort Filter toolbar */}
      <div className="bg-white dark:bg-[#1e293b] p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-3" id="series-filters-row">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Main search text */}
          <div className="flex-1 relative flex items-center">
            <Search className="absolute right-3.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="جستجو در نام سریال، بازیگران، کارگردان..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full pr-10 pl-4 h-10 bg-gray-50 dark:bg-slate-800/60 rounded-lg text-xs font-medium border border-gray-150 dark:border-gray-700 text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-sky-500 animate-fadeIn"
              id="series-search-input"
            />
          </div>

          {/* Filters panel trigger */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-4 h-10 rounded-lg text-xs font-semibold border cursor-pointer transition-colors ${
              showFilters 
                ? 'bg-sky-50 dark:bg-sky-950/20 text-sky-600 dark:text-sky-400 border-sky-300' 
                : 'bg-white text-gray-600 dark:bg-[#1e293b] dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-slate-800 border-gray-200'
            }`}
            id="btn-series-filters"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>فیلترهای پیشرفته</span>
          </button>
        </div>

        {/* Filters dropdown parameters */}
        {showFilters && (
          <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800 animate-fadeIn" id="series-advanced-filters">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {/* Country search */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 block">کشور سازنده</label>
                <input
                  type="text"
                  placeholder="کره جنوبی، ایران، آمریکا..."
                  value={filterCountry}
                  onChange={(e) => { setFilterCountry(e.target.value); setCurrentPage(1); }}
                  className="w-full h-8 px-2.5 bg-gray-50 dark:bg-slate-800 rounded-md text-[11px] border border-gray-200 dark:border-gray-750 text-gray-850 dark:text-gray-200 focus:outline-none focus:border-sky-500 placeholder-gray-450"
                />
              </div>

              {/* Language filter */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 block">زبان سریال</label>
                <select
                  value={filterLanguage}
                  onChange={(e) => { setFilterLanguage(e.target.value); setCurrentPage(1); }}
                  className="w-full h-8 px-2 bg-gray-50 dark:bg-slate-800 rounded-md text-[11px] border border-gray-200 dark:border-gray-750 text-gray-850 dark:text-gray-200 focus:outline-none focus:border-sky-500 cursor-pointer"
                  id="filter-language-series"
                >
                  <option value="">همه زبان‌ها</option>
                  <option value="دوبله فارسی">دوبله فارسی</option>
                  <option value="زبان اصلی">زبان اصلی</option>
                  <option value="دوزبانه (دوبله و زبان اصلی)">دوزبانه (دوبله و زبان اصلی)</option>
                </select>
              </div>

              {/* Genre filter */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 block">ژانر</label>
                <select
                  value={filterGenre}
                  onChange={(e) => { setFilterGenre(e.target.value); setCurrentPage(1); }}
                  className="w-full h-8 px-2 bg-gray-50 dark:bg-slate-800 rounded-md text-[11px] border border-gray-200 dark:border-gray-750 text-gray-850 dark:text-gray-205 focus:outline-none focus:border-sky-500 cursor-pointer"
                >
                  <option value="">همه ژانرها</option>
                  {allAvailableGenres.map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              {/* Year filter */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 block">سال انتشار</label>
                <input
                  type="text"
                  placeholder="۱۴۰۳ یا ۲۰۲۴"
                  value={filterYear}
                  onChange={(e) => { setFilterYear(e.target.value); setCurrentPage(1); }}
                  className="w-full h-8 px-2.5 bg-gray-50 dark:bg-slate-800 rounded-md text-[11px] border border-gray-200 dark:border-gray-750 text-gray-850 dark:text-gray-200 focus:outline-none focus:border-sky-500 placeholder-gray-450"
                />
              </div>

              {/* Quality selector */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 block">کیفیت فیلم</label>
                <select
                  value={filterQuality}
                  onChange={(e) => { setFilterQuality(e.target.value); setCurrentPage(1); }}
                  className="w-full h-8 px-2 bg-gray-50 dark:bg-slate-800 rounded-md text-[11px] border border-gray-200 dark:border-gray-750 text-gray-850 dark:text-gray-200 focus:outline-none focus:border-sky-500 cursor-pointer"
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
                <label className="text-[10px] font-bold text-gray-500 block">امتیاز بندی IMDb</label>
                <select
                  value={filterMinImdb}
                  onChange={(e) => { setFilterMinImdb(e.target.value); setCurrentPage(1); }}
                  className="w-full h-8 px-2 bg-gray-50 dark:bg-slate-800 rounded-md text-[11px] border border-gray-200 dark:border-gray-750 text-gray-850 dark:text-gray-200 focus:outline-none focus:border-sky-500 cursor-pointer"
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
                  placeholder="جستجوی همکاران..."
                  value={filterCrew}
                  onChange={(e) => { setFilterCrew(e.target.value); setCurrentPage(1); }}
                  className="w-full h-8 px-2.5 bg-gray-50 dark:bg-slate-800 rounded-md text-[11px] border border-gray-200 dark:border-gray-750 text-gray-850 dark:text-gray-200 focus:outline-none focus:border-sky-500 placeholder-gray-450"
                />
              </div>

              {/* Sorting and Reset Controls */}
              <div className="flex gap-1.5 pt-4 lg:pt-0 col-span-2 md:col-span-4 lg:col-span-1 items-end justify-between font-sans">
                <div className="flex-1 space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 block">ترتیب بر اساس</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="w-full h-8 px-2 bg-gray-50 dark:bg-slate-800 rounded-md text-[11px] border border-gray-200 dark:border-gray-750 text-gray-850 dark:text-gray-200 focus:outline-none focus:border-sky-500 cursor-pointer"
                  >
                    <option value="addedAt">تاریخ ثبت</option>
                    <option value="year">سال انتشار</option>
                    <option value="imdbRating">رتبه IMDB</option>
                    <option value="titleFa">نام فارسی</option>
                  </select>
                </div>

                <button
                  onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                  className="h-8 w-8 flex items-center justify-center bg-gray-100 hover:bg-gray-150 dark:bg-[#1e293b] hover:dark:bg-slate-800 text-gray-600 dark:text-gray-300 rounded-md border border-gray-200 dark:border-gray-750 cursor-pointer text-xs font-semibold shrink-0"
                  title={sortOrder === 'desc' ? 'نزولی' : 'صعودی'}
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
                className="px-3.5 py-1 text-[10px] font-extrabold text-red-650 hover:text-red-750 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/45 rounded transition-colors cursor-pointer"
              >
                پاکسازی تمامی فیلترها ×
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Series Grid items */}
      {paginatedSeries.length === 0 ? (
        <div className="bg-white dark:bg-[#1e293b] p-12 text-center rounded-xl border border-gray-150 dark:border-gray-800 shadow-sm" id="empty-series">
          <Tv className="w-10 h-10 text-gray-350 mx-auto mb-3 animate-pulse" />
          <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">سریالی سازگار با کوئری شما وجود ندارد!</h3>
          <p className="text-xs text-gray-400 mt-1">امکان تعریف سریال با کلیک روی افزودن سریال جدید بالا سمت چپ برقرار است.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="series-grid">
          {paginatedSeries.map(series => {
            const seasonsCount = series.seasons.length;
            const episodesCount = series.seasons.reduce((sum, s) => sum + s.episodes.length, 0);
            
            return (
              <div
                key={series.id}
                className="bg-white dark:bg-[#1e293b] rounded-xl border border-gray-150 dark:border-[#1e293b] hover:shadow-lg transition-all flex flex-col justify-between overflow-hidden relative shadow-sm"
                id={`series-card-${series.id}`}
              >
                {/* Visual Cover Header */}
                <div className="flex gap-4 p-4">
                  {/* Poster image thumbnail */}
                  <div className="w-24 h-32 bg-gray-100 rounded-lg overflow-hidden shrink-0 relative shadow group">
                    <img 
                      src={series.poster} 
                      alt={series.titleFa}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    <span className="absolute top-1 right-1 bg-black/60 text-amber-500 font-mono text-[9px] px-1 py-0.5 rounded font-bold">
                      ★ {toPersianNums(series.imdbRating)}
                    </span>
                  </div>

                  {/* Core metadata details */}
                  <div className="min-w-0 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[9px] bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-350 px-1.5 py-0.5 rounded font-bold truncate">
                          {series.category}
                        </span>
                        <span className="text-[9px] bg-sky-50 text-sky-600 dark:bg-sky-950/20 dark:text-sky-400 px-1.5 py-0.5 rounded font-bold truncate">
                          {series.quality}
                        </span>
                      </div>
                      
                      <h3 className="text-xs font-bold text-gray-950 dark:text-gray-100 truncate mt-1.5" title={series.titleFa}>
                        {series.titleFa}
                      </h3>
                      <p className="text-[10px] text-gray-400 font-mono truncate">{series.titleEn}</p>
                    </div>

                    <div className="space-y-1 text-[11px] text-gray-500 mt-1">
                      <p className="truncate">کارگردان: <strong className="text-gray-700 dark:text-gray-300">{series.director || 'نامشخص'}</strong></p>
                      
                      {/* Interactive Seasons and episode counts */}
                      <div className="flex items-center gap-3 text-sky-600 dark:text-sky-400 font-bold">
                        <span>{toPersianNums(seasonsCount)} فصل</span>
                        <span>•</span>
                        <span>{toPersianNums(episodesCount)} قسمت کل</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Requirements: Show the latest added episode in main card */}
                <div className="px-4 py-2 bg-sky-50/50 dark:bg-slate-900 border-t border-b border-gray-100 dark:border-slate-800 flex items-center justify-between text-[11px]" id={`series-latest-ep-${series.id}`}>
                  <span className="text-gray-400">آخرین قسمت:</span>
                  <strong className="text-sky-600 dark:text-sky-400 font-medium truncate max-w-[190px] mr-2">
                    {toPersianNums(getLatestEpisodeInfo(series))}
                  </strong>
                </div>

                {/* Dynamic detailed visual fields & Bottom operating bar */}
                <div className="p-4 bg-gray-50 dark:bg-[#1a2236]/30 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between" id={`series-footer-${series.id}`}>
                  {/* Price info button */}
                  <div>
                    <span className="text-[10px] text-gray-400 block pb-0.5">قیمت کل پکیج</span>
                    <strong className="text-xs font-bold text-emerald-600">{formatCurrency(series.salePrice)}</strong>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    {/* Sell dialog trigger */}
                    <button
                      onClick={(e) => handleOpenSale(series, e)}
                      className="flex items-center gap-1.5 h-8 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md font-bold cursor-pointer"
                      title="ثبت فروش (یا تک فصل)"
                      id={`btn-series-sell-${series.id}`}
                    >
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>فروش</span>
                    </button>

                    {/* Manage Nesting 📋 */}
                    <button
                      onClick={() => {
                        setManagingSeries(series);
                        if (series.seasons && series.seasons.length > 0) {
                          setActiveSeasonId(series.seasons[0].id);
                        } else {
                          setActiveSeasonId(null);
                        }
                      }}
                      className="flex items-center gap-1 h-8 px-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-bold cursor-pointer"
                      title="مدیریت قسمت‌ها و فصول"
                      id={`btn-series-manage-${series.id}`}
                    >
                      <ListOrdered className="w-3.5 h-3.5" />
                      <span>قسمت‌ها</span>
                    </button>

                    {/* Basic CRUD operations icons */}
                    <button
                      onClick={(e) => handleOpenEdit(series, e)}
                      className="p-1.5 text-gray-400 hover:text-indigo-600 border border-gray-200 dark:border-gray-800 rounded-md hover:bg-white dark:hover:bg-slate-800 transition-colors"
                      title="ویرایش سریال"
                      id={`btn-series-edit-${series.id}`}
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteSeries(series.id, e)}
                      className="p-1.5 text-gray-400 hover:text-red-650 border border-gray-200 dark:border-gray-800 rounded-md hover:bg-white dark:hover:bg-slate-800 transition-colors"
                      title="حذف سریال"
                      id={`btn-series-delete-${series.id}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Pagination indicators footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-4" id="series-pagination">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="p-1.5 border border-gray-150 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-40 cursor-pointer"
            id="series-page-prev"
          >
            <ChevronRight className="w-5 h-5 text-gray-500" />
          </button>
          <span className="text-xs font-semibold text-gray-650">
            صفحه {toPersianNums(currentPage)} از {toPersianNums(totalPages)}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-1.5 border border-gray-150 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-40 cursor-pointer"
            id="series-page-next"
          >
            <ChevronLeft className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      )}

      {/* ADD/EDIT SERIES MAIN MODAL */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto" id="series-form-modal">
          <div className="bg-white dark:bg-[#1e293b] w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 animate-scaleIn">
            {/* Header */}
            <div className="px-5 py-4 bg-gray-50 dark:bg-slate-800/80 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-805 dark:text-gray-100">
                {editingSeries ? `ویرایش سریال: ${editingSeries.titleFa}` : 'تعریف سریال یا مجموعه تلویزیونی جدید'}
              </h3>
              <button onClick={() => setShowFormModal(false)} className="text-gray-400 hover:text-gray-600 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveSeries} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto" id="series-catalog-form">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Fa title */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 block">نام فارسی سریال *</label>
                  <input
                    type="text"
                    required
                    value={formTitleFa}
                    onChange={(e) => setFormTitleFa(e.target.value)}
                    className="w-full h-9 px-3 bg-gray-50 dark:bg-slate-800 rounded-lg text-xs border border-gray-200 dark:border-gray-700 text-gray-850 dark:text-gray-200 focus:outline-none focus:border-sky-500"
                    placeholder="مثال: بازی مرکب"
                  />
                </div>

                {/* En title */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 block">نام انگلیسی سریال *</label>
                  <input
                    type="text"
                    required
                    value={formTitleEn}
                    onChange={(e) => setFormTitleEn(e.target.value)}
                    className="w-full h-9 px-3 bg-gray-50 dark:bg-slate-800 rounded-lg text-xs border border-gray-200 dark:border-gray-700 text-gray-850 dark:text-gray-200 focus:outline-none focus:border-sky-500"
                    placeholder="Squid Game"
                  />
                </div>

                {/* Category */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 block">دسته اصلی سریال *</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as MediaCategory)}
                    className="w-full h-9 px-2 bg-gray-50 dark:bg-slate-800 rounded-lg text-xs border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none cursor-pointer"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                {/* Release year */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 block">سال پخش</label>
                  <input
                    type="text"
                    value={formYear}
                    onChange={(e) => setFormYear(e.target.value)}
                    className="w-full h-9 px-3 bg-gray-50 dark:bg-slate-800 rounded-lg text-xs border border-gray-200 dark:border-gray-700 text-gray-850 dark:text-gray-200 focus:outline-none focus:border-sky-500"
                  />
                </div>

                {/* Director */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 block">کارگردان</label>
                  <input
                    type="text"
                    value={formDirector}
                    onChange={(e) => setFormDirector(e.target.value)}
                    className="w-full h-9 px-3 bg-gray-50 dark:bg-slate-800 rounded-lg text-xs border border-gray-200 dark:border-gray-700 text-gray-850"
                  />
                </div>

                {/* Duration of an episode */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 block">مدت میانگین هر قسمت</label>
                  <input
                    type="text"
                    value={formEpisodeDuration}
                    onChange={(e) => setFormEpisodeDuration(e.target.value)}
                    className="w-full h-9 px-3 bg-gray-50 dark:bg-slate-800 rounded-lg text-xs border border-gray-200 dark:border-gray-700 text-gray-850"
                    placeholder="مثال: ۵۰ دقیقه"
                  />
                </div>

                {/* Actors */}
                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] font-bold text-gray-400 block">بازیگران اصلی (تفکیک با ویرگول)</label>
                  <input
                    type="text"
                    value={formActors}
                    onChange={(e) => setFormActors(e.target.value)}
                    className="w-full h-9 px-3 bg-gray-50 dark:bg-slate-800 rounded-lg text-xs border border-gray-200 dark:border-gray-700 text-gray-850"
                    placeholder="لی جونگ جه، پارک هه سو..."
                  />
                </div>

                {/* IMDb score */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 block">امتیاز IMDB</label>
                  <input
                    type="text"
                    value={formImdbRating}
                    onChange={(e) => setFormImdbRating(e.target.value)}
                    className="w-full h-9 px-3 bg-gray-50 dark:bg-slate-800 rounded-lg text-xs border border-gray-200 dark:border-gray-700 text-gray-850"
                  />
                </div>

                {/* Country */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 block">کشور سازنده</label>
                  <select
                    value={formCountry}
                    onChange={(e) => setFormCountry(e.target.value)}
                    className="w-full h-9 px-2 bg-gray-50 dark:bg-slate-800 rounded-lg text-xs border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none cursor-pointer"
                  >
                    <option value="ایران">ایران</option>
                    <option value="آمریکا">آمریکا</option>
                    <option value="کره جنوبی">کره جنوبی</option>
                    <option value="هند">هند</option>
                    <option value="فرانسه">فرانسه</option>
                    <option value="انگلستان">انگلستان</option>
                    <option value="ژاپن">ژاپن</option>
                    <option value="ایتالیا">ایتالیا</option>
                    <option value="متفرقه">متفرقه / سایر</option>
                  </select>
                </div>

                {/* Language */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 block">زبان سریال</label>
                  <select
                    value={formLanguage}
                    onChange={(e) => setFormLanguage(e.target.value)}
                    className="w-full h-9 px-2 bg-gray-50 dark:bg-slate-800 rounded-lg text-xs border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none cursor-pointer"
                  >
                    <option value="دوبله فارسی">دوبله فارسی</option>
                    <option value="زبان اصلی">زبان اصلی</option>
                    <option value="دوزبانه (دوبله و زبان اصلی)">دوزبانه (دوبله و زبان اصلی)</option>
                  </select>
                </div>

                {/* Quality */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 block">کیفیت پیش‌فرض</label>
                  <select
                    value={formQuality}
                    onChange={(e) => setFormQuality(e.target.value)}
                    className="w-full h-9 px-2 bg-gray-50 dark:bg-slate-800 rounded-lg text-xs border border-gray-200 dark:border-gray-700 cursor-pointer"
                  >
                    <option value="1080p Web-DL">1080p Web-DL</option>
                    <option value="1080p BluRay">1080p BluRay</option>
                    <option value="4K UHD">4K UHD</option>
                  </select>
                </div>
              </div>

              {/* Genres Multi-Select */}
              <div className="space-y-1.5 pt-1">
                <label className="text-[10px] font-bold text-gray-400 block">ژانرهای سریال (چند گزینه‌ای)</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2 bg-gray-50 dark:bg-slate-800/50 p-3 rounded-lg border border-gray-200 dark:border-gray-700 h-[115px] overflow-y-auto">
                  {['درام', 'کمدی', 'اکشن', 'علمی تخیلی', 'ترسناک', 'هیجان انگیز', 'مستند', 'خانوادگی', 'جنایی', 'معمایی', 'عاشقانه', 'ماجراجویی', 'انیمیشن'].map((g) => {
                    const isChecked = formGenres.includes(g);
                    return (
                      <label key={g} className="flex items-center gap-1.5 p-1 hover:bg-sky-50 dark:hover:bg-sky-950/20 rounded cursor-pointer select-none text-[10.5px]">
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
                          className="w-3.5 h-3.5 accent-sky-600 text-sky-600 rounded cursor-pointer"
                        />
                        <span className="text-gray-700 dark:text-gray-300 font-medium">{g}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Poster configuration */}
              <div className="space-y-1.5 pt-1">
                <label className="text-[10px] font-bold text-sky-550 dark:text-sky-400 block">پوستر سریال (بارگذاری عکس یا آدرس وب)</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    required
                    value={formPoster}
                    onChange={(e) => setFormPoster(e.target.value)}
                    className="flex-1 h-9 px-3 bg-gray-50 dark:bg-slate-800 rounded-lg text-xs border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-sky-500"
                    placeholder="پیش‌نمایش تصویر..."
                  />
                  <button
                    type="button"
                    onClick={handlePickPoster}
                    className="h-9 px-3 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0"
                    id="btn-pick-poster-series"
                  >
                    انتخاب تصویر...
                  </button>
                </div>
                <p className="text-[9px] text-gray-400">هزینه محاسبه فاکتورها طبق قیمت هر قسمت در بخش تنظیمات به صورت چرخشی محاسبه خواهد شد.</p>
              </div>

              {/* Series folder path directory */}
              <div className="space-y-1.5 pt-1">
                <label className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 block">مسیر پوشه اصلی این سریال روی سیستم *</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formFilePath}
                    onChange={(e) => setFormFilePath(e.target.value)}
                    className="flex-1 h-9 px-3 bg-gray-50 dark:bg-slate-800 rounded-lg text-xs border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-sky-500 font-mono text-left"
                    dir="ltr"
                    placeholder="D:\Media\Series\Shahrzad"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (window.electronAPI) {
                        window.electronAPI.selectDirectory().then((dir) => {
                          if (dir) setFormFilePath(dir);
                        }).catch(err => console.error(err));
                      } else {
                        const input = window.prompt('(شبیه‌ساز آنلاین) مسیر پوشه سریال را وارد کنید:', formFilePath || 'D:\\Media\\Series\\Shahrzad');
                        if (input !== null) {
                          setFormFilePath(input);
                        }
                      }
                    }}
                    className="h-9 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 animate-scaleIn"
                  >
                    جستجو...
                  </button>
                </div>
                <p className="text-[9px] text-gray-400">تمام فصل‌ها و قسمت‌ها بر اساس این پوشه به صورت پیش‌فرض و مرتب نام‌گذاری و آدرس‌دهی می‌شوند.</p>
              </div>

              {/* Summary */}
              <div className="space-y-1 font-sans">
                <label className="text-[10px] font-bold text-gray-400 block">خلاصه داستان مجموعه</label>
                <textarea
                  value={formSummary}
                  onChange={(e) => setFormSummary(e.target.value)}
                  className="w-full h-16 py-2 px-3 bg-gray-50 dark:bg-slate-800 rounded-lg text-xs border border-gray-200 dark:border-gray-700 resize-none"
                />
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-gray-150 dark:border-gray-800 flex justify-end gap-3.5">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-bold cursor-pointer"
                >
                  ثبت اطلاعات سریال
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {managingSeries && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto font-sans" id="series-episode-manager-modal">
          <div className="bg-white dark:bg-[#111827] w-full max-w-5xl rounded-xl shadow-2xl overflow-hidden border border-gray-150 dark:border-gray-800 animate-scaleIn flex flex-col md:flex-row h-[85vh]">
            
            {/* Left Sidebar (Seasons & Batch Generator) */}
            <div className="w-full md:w-1/3 bg-gray-50 dark:bg-[#101726]/40 border-b md:border-b-0 md:border-l border-gray-200 dark:border-gray-800 p-4 flex flex-col justify-between overflow-y-auto" id="seasons-explorer-sidebar">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center gap-2 pb-2.5 border-b border-gray-250 dark:border-gray-800">
                  <Tv className="w-4 h-4 text-sky-500 animate-pulse" />
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xs font-bold text-gray-850 dark:text-gray-150 truncate">مدیریت فصول: {managingSeries.titleFa}</h3>
                    <p className="text-[10px] text-gray-400 mt-0.5 truncate">{managingSeries.titleEn}</p>
                  </div>
                </div>

                {/* Series Main Folder Picker box */}
                <div className="p-2.5 bg-indigo-50/50 dark:bg-slate-900 border border-indigo-100 dark:border-slate-800 rounded-lg space-y-1.5" id="series-sidebar-folder-box">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">مسیر پوشه اصلی سریال:</span>
                    <button
                      type="button"
                      onClick={() => {
                        const triggerSelect = () => {
                          if (window.electronAPI) {
                            window.electronAPI.selectDirectory().then((dir) => {
                              if (dir) {
                                dbService.updateSeries(managingSeries.id, { filePath: dir });
                                const updated = dbService.getSeries().find(s => s.id === managingSeries.id);
                                if (updated) setManagingSeries(updated);
                                refreshData();
                              }
                            }).catch(err => console.error(err));
                          } else {
                            const input = window.prompt('(شبیه‌ساز آنلاین) مسیر پوشه اصلی این سریال را وارد کنید:', managingSeries.filePath || 'D:\\Media\\Series\\Shahrzad');
                            if (input !== null) {
                              dbService.updateSeries(managingSeries.id, { filePath: input });
                              const updated = dbService.getSeries().find(s => s.id === managingSeries.id);
                              if (updated) setManagingSeries(updated);
                              refreshData();
                            }
                          }
                        };
                        triggerSelect();
                      }}
                      className="text-[9px] font-extrabold text-[#38bdf8] bg-sky-600 hover:bg-sky-550 text-white dark:bg-indigo-950/40 dark:hover:bg-indigo-950/60 px-2 py-0.5 rounded cursor-pointer border border-[#38bdf8]/10"
                    >
                      تنظیم دایرکتوری...
                    </button>
                  </div>
                  {managingSeries.filePath ? (
                    <p className="text-[9.5px] text-emerald-600 dark:text-emerald-400 font-mono break-all line-clamp-2 select-all" dir="ltr" title={managingSeries.filePath}>
                      {managingSeries.filePath}
                    </p>
                  ) : (
                    <p className="text-[9.5px] text-amber-600 font-bold italic">
                      پوشه اصلی این سریال هنوز تعریف نشده است!
                    </p>
                  )}
                </div>

                {/* Add Season box */}
                <form onSubmit={handleAddNewSeason} className="space-y-1.5 p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-gray-150 dark:border-slate-800" id="add-season-form">
                  <label className="text-[10px] font-bold text-gray-500 block">افزودن فصل تک با نام دلخواه</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="مانند: فصل اول"
                      value={seasonFormName}
                      onChange={(e) => setSeasonFormName(e.target.value)}
                      className="flex-1 h-8 px-2.5 bg-gray-50 dark:bg-slate-800 rounded-md text-[11px] border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      type="submit"
                      disabled={!seasonFormName.trim()}
                      className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-bold shrink-0 cursor-pointer disabled:opacity-40"
                    >
                      افزودن
                    </button>
                  </div>
                </form>

                {/* Seasons items list inside sidebar */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 block">لیست فصل‌های موجود (کلیک برای مدیریت قسمت‌ها)</label>
                  <div className="space-y-1.5 overflow-y-auto max-h-[30vh]" id="seasons-list">
                    {managingSeries.seasons.length === 0 ? (
                      <p className="text-[10px] text-gray-450 italic text-center py-6 bg-white dark:bg-slate-900 rounded-lg border border-gray-150 dark:border-slate-800">فصلی تعریف نشده است. فصلی بسازید.</p>
                    ) : (
                      managingSeries.seasons.map(season => {
                        const isActive = activeSeasonId === season.id;
                        const isEditingName = editingSeasonId === season.id;
                        return (
                          <div 
                            key={season.id} 
                            onClick={() => {
                              if (!isEditingName) {
                                setActiveSeasonId(season.id);
                              }
                            }}
                            className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-all ${
                              isActive 
                                ? 'bg-indigo-50/70 border-indigo-200 dark:bg-indigo-950/20 dark:border-indigo-900/50' 
                                : 'bg-white dark:bg-slate-900 border-gray-150 dark:border-slate-800 hover:border-gray-300 dark:hover:border-slate-700'
                            }`}
                          >
                            <div className="flex-1 min-w-0">
                              {isEditingName ? (
                                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                  <input
                                    type="text"
                                    value={editingSeasonName}
                                    onChange={(e) => setEditingSeasonName(e.target.value)}
                                    className="h-7 px-1.5 bg-gray-50 dark:bg-slate-950 border border-indigo-200 dark:border-indigo-900 rounded text-xs w-full text-gray-800 dark:text-gray-200 focus:outline-none"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateSeason(season.id)}
                                    className="p-1 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 rounded cursor-pointer"
                                    title="ذخیره"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => { setEditingSeasonId(null); setEditingSeasonName(''); }}
                                    className="p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded cursor-pointer"
                                    title="انصراف"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1.5">
                                  <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-slate-700'}`} />
                                  <span className="text-xs font-bold text-gray-750 dark:text-gray-200 truncate">{season.name}</span>
                                  <span className="text-[9px] bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 px-1 py-0.5 rounded font-normal font-mono shrink-0">
                                    {toPersianNums(season.episodes.length)} قسمت
                                  </span>
                                </div>
                              )}
                            </div>
                            
                            {!isEditingName && (
                              <div className="flex items-center gap-1 shrink-0 mr-2" onClick={(e) => e.stopPropagation()}>
                                <button
                                  type="button"
                                  onClick={() => { setEditingSeasonId(season.id); setEditingSeasonName(season.name); }}
                                  className="p-1 hover:bg-gray-100 dark:hover:bg-slate-800 text-indigo-500 rounded cursor-pointer"
                                  title="ویرایش نام فصل"
                                >
                                  <Edit className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteSeason(season.id)}
                                  className="p-1 hover:bg-red-50 dark:hover:bg-red-955/20 text-red-500 rounded cursor-pointer"
                                  title="حذف فصل"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Batch Generator Box */}
                <div className="bg-gradient-to-br from-sky-50 to-indigo-50 dark:from-slate-900/60 dark:to-indigo-950/20 p-3 rounded-lg border border-sky-100 dark:border-slate-800 text-gray-850 dark:text-gray-150">
                  <div className="flex items-center gap-1.5 pb-2 border-b border-sky-100 dark:border-slate-800 mb-2">
                    <ListOrdered className="w-4 h-4 text-sky-500" />
                    <span className="text-[11px] font-extrabold text-sky-700 dark:text-sky-400">تولید گروهی فصول و قسمت‌ها (سریع)</span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <label className="text-[10px] text-gray-500 dark:text-gray-400">تعداد کل فصل‌ها:</label>
                      <input 
                        type="number"
                        min="1"
                        max="15"
                        value={batchSeasonsCount}
                        onChange={(e) => handleBatchSeasonsCountChange(Number(e.target.value) || 1)}
                        className="w-16 h-7 px-1.5 bg-white dark:bg-slate-950 text-center rounded border border-gray-250 dark:border-slate-700 text-xs font-bold font-mono"
                      />
                    </div>

                    {/* Dynamic Inputs for each Season */}
                    <div className="space-y-1.5 max-h-[14vh] overflow-y-auto pr-0.5 border-t border-dashed border-gray-200 dark:border-slate-800 pt-2">
                      {Array.from({ length: batchSeasonsCount }).map((_, idx) => (
                        <div key={idx} className="flex items-center justify-between text-[10px] gap-2">
                          <span className="text-gray-500 flex items-center gap-1 truncate">
                            <span className="w-4 h-4 rounded-full bg-sky-100 dark:bg-slate-800 text-sky-700 dark:text-sky-400 flex items-center justify-center font-mono text-[9px]">{idx + 1}</span>
                            <span>تعداد قسمت‌های فصل {idx + 1}:</span>
                          </span>
                          <input 
                            type="number"
                            min="1"
                            max="60"
                            value={batchEpisodesForSeason[idx] !== undefined ? batchEpisodesForSeason[idx] : 10}
                            onChange={(e) => {
                              const updatedArr = [...batchEpisodesForSeason];
                              updatedArr[idx] = Number(e.target.value) || 5;
                              setBatchEpisodesForSeason(updatedArr);
                            }}
                            className="w-14 h-6 px-1.5 bg-white dark:bg-slate-950 text-center rounded border border-gray-250 dark:border-slate-700 text-xs font-bold font-mono text-indigo-600 dark:text-indigo-400"
                          />
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={handleGenerateBatch}
                      className="w-full mt-2 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded text-[10px] font-extrabold cursor-pointer transition-colors shadow-sm text-center"
                    >
                      تولید و ثبت کلیه فصول و قسمت‌ها
                    </button>
                  </div>
                </div>
              </div>

              {/* Close Button at bottom of sidebar */}
              <div className="pt-3 border-t border-gray-250 dark:border-gray-800 mt-4">
                <button
                  type="button"
                  onClick={() => setManagingSeries(null)}
                  className="w-full h-8 bg-gray-200 hover:bg-gray-250 dark:bg-slate-800 dark:hover:bg-slate-750 text-gray-700 dark:text-gray-200 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>انصراف و بستن</span>
                </button>
              </div>
            </div>

            {/* Right Column (Episodes details of Active Season) */}
            <div className="flex-1 p-5 overflow-y-auto bg-white dark:bg-[#11181f]">
              <div className="space-y-4">
                {/* Header */}
                  <div className="flex items-center justify-between pb-3.5 border-b border-gray-150 dark:border-slate-800 mb-4 animate-fadeIn">
                    <div className="flex items-center gap-2">
                      <ListOrdered className="w-4 h-4 text-indigo-500 animate-bounce" />
                      <div>
                        <h4 className="text-xs font-extrabold text-gray-800 dark:text-gray-100">
                          {activeSeasonId 
                            ? `لیست قسمت‌های ${managingSeries.seasons.find(s => s.id === activeSeasonId)?.name || 'فصل منتخب'}` 
                            : 'مدیریت قسمت‌ها'}
                        </h4>
                        <p className="text-[10px] text-gray-400 mt-0.5">برای مشاهده قسمت‌ها، یک فصل انتخاب کنید یا ثبت کنید.</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {activeSeasonId && (
                        <button
                          type="button"
                          onClick={() => {
                            setShowAddEpisodeBox(activeSeasonId);
                            setEditingEpisodeId(null);
                            const nextEpNum = (managingSeries.seasons.find(s => s.id === activeSeasonId)?.episodes?.length || 0) + 1;
                            setEpisodeFormNum(nextEpNum);
                            setEpisodeFormName('');
                            const defaultPath = getEpisodeDefaultPath(managingSeries, activeSeasonId, nextEpNum);
                            setEpisodeFormFile(defaultPath);
                            setEpisodeFormDesc('');
                          }}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-bold cursor-pointer transition-all flex items-center gap-1"
                        >
                          <span>+ افزودن قسمت جدید</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Single Episode Add/Edit Form Box */}
                  {activeSeasonId && showAddEpisodeBox === activeSeasonId && (
                    <form onSubmit={(e) => handleAddEpisode(activeSeasonId, e)} className="p-3 bg-indigo-50/40 dark:bg-slate-900 border border-indigo-100 dark:border-slate-800 rounded-lg space-y-2 mb-3.5 animate-fadeIn">
                      <div className="flex items-center justify-between pb-1 border-b border-gray-200 dark:border-slate-800">
                        <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                          <Edit className="w-3.5 h-3.5" />
                          <span>{editingEpisodeId ? 'فرم ویرایش اطلاعات قسمت' : 'فرم افزودن قسمت به فصل انتخابی'}</span>
                        </span>
                        <button 
                          type="button" 
                          onClick={() => {
                            setShowAddEpisodeBox(null);
                            setEditingEpisodeId(null);
                            setEpisodeFormNum(1);
                            setEpisodeFormName('');
                            setEpisodeFormFile('');
                            setEpisodeFormDesc('');
                          }} 
                          className="text-gray-400 hover:text-red-500 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div className="space-y-0.5">
                          <label className="text-[9px] text-gray-455 block">شماره قسمت</label>
                          <input 
                            type="number"
                            required
                            value={episodeFormNum}
                            onChange={(e) => setEpisodeFormNum(Number(e.target.value))}
                            className="w-full h-7 px-2 bg-white dark:bg-slate-950 rounded border border-gray-200 dark:border-slate-800 text-xs text-gray-850 dark:text-gray-100 focus:outline-none"
                          />
                        </div>
                        <div className="space-y-0.5 col-span-2">
                          <label className="text-[9px] text-gray-455 block">نام قسمت / شرح مختصر</label>
                          <input 
                            type="text"
                            required
                            placeholder="مانند: قسمت اول یا نام دلخواه"
                            value={episodeFormName}
                            onChange={(e) => setEpisodeFormName(e.target.value)}
                            className="w-full h-7 px-2 bg-white dark:bg-slate-950 rounded border border-gray-200 dark:border-slate-800 text-xs text-gray-850 dark:text-gray-100 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="space-y-0.5 animate-fadeIn">
                        <label className="text-[9px] text-gray-455 block font-bold">مسیر فایل ویدئویی قسمت</label>
                        <div className="flex gap-1.5">
                          <input 
                            type="text"
                            placeholder="D:\Media\Series\Video.mkv"
                            value={episodeFormFile}
                            onChange={(e) => setEpisodeFormFile(e.target.value)}
                            className="flex-1 h-7 px-2 bg-white dark:bg-slate-950 rounded border border-gray-200 dark:border-slate-800 text-[10px] font-mono focus:outline-none text-gray-850 dark:text-gray-100"
                          />
                          <button
                            type="button"
                            onClick={handlePickEpisodeFilePath}
                            className="px-2 py-0.5 bg-sky-600 hover:bg-sky-500 text-white rounded text-[10px] cursor-pointer font-bold shrink-0"
                          >
                            جستجو...
                          </button>
                        </div>
                      </div>

                      <div className="space-y-0.5">
                        <label className="text-[9px] text-gray-455 block font-bold">توضیحات تکمیلی قسمت (داستان)</label>
                        <input 
                          type="text"
                          placeholder="مانند: در ابتدای این بخش..."
                          value={episodeFormDesc}
                          onChange={(e) => setEpisodeFormDesc(e.target.value)}
                          className="w-full h-7 px-2 bg-white dark:bg-slate-950 rounded border border-gray-200 dark:border-slate-805 text-[10px] text-gray-850 dark:text-gray-100 focus:outline-none"
                        />
                      </div>

                      <div className="flex justify-end pt-1 gap-1.5">
                        <button 
                          type="button" 
                          onClick={() => {
                            setShowAddEpisodeBox(null);
                            setEditingEpisodeId(null);
                            setEpisodeFormNum(1);
                            setEpisodeFormName('');
                            setEpisodeFormFile('');
                            setEpisodeFormDesc('');
                          }}
                          className="px-3 py-1 bg-gray-100 text-gray-605 hover:bg-gray-200 dark:bg-slate-800 dark:text-slate-350 dark:hover:bg-slate-700 rounded text-[10px] cursor-pointer font-bold"
                        >
                          لغو
                        </button>
                        <button type="submit" className="px-4 py-1 bg-indigo-650 hover:bg-indigo-700 text-white rounded text-[10px] font-bold cursor-pointer transition-colors">
                          {editingEpisodeId ? 'ذخیره تغییرات' : 'ثبت قطعی'}
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Active Season Episodes list */}
                  <div className="space-y-2 mt-2">
                    {!activeSeasonId ? (
                      <div className="flex flex-col items-center justify-center text-center py-24 bg-gray-50/50 dark:bg-[#1a2230]/40 rounded-xl border border-gray-150 dark:border-slate-800 p-8 animate-fadeIn">
                        <Tv className="w-10 h-10 text-gray-300 dark:text-gray-700 animate-pulse mb-3" />
                        <p className="text-xs font-extrabold text-gray-700 dark:text-gray-350">هیچ فصلی انتخاب نشده است</p>
                        <p className="text-[10px] text-gray-400 mt-1.5 leading-relaxed max-w-sm">
                          برای شروع مدیریت یا افزودن قسمت‌ها، لطفاً از لیست سمت راست یک فصل را انتخاب کنید یا از دکمه تولید سریع گروهی استفاده کنید.
                        </p>
                      </div>
                    ) : (
                      (() => {
                        const selectedSeason = managingSeries.seasons.find(s => s.id === activeSeasonId);
                        if (!selectedSeason) return null;
                        
                        return selectedSeason.episodes.length === 0 ? (
                          <div className="flex flex-col items-center justify-center text-center py-16 bg-gray-50/40 dark:bg-[#1a2230]/40 rounded-xl border border-gray-150 dark:border-slate-800 p-8 animate-fadeIn">
                            <Check className="w-8 h-8 text-emerald-400 dark:text-emerald-800 mb-2" />
                            <p className="text-xs font-bold text-gray-750 dark:text-gray-300">این فصل هیچ قسمتی ندارد</p>
                            <p className="text-[10px] text-gray-400 mt-1 max-w-xs leading-relaxed">
                              می‌آرایند! با دکمه <strong className="text-indigo-600 dark:text-indigo-400">"+ افزودن قسمت جدید"</strong> در بالا تک قسمت اضافه کنید یا از ابزار تولید گروهی در بخش قبل استفاده فرماييد.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-0.5">
                            {selectedSeason.episodes.map(ep => (
                              <div 
                                key={ep.id}
                                className="flex flex-col sm:flex-row sm:items-center justify-between bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-850 p-2.5 rounded-lg hover:shadow-sm hover:border-indigo-100 dark:hover:border-slate-705 transition-all gap-2"
                              >
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 text-[9px] font-mono font-bold rounded shrink-0">
                                      قسمت {toPersianNums(ep.episodeNumber)}
                                    </span>
                                    <h6 className="text-[11px] font-extrabold text-gray-805 dark:text-gray-155 truncate">{ep.name}</h6>
                                  </div>
                                  
                                  {ep.videoPath && ep.videoPath !== 'D:\\Media\\Series\\Video.mkv' ? (
                                    <p className="text-[9px] text-emerald-600 dark:text-emerald-400 font-mono mt-1 pr-1 truncate" dir="ltr" title={ep.videoPath}>
                                      {ep.videoPath}
                                    </p>
                                  ) : (
                                    <p className="text-[9px] text-amber-500/80 italic mt-1 pr-1">
                                      مسیر اختصاصی تنظیم نشده (استفاده از پوشه اصلی سریال)
                                    </p>
                                  )}

                                  {ep.description && <p className="text-[9.5px] text-gray-450 mt-1 leading-relaxed pr-1">{ep.description}</p>}
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                                  {/* Play Episode ▶️ */}
                                  <button
                                    onClick={() => handlePlayEpisode(ep, managingSeries)}
                                    className="p-1 px-1.5 border border-emerald-150 dark:border-emerald-950 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded flex items-center gap-1 text-[10px] font-bold cursor-pointer transition-colors"
                                    title="پخش با نرم‌افزار پیش‌فرض سیستم"
                                  >
                                    <Play className="w-3 h-3 fill-current" />
                                    <span>پخش</span>
                                  </button>
                                  
                                  {/* Open Folder 📁 */}
                                  <button
                                    onClick={() => handleOpenEpisodeFolder(ep, managingSeries)}
                                    className="p-1 px-1.5 border border-sky-150 dark:border-sky-955 bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/20 dark:hover:bg-sky-950/40 text-sky-600 dark:text-sky-400 rounded flex items-center gap-1 text-[10px] font-bold cursor-pointer transition-colors"
                                    title="باز کردن پوشه حاوی فیلم"
                                  >
                                    <FolderOpen className="w-3 h-3" />
                                    <span>پوشه</span>
                                  </button>

                                  {/* Edit Episode ✏️ */}
                                  <button
                                    onClick={() => {
                                      setEditingEpisodeId(ep.id);
                                      setShowAddEpisodeBox(activeSeasonId);
                                      setEpisodeFormNum(ep.episodeNumber);
                                      setEpisodeFormName(ep.name);
                                      setEpisodeFormFile(ep.videoPath || '');
                                      setEpisodeFormDesc(ep.description || '');
                                    }}
                                    className="p-1 px-1.5 border border-indigo-150 dark:border-indigo-955 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/20 dark:hover:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded flex items-center gap-1 text-[10px] font-bold cursor-pointer transition-colors"
                                    title="ویرایش قسمت"
                                  >
                                    <Edit className="w-3 h-3" />
                                    <span>ویرایش</span>
                                  </button>

                                  {/* Delete action */}
                                  <button
                                    onClick={() => handleDeleteEpisode(activeSeasonId, ep.id)}
                                    className="p-1 hover:bg-red-50 dark:hover:bg-red-955/20 text-red-500 rounded shrink-0 cursor-pointer"
                                    title="حذف قسمت"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      })()
                    )}
                  </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* DETAILED Dynamic Series Sales Modal 💰 */}
      {sellingSeries && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-fadeIn" id="series-selling-modal">
          <div className="bg-white dark:bg-[#1e293b] w-full max-w-md rounded-xl shadow-2xl overflow-hidden animate-scaleIn border border-gray-150 dark:border-gray-800">
            {/* Header */}
            <div className="px-4 py-3.5 bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs text-indigo-600 font-bold dark:text-indigo-400">
                <DollarSign className="w-4 h-4 text-indigo-500 fill-current animate-bounce" />
                <span>ثبت فاکتور فروش برای سریال</span>
              </span>
              <button onClick={() => setSellingSeries(null)} className="text-gray-400 hover:text-gray-600 rounded cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleRegisterSale} className="p-5 space-y-4 text-gray-850 dark:text-gray-150">
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg flex items-center gap-3 border border-gray-200 dark:border-slate-850 font-sans">
                <img src={sellingSeries.poster} alt="" className="w-10 h-14 object-cover rounded shadow-sm" referrerPolicy="no-referrer" />
                <div>
                  <h4 className="text-xs font-bold text-gray-900 dark:text-gray-100">{sellingSeries.titleFa}</h4>
                  <p className="text-[10px] text-gray-400 mt-0.5">{sellingSeries.titleEn} | {toPersianNums(sellingSeries?.seasons?.length || 0)} فصل</p>
                  <p className="text-[10px] text-emerald-600 font-bold mt-1.5">قیمت کل پکیج: {formatCurrency(sellingSeries.salePrice)}</p>
                </div>
              </div>

              {/* Requirement: Sale کامل، تک فصل یا تک قسمت */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 block">نوع فروش سریال *</label>
                <div className="grid grid-cols-3 gap-2" id="series-sale-options">
                  <button
                    type="button"
                    onClick={() => setSaleOption('full')}
                    className={`p-2 rounded-lg text-center font-bold text-[11px] border transition-all cursor-pointer ${
                      saleOption === 'full' 
                        ? 'bg-indigo-600 border-indigo-600 text-white' 
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100 dark:bg-slate-800 dark:border-gray-700 text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    پکیج کامل (کل)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSaleOption('season')}
                    disabled={sellingSeries.seasons.length === 0}
                    className={`p-2 rounded-lg text-center font-bold text-[11px] border transition-all cursor-pointer disabled:opacity-40 ${
                      saleOption === 'season' 
                        ? 'bg-indigo-600 border-indigo-600 text-white' 
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100 dark:bg-slate-800 dark:border-gray-700 text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    تک فصل
                  </button>
                  <button
                    type="button"
                    onClick={() => setSaleOption('episode')}
                    disabled={sellingSeries.seasons.length === 0 || !sellingSeries.seasons.some(s => s.episodes.length > 0)}
                    className={`p-2 rounded-lg text-center font-bold text-[11px] border transition-all cursor-pointer disabled:opacity-40 ${
                      saleOption === 'episode' 
                        ? 'bg-indigo-600 border-indigo-600 text-white' 
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100 dark:bg-slate-800 dark:border-gray-700 text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    تک قسمت
                  </button>
                </div>
              </div>

              {/* Selections based on sale option */}
              {saleOption === 'season' && (
                <div className="space-y-1 animate-fadeIn">
                  <label className="text-[10px] font-bold text-gray-500 block">انتخاب فصل مورد نظر</label>
                  <select
                    value={selectedSaleSeason}
                    onChange={(e) => setSelectedSaleSeason(e.target.value)}
                    className="w-full h-9 px-2 bg-gray-50 dark:bg-slate-800 rounded-lg text-xs border border-gray-200 cursor-pointer text-gray-805 dark:text-gray-200 font-bold font-sans"
                  >
                    {sellingSeries.seasons.map(s => <option key={s.id} value={s.id}>{s.name} ({s.episodes.length} قسمت)</option>)}
                  </select>
                </div>
              )}

              {saleOption === 'episode' && (
                <div className="grid grid-cols-2 gap-2.5 animate-fadeIn">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 block font-bold">انتخاب فصل</label>
                    <select
                      value={selectedSaleSeason}
                      onChange={(e) => {
                        setSelectedSaleSeason(e.target.value);
                        const s = sellingSeries.seasons.find(sea => sea.id === e.target.value);
                        if (s && s.episodes.length > 0) setSelectedSaleEpisode(s.episodes[0].id);
                      }}
                      className="w-full h-9 px-2 bg-gray-50 dark:bg-slate-800 rounded-lg text-xs border border-gray-200 cursor-pointer text-gray-850 dark:text-gray-200 font-bold font-sans"
                    >
                      {sellingSeries.seasons.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 block font-bold">انتخاب قسمت</label>
                    <select
                      value={selectedSaleEpisode}
                      onChange={(e) => setSelectedSaleEpisode(e.target.value)}
                      className="w-full h-9 px-2 bg-gray-50 dark:bg-slate-800 rounded-lg text-xs border border-gray-200 cursor-pointer text-gray-850 dark:text-gray-200 font-bold font-sans"
                    >
                      {(sellingSeries.seasons.find(s => s.id === selectedSaleSeason)?.episodes || []).map(ep => (
                        <option key={ep.id} value={ep.id}>قسمت {ep.episodeNumber}: {ep.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Shopping basket hint */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-gray-550 block">سیستم سبد خرید فعال</span>
                <p className="text-[10.5px] leading-relaxed text-gray-400 dark:text-gray-305 font-sans">
                  این کالا و متعلقات فصلی منتخب آن پس از تایید نهایی مستقیماً در فاکتور بالای صفحه انباشته خواهند شد.
                </p>
              </div>

              {/* Price fields */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 block">مبلغ نهایی معامله (تومان)</label>
                  <input
                    type="number"
                    value={calculatedPrice}
                    onChange={(e) => setCalculatedPrice(Number(e.target.value))}
                    className="w-full h-9 px-3 bg-gray-50 dark:bg-slate-800 rounded-lg text-xs border border-gray-200 dark:border-gray-700 text-gray-950 dark:text-gray-100 font-sans"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 block">تخفیف فاکتور (تومان)</label>
                  <input
                    type="number"
                    value={saleDiscount}
                    onChange={(e) => setSaleDiscount(Number(e.target.value))}
                    className="w-full h-9 px-3 bg-gray-50 dark:bg-slate-800 rounded-lg text-xs border border-gray-200 dark:border-gray-700 text-gray-950 dark:text-gray-100 font-sans"
                  />
                </div>
              </div>

              {/* Estimate calculation block */}
              <div className="pt-2 text-[10px] text-gray-500 space-y-1 border-t border-gray-150 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-slate-900/40 p-2.5 rounded-lg font-sans">
                <span className="flex items-center gap-1"><Info className="w-3.5 h-3.5 text-sky-500 shrink-0" /> محاسبه خودکار بر مبنای فصول و قسمت‌هاست.</span>
                <span className="font-extrabold text-emerald-600 font-mono">{formatCurrency(calculatedPrice - saleDiscount)}</span>
              </div>

              {/* Actions */}
              <div className="pt-2 flex justify-end gap-3 cursor-pointer">
                <button
                  type="button"
                  onClick={() => setSellingSeries(null)}
                  className="px-4 py-2 border border-gray-205 dark:border-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-650 cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 text-white rounded-lg text-xs font-bold cursor-pointer transition-all ${
                    activeCustomer
                      ? 'bg-indigo-650 hover:bg-indigo-700 shadow-sm shadow-indigo-505/20'
                      : 'bg-emerald-600 hover:bg-emerald-700 shadow-sm'
                  }`}
                >
                  {activeCustomer ? 'افزودن به سبد خرید 🛒' : 'ثبت فاکتور سریال'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
