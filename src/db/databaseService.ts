/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Movie, Series, Sale, AppSettings, MediaCategory, Season, Episode, Song, MusicPlaylist } from '../types';

const STORAGE_KEYS = {
  MOVIES: 'mediacenter_movies',
  SERIES: 'mediacenter_series',
  SALES: 'mediacenter_sales',
  SETTINGS: 'mediacenter_settings',
  SONGS: 'mediacenter_songs',
  PLAYLISTS: 'mediacenter_playlists',
  INITIALIZED: 'mediacenter_initialized_v2' // upgrade initializer key to trigger reseeding songs
};

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  defaultPaths: {
    movies: 'D:\\Media\\Movies',
    series: 'D:\\Media\\Series',
    backups: 'D:\\Media\\Backups',
    music: 'D:\\Media\\Music'
  },
  pageSize: 20,
  defaultMoviePrice: 2000,
  defaultSeriesPrice: 1500,
  shopName: 'مدیا سنتر',
  shopAddress: 'تهران، مجتمع تجاری پایتخت، طبقه همکف، واحد ۱۲',
  shopPhone: '۰۲۱-۸۸۸۸۸۸۸۸',
  shopPhoneSecondary: '۰۹۱۲-۳۴۵۶۷۸۹'
};

// High-quality poster URLs from Unsplash representing the genres eloquently
const POSTERS = {
  separation: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&q=80&w=600', // Cinema/Acting
  metri: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?auto=format&fit=crop&q=80&w=600', // Police/Action
  inception: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=600', // Dreamy cinema
  darkKnight: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&q=80&w=600', // Dark texture
  insideOut: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=600', // Colorful anime
  squidGame: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=600', // Game/Korea neon
  breakingBad: 'https://images.unsplash.com/photo-1585647347483-22b66260dfff?auto=format&fit=crop&q=80&w=600', // Desert/Chemistry
  shahrzad: 'https://images.unsplash.com/photo-1464746133101-a2c3f88e0dd9?auto=format&fit=crop&q=80&w=600', // Vintage Love
  genericMovie: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=600', // Cinema
  genericSeries: 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?auto=format&fit=crop&q=80&w=600' // Living room TV
};

// Initial Seed Data
const SEED_PLAYLISTS: MusicPlaylist[] = [
  { id: 'p1', name: 'شاد', description: 'آهنگ‌های شاد، ریتمیک و مناسب مجالس و تالارها', color: 'emerald' },
  { id: 'p2', name: 'غمگین', description: 'آهنگ‌های ملایم، احساسی و بارانی ملو', color: 'indigo' },
  { id: 'p3', name: 'پاپ', description: 'جدیدترین آثار موسیقی پاپ ایران', color: 'sky' },
  { id: 'p4', name: 'ماشین', description: 'کوبنده و بیس‌دار، مناسب جاده و سیستم خودرو', color: 'amber' },
  { id: 'p5', name: 'نوستالژیک', description: 'خاطره‌انگیز و قدیمی دهه ۷۰ و ۸۰ شمسی', color: 'rose' },
  { id: 'p6', name: 'سنتی', description: 'آثار اصیل و سنتی ایرانی با آواز دلنشین', color: 'orange' }
];

const SEED_SONGS: Song[] = [
  {
    id: 'so1',
    titleFa: 'بارون اسیدی',
    titleEn: 'Acid Rain',
    artist: 'سیروان خسروی',
    duration: 210,
    quality: '320kbps',
    filePath: 'D:\\Media\\Music\\Sirvan Khosravi - Baroone Asidi.mp3',
    tags: ['شاد', 'پاپ', 'ماشین'],
    addedAt: '2026-05-10T12:00:00Z'
  },
  {
    id: 'so2',
    titleFa: 'دانه دانه',
    titleEn: 'Daneh Daneh',
    artist: 'محسن یگانه',
    duration: 204,
    quality: '320kbps',
    filePath: 'D:\\Media\\Music\\Mohsen Yeganeh - Daneh Daneh.mp3',
    tags: ['شاد', 'پاپ', 'ماشین'],
    addedAt: '2026-05-12T14:00:00Z'
  },
  {
    id: 'so3',
    titleFa: 'هم‌گناه',
    titleEn: 'Hamgonah',
    artist: 'علیرضا قربانی',
    duration: 305,
    quality: '320kbps',
    filePath: 'D:\\Media\\Music\\Alireza Ghorbani - Hamgonah.mp3',
    tags: ['غمگین', 'سنتی'],
    addedAt: '2026-05-14T16:20:00Z'
  },
  {
    id: 'so4',
    titleFa: 'یار دبستانی من',
    titleEn: 'Yare Dabestanie Man',
    artist: 'جمشید جم',
    duration: 240,
    quality: '128kbps',
    filePath: 'D:\\Media\\Music\\Jamshid Jam - Yare Dabestani.mp3',
    tags: ['نوستالژیک'],
    addedAt: '2026-05-16T18:00:00Z'
  },
  {
    id: 'so5',
    titleFa: 'گل عشق',
    titleEn: 'Gole Eshgh',
    artist: 'رضا بهرام',
    duration: 195,
    quality: '320kbps',
    filePath: 'D:\\Media\\Music\\Reza Bahram - Gole Eshgh.mp3',
    tags: ['شاد', 'پاپ'],
    addedAt: '2026-05-18T20:30:00Z'
  },
  {
    id: 'so6',
    titleFa: 'حالم عوض میشه',
    titleEn: 'Halam Avaz Mishe',
    artist: 'شادمهر عقیلی',
    duration: 220,
    quality: '320kbps',
    filePath: 'D:\\Media\\Music\\Shadmehr Aghili - Halam Avaz Mishe.mp3',
    tags: ['پاپ', 'غمگین', 'ماشین'],
    addedAt: '2026-05-20T22:15:00Z'
  },
  {
    id: 'so7',
    titleFa: 'چرا رفتی',
    titleEn: 'Chera Rafti',
    artist: 'همایون شجریان',
    duration: 310,
    quality: '320kbps',
    filePath: 'D:\\Media\\Music\\Homayoun Shajarian - Chera Rafti.mp3',
    tags: ['غمگین', 'سنتی'],
    addedAt: '2026-05-22T23:45:00Z'
  }
];

const SEED_MOVIES: Movie[] = [
  {
    id: 'm1',
    category: 'ایرانی',
    titleFa: 'جدایی نادر از سیمین',
    titleEn: 'A Separation',
    year: '۱۳۸۹',
    director: 'اصغر فرهادی',
    writer: 'اصغر فرهادی',
    actors: 'پیمان معادی، لیلا حاتمی، شهاب حسینی، ساره بیات',
    duration: '۱۲۳ دقیقه',
    country: 'ایران',
    language: 'فارسی',
    imdbRating: '۸.۳',
    quality: '1080p Web-DL',
    subtitle: 'انگلیسی (چسبیده)',
    genres: ['درام', 'خانوادگی', 'اجتماعی'],
    poster: POSTERS.separation,
    summary: 'نادر و سیمین می‌خواهند از هم جدا شوند، سیمین تمایل دارد به همراه دخترش ترمه از کشور خارج شود اما نادر به علت بیماری پدرش که سوءهاضمه و آلزایمر دارد نمی‌تواند او را تنها بگذارد...',
    filePath: 'D:\\Media\\Movies\\Iranian\\A.Separation.1080p.mkv',
    purchasePrice: 15000,
    salePrice: 35000,
    addedAt: '2026-05-10T12:00:00Z'
  },
  {
    id: 'm2',
    category: 'ایرانی',
    titleFa: 'متری شیش و نیم',
    titleEn: 'Just 6.5',
    year: '۱۳۹۷',
    director: 'سعید روستایی',
    writer: 'سعید روستایی',
    actors: 'پیمان معادی، نوید محمدزاده، پریناز ایزدیار، فرهاد اصلانی',
    duration: '۱۳۵ دقیقه',
    country: 'ایران',
    language: 'فارسی',
    imdbRating: '۷.۹',
    quality: '4K Bluray',
    subtitle: 'بدون زیرنویس',
    genres: ['جنایی', 'درام', 'اکشن'],
    poster: POSTERS.metri,
    summary: 'چند تن از مأموران پلیس مبارزه با مواد مخدر به سردستگی صمد به دنبال فروشنده بزرگ شیشه در تهران به نام ناصر خاکزاد هستند که کل شهر را آلوده کرده است...',
    filePath: 'D:\\Media\\Movies\\Iranian\\Metri.Shish.O.Nim.4K.mkv',
    purchasePrice: 20000,
    salePrice: 45000,
    addedAt: '2026-05-15T15:30:00Z'
  },
  {
    id: 'm3',
    category: 'خارجی',
    titleFa: 'تلقین',
    titleEn: 'Inception',
    year: '۲۰۱۰',
    director: 'کریستوفر نولان',
    writer: 'کریستوفر نولان',
    actors: 'لئوناردو دی‌کاپریو، جوزف گوردون لویت، الیوت پیج، تام هاردی',
    duration: '۱۴۸ دقیقه',
    country: 'آمریکا',
    language: 'انگلیسی',
    imdbRating: '۸.۸',
    quality: '1080p BluRay',
    subtitle: 'فارسی (چسبیده)',
    genres: ['علمی تخیلی', 'اکشن', 'هیجان انگیز'],
    poster: POSTERS.inception,
    summary: 'دام کاب یک دزد ماهر در استخراج اسرار ارزشمند درون ناخودآگاه افراد در طول رویا دیدن است. توانایی خارق‌العاده کاب او را به مهره‌ای کلیدی در دنیای جاسوسی شرکتی تبدیل کرده است، اما...',
    filePath: 'D:\\Media\\Movies\\Foreign\\Inception.2010.1080p.mkv',
    purchasePrice: 12000,
    salePrice: 25000,
    addedAt: '2026-05-18T09:12:00Z'
  },
  {
    id: 'm4',
    category: 'انیمیشن',
    titleFa: 'درون و بیرون ۲',
    titleEn: 'Inside Out 2',
    year: '۲۰۲۴',
    director: 'کلسی مان',
    writer: 'مگ لوفاو',
    actors: 'ایمی پولر، فیلیس اسمیت، لوئیس بلک، تونی هیل، مایا هاک',
    duration: '۹۶ دقیقه',
    country: 'آمریکا',
    language: 'انگلیسی / دوبله سورن',
    imdbRating: '۷.۷',
    quality: '1080p Web-DL',
    subtitle: 'دوبله فارسی حرفه‌ای',
    genres: ['انیمیشن', 'خانوادگی', 'کمدی', 'ماجراجویی'],
    poster: POSTERS.insideOut,
    summary: 'رایلی اکنون یک نوجوان شده و ذهن او تحت بازسازی قرار می‌گیرد تا برای احساسات جدید و ناگهانی مانند اضطراب، حسادت، شرم و بی‌حوصلگی جا باز کند که احساسات قدیمی را غافلگیر می‌کتد...',
    filePath: 'D:\\Media\\Movies\\Animation\\Inside.Out.2.2024.1080p.Dual.mkv',
    purchasePrice: 10000,
    salePrice: 30000,
    addedAt: '2026-05-25T11:45:00Z'
  },
  {
    id: 'm5',
    category: 'کره‌ای',
    titleFa: 'انگل',
    titleEn: 'Parasite',
    year: '۲۰۱۹',
    director: 'بونگ جون-هو',
    writer: 'بونگ جون-هو',
    actors: 'سونگ کانگ-هو، لی سون-کیون، چو یو جئونگ، چوی وو-شیک',
    duration: '۱۳۲ دقیقه',
    country: 'کره جنوبی',
    language: 'کره‌ای',
    imdbRating: '۸.۵',
    quality: '1080p BluRay',
    subtitle: 'فارسی (چسبیده)',
    genres: ['درام', 'هیجان انگیز', 'کمدی سیاه'],
    poster: POSTERS.darkKnight, // substituting with nice dark
    summary: 'تمام اعضای خانواده بی‌کار کی‌تاک با ترفندهای حیله‌گرانه راهی برای استخدام در خانه خانواده بسیار ثروتمند پارک پیدا می‌کنند، اما بروز اتفاقی غیرمنتظره زندگی آن‌ها را تحت تاثیر قرار می‌دهد...',
    filePath: 'D:\\Media\\Movies\\Korean\\Parasite.2019.1080p.mkv',
    purchasePrice: 15000,
    salePrice: 35000,
    addedAt: '2026-06-01T14:20:00Z'
  }
];

const SEED_SERIES: Series[] = [
  {
    id: 's1',
    category: 'کره‌ای',
    titleFa: 'بازی مرکب',
    titleEn: 'Squid Game',
    year: '۲۰۲۱',
    director: 'هوانگ دونگ-هیوک',
    writer: 'هوانگ دونگ-هیوک',
    actors: 'لی جونگ-جه، پارک هه-سو، وی ها-جون، جونگ هو-یون',
    episodeDuration: '۵۵ دقیقه',
    country: 'کره جنوبی',
    language: 'کره‌ای / دوبله',
    imdbRating: '۸.۰',
    quality: '1080p Web-DL',
    subtitle: 'فارسی (چسبیده)',
    genres: ['درام', 'هیجان انگیز', 'اکشن'],
    poster: POSTERS.squidGame,
    summary: 'صدها بازیکن که مشکلات مالی شدیدی دارند، دعوت عجیب برای رقابت در بازی‌های کودکان را می‌پذیرند. در آنجا، یک جایزه وسوسه‌انگیز ۴۵ میلیون دلاری همراه با خطرات مرگبار در کمین آن‌هاست...',
    purchasePrice: 40000,
    salePrice: 90000,
    addedAt: '2026-05-01T10:00:00Z',
    seasons: [
      {
        id: 's1_se1',
        name: 'فصل اول',
        episodes: [
          { id: 's1_e1', episodeNumber: 1, name: 'چراغ قرمز، چراغ سبز', videoPath: 'D:\\Media\\Series\\SquidGame\\S01E01.mkv', description: 'گی‌هون که درمانده و غرق در بدهی است، کارهایی خطرناک انجام می‌دهد تا سریع پول به دست آورد...' },
          { id: 's1_e2', episodeNumber: 2, name: 'جهنم', videoPath: 'D:\\Media\\Series\\SquidGame\\S01E02.mkv', description: 'پس از رای دسته جمعی به لغو بازی، بازیکنان به دنیای تکراری و بی‌رحم خود باز می‌گردند...' },
          { id: 's1_e3', episodeNumber: 3, name: 'مردی با چتر', videoPath: 'D:\\Media\\Series\\SquidGame\\S01E03.mkv', description: 'چندین بازیکن با تشکیل اتحادهایی، برای چالش دوم شکرپزی آماده می‌شوند که نتایجی شیرین اما خونین دارد...' }
        ]
      }
    ]
  },
  {
    id: 's2',
    category: 'خارجی',
    titleFa: 'قانون‌شکنان (افسارگسیخته)',
    titleEn: 'Breaking Bad',
    year: '۲۰۰۸',
    director: 'وینس گیلیگان',
    writer: 'وینس گیلیگان',
    actors: 'برایان کرانستون، آرون پال، آنا گان، دین نوریس، باب ادنکرک',
    episodeDuration: '۴۷ دقیقه',
    country: 'آمریکا',
    language: 'انگلیسی',
    imdbRating: '۹.۵',
    quality: '1080p BluRay',
    subtitle: 'فارسی (چسبیده)',
    genres: ['جنایی', 'درام', 'هیجان انگیز'],
    poster: POSTERS.breakingBad,
    summary: 'والتر وایت، یک معلم شیمی دبیرستان متوجه می‌شود که به سرطان ریه پیشرفته مبتلا است. او تصمیم می‌گیرد برای تأمین مالی خانواده‌اش پس از مرگ خود، به کمک یکی از دانش‌آموزان قدیمی‌اش به تولید شیشه بپردازد...',
    purchasePrice: 60000,
    salePrice: 150000,
    addedAt: '2026-05-05T08:30:00Z',
    seasons: [
      {
        id: 's2_se1',
        name: 'فصل اول',
        episodes: [
          { id: 's2_e1', episodeNumber: 1, name: 'پایلوت (معرفی)', videoPath: 'D:\\Media\\Series\\BreakingBad\\S01E01.mkv', description: 'والتر وایت معلم فداکار شیمی، در پنجاهمین سالگرد تولدش خبر تلخ ابتلایش به سرطان ریه را دریافت می‌کند...' },
          { id: 's2_e2', episodeNumber: 2, name: 'گربه در کیسه است...', videoPath: 'D:\\Media\\Series\\BreakingBad\\S01E02.mkv', description: 'والت و جسی تلاش می‌کنند جسد یک قاچاقچی را پس از درگیری خونین اول از بین ببرند اما...' }
        ]
      }
    ]
  },
  {
    id: 's3',
    category: 'ایرانی',
    titleFa: 'شهرزاد',
    titleEn: 'Shahrzad',
    year: '۱۳۹۴',
    director: 'حسن فتحی',
    writer: 'نغمه ثمینی، حسن فتحی',
    actors: 'ترانه علیدوستی، شهاب حسینی، مصطفی زمانی، علی نصیریان، پریناز ایزدیار',
    episodeDuration: '۶۰ دقیقه',
    country: 'ایران',
    language: 'فارسی',
    imdbRating: '۸.۱',
    quality: '1080p Web-DL',
    subtitle: 'بدون زیرنویس',
    genres: ['عاشقانه', 'درام', 'تاریخی'],
    poster: POSTERS.shahrzad,
    summary: 'روایتی عاشقانه در بستر حوادث پرآشوب اواسط دهه ۱۳۳۰ خورشیدی در تهران که با کودتای ۲۸ مرداد گره می‌خورد. شهرزاد دانشجوی پزشکی و قباد، به دستور بزرگ آقا مجبور به پیوند خانوادگی می‌شوند...',
    purchasePrice: 50000,
    salePrice: 120000,
    addedAt: '2026-05-12T11:00:00Z',
    seasons: [
      {
        id: 's3_se1',
        name: 'فصل اول',
        episodes: [
          { id: 's3_e1', episodeNumber: 1, name: 'قسمت اول', videoPath: 'D:\\Media\\Series\\Shahrzad\\S01E01.mkv', description: 'شهرزاد و فرهاد دو دلداده عاشق درصدد ازدواج هستند، در حالی که بزرگ آقا حاکم مطلق پایتخت خواب دیگری دیده...' }
        ]
      }
    ]
  }
];

// Seed sales to populate charts with historical representation (over different months)
// Let's seed for 2026-04, 2026-05, and 2026-06 (current month is June 2026 according to system metadata: 2026-06-05)
const SEED_SALES: Sale[] = [
  {
    id: 'sa1',
    date: '2026-04-12T10:30:00Z',
    customerName: 'علی رضایی',
    mediaId: 'm1',
    mediaTitle: 'جدایی نادر از سیمین',
    mediaType: 'movie',
    salesType: 'movie',
    details: 'فروش مستقیم فیلم',
    purchasePrice: 15000,
    salePrice: 35000,
    discount: 5000
  },
  {
    id: 'sa2',
    date: '2026-04-20T17:45:00Z',
    customerName: 'فاطمه احمدی',
    mediaId: 's1',
    mediaTitle: 'بازی مرکب',
    mediaType: 'series',
    salesType: 'series_full',
    details: 'فروش کامل سریال (فصل ۱)',
    purchasePrice: 40000,
    salePrice: 90000,
    discount: 10000
  },
  {
    id: 'sa3',
    date: '2026-05-02T13:10:00Z',
    customerName: 'حسین کریمی',
    mediaId: 'm2',
    mediaTitle: 'متری شیش و نیم',
    mediaType: 'movie',
    salesType: 'movie',
    details: 'فروش مستقیم فیلم',
    purchasePrice: 20000,
    salePrice: 45000,
    discount: 0
  },
  {
    id: 'sa4',
    date: '2026-05-14T19:20:00Z',
    customerName: 'مریم ساداتی',
    mediaId: 's2',
    mediaTitle: 'قانون‌شکنان (افسارگسیخته)',
    mediaType: 'series',
    salesType: 'series_full',
    details: 'فروش کامل سریال (فصل ۱)',
    purchasePrice: 60000,
    salePrice: 150000,
    discount: 15000
  },
  {
    id: 'sa5',
    date: '2026-05-28T11:15:00Z',
    customerName: 'امیر قاسمی',
    mediaId: 'm3',
    mediaTitle: 'تلقین',
    mediaType: 'movie',
    salesType: 'movie',
    details: 'فروش مستقیم فیلم',
    purchasePrice: 12000,
    salePrice: 25000,
    discount: 0
  },
  {
    id: 'sa6',
    date: '2026-06-02T15:00:00Z',
    customerName: 'نازنین طاهری',
    mediaId: 's3',
    mediaTitle: 'شهرزاد',
    mediaType: 'series',
    salesType: 'series_full',
    details: 'فروش کامل سریال (فصل ۱)',
    purchasePrice: 50000,
    salePrice: 120000,
    discount: 20000
  },
  {
    id: 'sa7',
    date: '2026-06-04T09:30:00Z',
    customerName: 'عرفان عباسی',
    mediaId: 'm4',
    mediaTitle: 'درون و بیرون ۲',
    mediaType: 'movie',
    salesType: 'movie',
    details: 'فروش مستقیم فیلم',
    purchasePrice: 10000,
    salePrice: 30000,
    discount: 2000
  },
  {
    id: 'sa8',
    date: '2026-06-05T08:15:00Z', // Today (June 5, 2026)
    customerName: 'زهرا موسوی',
    mediaId: 'm1',
    mediaTitle: 'جدایی نادر از سیمین',
    mediaType: 'movie',
    salesType: 'movie',
    details: 'فروش مستقیم فیلم',
    purchasePrice: 15000,
    salePrice: 35000,
    discount: 0
  }
];

class DatabaseService {
  constructor() {
    this.init();
  }

  private init() {
    try {
      const initialized = localStorage.getItem(STORAGE_KEYS.INITIALIZED);
      if (!initialized) {
        localStorage.setItem(STORAGE_KEYS.MOVIES, JSON.stringify(SEED_MOVIES));
        localStorage.setItem(STORAGE_KEYS.SERIES, JSON.stringify(SEED_SERIES));
        localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(SEED_SALES));
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
        localStorage.setItem(STORAGE_KEYS.SONGS, JSON.stringify(SEED_SONGS));
        localStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(SEED_PLAYLISTS));
        localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
      } else {
        // Self-repair check for users upgrading from v1
        if (!localStorage.getItem(STORAGE_KEYS.SONGS)) {
          localStorage.setItem(STORAGE_KEYS.SONGS, JSON.stringify(SEED_SONGS));
        }
        if (!localStorage.getItem(STORAGE_KEYS.PLAYLISTS)) {
          localStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(SEED_PLAYLISTS));
        }
      }
    } catch (e) {
      console.error('Failed to initialize local persistence database:', e);
    }
  }

  // General terminal Logger helper for UI to play up the "Electron + Database Integration" feel
  private logDBAction(type: 'SQLITE' | 'INDEXEDDB' | 'SYSTEM', query: string) {
    try {
      const logs = JSON.parse(localStorage.getItem('mediacenter_db_logs') || '[]');
      const timestamp = new Date().toLocaleTimeString('fa-IR');
      logs.unshift({ id: Math.random().toString(), timestamp, type, query });
      localStorage.setItem('mediacenter_db_logs', JSON.stringify(logs.slice(0, 100)));
    } catch {
      // Ignored
    }
  }

  getLogs() {
    try {
      return JSON.parse(localStorage.getItem('mediacenter_db_logs') || '[]');
    } catch {
      return [];
    }
  }

  clearLogs() {
    localStorage.removeItem('mediacenter_db_logs');
  }

  // MOVIES CRUD (simulates IndexedDB operation)
  getMovies(): Movie[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MOVIES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  saveMovies(movies: Movie[]) {
    localStorage.setItem(STORAGE_KEYS.MOVIES, JSON.stringify(movies));
  }

  addMovie(movie: Omit<Movie, 'id' | 'addedAt'>): Movie {
    const movies = this.getMovies();
    const newMovie: Movie = {
      ...movie,
      id: 'm_' + Math.random().toString(36).substr(2, 9),
      addedAt: new Date().toISOString()
    };
    movies.unshift(newMovie);
    this.saveMovies(movies);
    this.logDBAction('INDEXEDDB', `INSERT INTO Movies (title, category) VALUES ('${newMovie.titleFa}', '${newMovie.category}')`);
    return newMovie;
  }

  updateMovie(id: string, updatedData: Partial<Movie>): Movie | null {
    const movies = this.getMovies();
    const idx = movies.findIndex(m => m.id === id);
    if (idx === -1) return null;

    movies[idx] = { ...movies[idx], ...updatedData };
    this.saveMovies(movies);
    this.logDBAction('INDEXEDDB', `UPDATE Movies SET titleFa='${movies[idx].titleFa}' WHERE id='${id}'`);
    return movies[idx];
  }

  deleteMovie(id: string): boolean {
    let movies = this.getMovies();
    const initialLen = movies.length;
    movies = movies.filter(m => m.id !== id);
    if (movies.length === initialLen) return false;

    this.saveMovies(movies);
    this.logDBAction('INDEXEDDB', `DELETE FROM Movies WHERE id='${id}'`);
    return true;
  }

  // SERIES CRUD (simulates IndexedDB store)
  getSeries(): Series[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SERIES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  saveSeries(series: Series[]) {
    localStorage.setItem(STORAGE_KEYS.SERIES, JSON.stringify(series));
  }

  addSeries(seriesItem: Omit<Series, 'id' | 'addedAt' | 'seasons'>): Series {
    const series = this.getSeries();
    const newSeries: Series = {
      ...seriesItem,
      id: 's_' + Math.random().toString(36).substr(2, 9),
      seasons: [],
      addedAt: new Date().toISOString()
    };
    series.unshift(newSeries);
    this.saveSeries(series);
    this.logDBAction('INDEXEDDB', `INSERT INTO Series (title, category) VALUES ('${newSeries.titleFa}', '${newSeries.category}')`);
    return newSeries;
  }

  updateSeries(id: string, updatedData: Partial<Series>): Series | null {
    const series = this.getSeries();
    const idx = series.findIndex(s => s.id === id);
    if (idx === -1) return null;

    series[idx] = { ...series[idx], ...updatedData };
    this.saveSeries(series);
    this.logDBAction('INDEXEDDB', `UPDATE Series SET titleFa='${series[idx].titleFa}' WHERE id='${id}'`);
    return series[idx];
  }

  deleteSeries(id: string): boolean {
    let series = this.getSeries();
    const initialLen = series.length;
    series = series.filter(s => s.id !== id);
    if (series.length === initialLen) return false;

    this.saveSeries(series);
    this.logDBAction('INDEXEDDB', `DELETE FROM Series WHERE id='${id}'`);
    return true;
  }

  // Series nested Seasons/Episodes CRUD
  addSeason(seriesId: string, name: string): Season | null {
    const series = this.getSeries();
    const idx = series.findIndex(s => s.id === seriesId);
    if (idx === -1) return null;

    const newSeason: Season = {
      id: 'se_' + Math.random().toString(36).substr(2, 9),
      name,
      episodes: []
    };

    series[idx].seasons.push(newSeason);
    this.saveSeries(series);
    this.logDBAction('INDEXEDDB', `ADD SEASON '${name}' TO SERIES ID '${seriesId}'`);
    return newSeason;
  }

  updateSeason(seriesId: string, seasonId: string, name: string): boolean {
    const series = this.getSeries();
    const sIdx = series.findIndex(s => s.id === seriesId);
    if (sIdx === -1) return false;

    const seIdx = series[sIdx].seasons.findIndex(se => se.id === seasonId);
    if (seIdx === -1) return false;

    series[sIdx].seasons[seIdx].name = name;
    this.saveSeries(series);
    this.logDBAction('INDEXEDDB', `UPDATE SEASON '${name}' IN SERIES ID '${seriesId}'`);
    return true;
  }

  deleteSeason(seriesId: string, seasonId: string): boolean {
    const series = this.getSeries();
    const sIdx = series.findIndex(s => s.id === seriesId);
    if (sIdx === -1) return false;

    series[sIdx].seasons = series[sIdx].seasons.filter(se => se.id !== seasonId);
    this.saveSeries(series);
    this.logDBAction('INDEXEDDB', `DELETE SEASON '${seasonId}' FROM SERIES ID '${seriesId}'`);
    return true;
  }

  addEpisode(seriesId: string, seasonId: string, episode: Omit<Episode, 'id'>): Episode | null {
    const series = this.getSeries();
    const sIdx = series.findIndex(s => s.id === seriesId);
    if (sIdx === -1) return null;

    const seIdx = series[sIdx].seasons.findIndex(se => se.id === seasonId);
    if (seIdx === -1) return null;

    const newEpisode: Episode = {
      ...episode,
      id: 'ep_' + Math.random().toString(36).substr(2, 9)
    };

    series[sIdx].seasons[seIdx].episodes.push(newEpisode);
    this.saveSeries(series);
    this.logDBAction('INDEXEDDB', `ADD EPISODE '${episode.name}' TO SEASON '${series[sIdx].seasons[seIdx].name}'`);
    return newEpisode;
  }

  updateEpisode(seriesId: string, seasonId: string, episodeId: string, updatedData: Partial<Episode>): boolean {
    const series = this.getSeries();
    const sIdx = series.findIndex(s => s.id === seriesId);
    if (sIdx === -1) return false;

    const seIdx = series[sIdx].seasons.findIndex(se => se.id === seasonId);
    if (seIdx === -1) return false;

    const epIdx = series[sIdx].seasons[seIdx].episodes.findIndex(ep => ep.id === episodeId);
    if (epIdx === -1) return false;

    series[sIdx].seasons[seIdx].episodes[epIdx] = {
      ...series[sIdx].seasons[seIdx].episodes[epIdx],
      ...updatedData
    };
    this.saveSeries(series);
    this.logDBAction('INDEXEDDB', `UPDATE EPISODE ID '${episodeId}'`);
    return true;
  }

  deleteEpisode(seriesId: string, seasonId: string, episodeId: string): boolean {
    const series = this.getSeries();
    const sIdx = series.findIndex(s => s.id === seriesId);
    if (sIdx === -1) return false;

    const seIdx = series[sIdx].seasons.findIndex(se => se.id === seasonId);
    if (seIdx === -1) return false;

    series[sIdx].seasons[seIdx].episodes = series[sIdx].seasons[seIdx].episodes.filter(ep => ep.id !== episodeId);
    this.saveSeries(series);
    this.logDBAction('INDEXEDDB', `DELETE EPISODE '${episodeId}'`);
    return true;
  }

  // SALES CRUD (simulates SQLite operation with structured sales history)
  getSales(): Sale[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SALES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  saveSales(sales: Sale[]) {
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales));
  }

  addSale(sale: Omit<Sale, 'id' | 'date'>): Sale {
    const sales = this.getSales();
    const newSale: Sale = {
      ...sale,
      id: 'sa_' + Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString()
    };
    sales.unshift(newSale);
    this.saveSales(sales);
    this.logDBAction('SQLITE', `INSERT INTO Sales (customer, media_title, type, amount, profit) VALUES ('${newSale.customerName}', '${newSale.mediaTitle}', '${newSale.salesType}', ${newSale.salePrice - newSale.discount}, ${newSale.salePrice - newSale.discount - newSale.purchasePrice})`);
    return newSale;
  }

  deleteSale(id: string): boolean {
    let sales = this.getSales();
    const initialLen = sales.length;
    sales = sales.filter(s => s.id !== id);
    if (sales.length === initialLen) return false;

    this.saveSales(sales);
    this.logDBAction('SQLITE', `DELETE FROM Sales WHERE id='${id}'`);
    return true;
  }

  // SETTINGS (simulates SQLite configurations)
  getSettings(): AppSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!data) return DEFAULT_SETTINGS;
      const parsed = JSON.parse(data);
      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
        defaultPaths: {
          ...DEFAULT_SETTINGS.defaultPaths,
          ...(parsed.defaultPaths || {})
        }
      };
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  updateSettings(settings: Partial<AppSettings>): AppSettings {
    const current = this.getSettings();
    const updated = {
      ...current,
      ...settings,
      defaultPaths: settings.defaultPaths ? { ...current.defaultPaths, ...settings.defaultPaths } : current.defaultPaths
    };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    this.logDBAction('SQLITE', `UPDATE Settings SET theme='${updated.theme}', pageSize=${updated.pageSize}`);
    return updated;
  }

  // SONGS CRUD
  getSongs(): Song[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SONGS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  saveSongs(songs: Song[]) {
    localStorage.setItem(STORAGE_KEYS.SONGS, JSON.stringify(songs));
  }

  addSong(song: Omit<Song, 'id' | 'addedAt'>): Song {
    const songs = this.getSongs();
    const newSong: Song = {
      ...song,
      id: 'so_' + Math.random().toString(36).substr(2, 9),
      addedAt: new Date().toISOString()
    };
    songs.unshift(newSong);
    this.saveSongs(songs);
    this.logDBAction('INDEXEDDB', `INSERT INTO Songs (titleFa, artist, tags) VALUES ('${newSong.titleFa}', '${newSong.artist}', '${newSong.tags.join(",")}')`);
    return newSong;
  }

  updateSong(id: string, updatedData: Partial<Song>): Song | null {
    const songs = this.getSongs();
    const idx = songs.findIndex(s => s.id === id);
    if (idx === -1) return null;

    songs[idx] = { ...songs[idx], ...updatedData };
    this.saveSongs(songs);
    this.logDBAction('INDEXEDDB', `UPDATE Songs SET titleFa='${songs[idx].titleFa}', artist='${songs[idx].artist}' WHERE id='${id}'`);
    return songs[idx];
  }

  deleteSong(id: string): boolean {
    let songs = this.getSongs();
    const initialLen = songs.length;
    songs = songs.filter(s => s.id !== id);
    if (songs.length === initialLen) return false;

    this.saveSongs(songs);
    this.logDBAction('INDEXEDDB', `DELETE FROM Songs WHERE id='${id}'`);
    return true;
  }

  // MUSIC PLAYLISTS / MOOD TAGS CRUD
  getMusicPlaylists(): MusicPlaylist[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PLAYLISTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  saveMusicPlaylists(playlists: MusicPlaylist[]) {
    localStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(playlists));
  }

  addMusicPlaylist(playlist: Omit<MusicPlaylist, 'id'>): MusicPlaylist {
    const playlists = this.getMusicPlaylists();
    const newPlaylist: MusicPlaylist = {
      ...playlist,
      id: 'p_' + Math.random().toString(36).substr(2, 9)
    };
    playlists.push(newPlaylist);
    this.saveMusicPlaylists(playlists);
    this.logDBAction('SQLITE', `INSERT INTO MusicPlaylists (name, description) VALUES ('${newPlaylist.name}', '${newPlaylist.description || ""}')`);
    return newPlaylist;
  }

  deleteMusicPlaylist(id: string): boolean {
    let playlists = this.getMusicPlaylists();
    const initialLen = playlists.length;
    playlists = playlists.filter(p => p.id !== id);
    if (playlists.length === initialLen) return false;

    this.saveMusicPlaylists(playlists);
    this.logDBAction('SQLITE', `DELETE FROM MusicPlaylists WHERE id='${id}'`);
    return true;
  }

  // Backup & Import/Restore
  exportDatabase(): string {
    const backupObj = {
      movies: this.getMovies(),
      series: this.getSeries(),
      sales: this.getSales(),
      settings: this.getSettings(),
      songs: this.getSongs(),
      playlists: this.getMusicPlaylists(),
      backedUpAt: new Date().toISOString(),
      version: '1.1'
    };
    this.logDBAction('SYSTEM', 'EXPORT DATABASE COMPLETED');
    return JSON.stringify(backupObj, null, 2);
  }

  importDatabase(jsonString: string): { success: boolean; message: string } {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.movies && parsed.series && parsed.sales && parsed.settings) {
        localStorage.setItem(STORAGE_KEYS.MOVIES, JSON.stringify(parsed.movies));
        localStorage.setItem(STORAGE_KEYS.SERIES, JSON.stringify(parsed.series));
        localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(parsed.sales));
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(parsed.settings));
        if (parsed.songs) {
          localStorage.setItem(STORAGE_KEYS.SONGS, JSON.stringify(parsed.songs));
        }
        if (parsed.playlists) {
          localStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(parsed.playlists));
        }
        localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
        this.logDBAction('SYSTEM', 'DATABASE RESTORE COMPLETED');
        return { success: true, message: 'دیتابیس با موفقیت بازیابی شد.' };
      }
      return { success: false, message: 'ساختار فایل پشتیبان معتبر نیست!' };
    } catch (e) {
      return { success: false, message: 'خطا در تحلیل فایل پشتیبان: ' + (e as Error).message };
    }
  }

  resetDatabase() {
    localStorage.removeItem(STORAGE_KEYS.MOVIES);
    localStorage.removeItem(STORAGE_KEYS.SERIES);
    localStorage.removeItem(STORAGE_KEYS.SALES);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.SONGS);
    localStorage.removeItem(STORAGE_KEYS.PLAYLISTS);
    localStorage.removeItem(STORAGE_KEYS.INITIALIZED);
    this.init();
    this.logDBAction('SYSTEM', 'DATABASE RESET TO FACTORY SEED DATA');
  }
}

export const dbService = new DatabaseService();
