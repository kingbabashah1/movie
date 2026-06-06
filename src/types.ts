/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type MediaCategory = 'ایرانی' | 'خارجی' | 'انیمیشن' | 'کره‌ای' | 'هندی' | 'متفرقه';

export interface Movie {
  id: string;
  category: MediaCategory;
  titleFa: string;
  titleEn: string;
  year: string;
  director: string;
  writer: string;
  actors: string;
  duration: string; // in minutes or text
  country: string;
  language: string;
  imdbRating: string;
  quality: string;
  subtitle: string;
  genres: string[]; // array of strings
  poster: string; // unsplash image url or dataUri
  summary: string;
  filePath: string;
  purchasePrice: number;
  salePrice: number;
  addedAt: string;
}

export interface Episode {
  id: string;
  episodeNumber: number;
  name: string;
  videoPath: string;
  description: string;
}

export interface Season {
  id: string;
  name: string; // e.g. "فصل اول"
  episodes: Episode[];
}

export interface Series {
  id: string;
  category: MediaCategory;
  titleFa: string;
  titleEn: string;
  year: string;
  director: string;
  writer: string;
  actors: string;
  episodeDuration: string;
  country: string;
  language: string;
  imdbRating: string;
  quality: string;
  subtitle: string;
  genres: string[];
  poster: string;
  summary: string;
  filePath?: string; // root folder path of the TV series
  purchasePrice: number; // base series purchase cost
  salePrice: number; // base series complete sale price
  seasons: Season[];
  addedAt: string;
}

export type SalesType = 'movie' | 'series_full' | 'series_season' | 'series_episode';

export interface CartItem {
  id: string; // unique cart item id
  mediaId: string; // reference to movie/series id
  mediaTitle: string; // e.g. "تلقین" or "بازی مرکب"
  mediaType: 'movie' | 'series';
  salesType: SalesType;
  details: string; // e.g. "فیلم سینمایی", "فروش کامل", "فصل ۱", "فصل ۱ - قسمت ۳"
  filePath: string; // primary physical path (for opening folder)
  videoPaths: string[]; // list of all associated physical files
  purchasePrice: number; // item's backend base purchase price
  salePrice: number; // customizable sale price
}

export interface Sale {
  id: string;
  date: string; // ISO timestamp
  customerName: string;
  mediaId: string; // movie or series id
  mediaTitle: string; // title of original media
  mediaType: 'movie' | 'series';
  salesType: SalesType;
  details: string; // e.g. "فروش کامل", "فصل ۲", "فصل ۱ - قسمت ۵"
  purchasePrice: number; // logged at point-of-sale for profit calculation
  salePrice: number; // actual amount sold for
  discount: number; // discount amount in Tomans
  items?: CartItem[]; // list of items in case of multi-item checkout
}

export interface DefaultPaths {
  movies: string;
  series: string;
  backups: string;
  music?: string;
}

export interface Song {
  id: string;
  titleFa: string;
  titleEn?: string;
  artist: string;
  duration: number; // in seconds, e.g. 210
  quality: string; // e.g. "320kbps", "128kbps"
  filePath: string;
  tags: string[]; // e.g. ["شاد", "ماشین", "پاپ"]
  addedAt: string;
}

export interface MusicPlaylist {
  id: string;
  name: string; // e.g. "شاد"
  description?: string;
  color?: string; // category tag badge colors for gorgeous presentation
}

export interface AppSettings {
  theme: 'light' | 'dark';
  defaultPaths: DefaultPaths;
  pageSize: 20 | 50 | 100;
  defaultMoviePrice: number; // Single fixed sale price per movie copy (e.g., 2000 Tomans)
  defaultSeriesPrice: number; // Single fixed sale price per series episode (e.g., 1500 Tomans)
  shopName?: string;
  shopAddress?: string;
  shopPhone?: string;
  shopPhoneSecondary?: string;
}

declare global {
  interface Window {
    electronAPI?: {
      minimizeWindow: () => Promise<boolean>;
      maximizeWindow: () => Promise<boolean>;
      closeWindow: () => Promise<boolean>;
      openFileInExplorer: (filepath: string) => Promise<{ success: boolean; error?: string }>;
      playVideoFile: (filepath: string) => Promise<{ success: boolean; error?: string }>;
      openFolderDirectory: (dirpath: string) => Promise<{ success: boolean; error?: string }>;
      selectFile: (filters?: { name: string; extensions: string[] }[]) => Promise<string | null>;
      selectPoster: () => Promise<string | null>;
      selectDirectory: () => Promise<string | null>;
    };
  }
}
