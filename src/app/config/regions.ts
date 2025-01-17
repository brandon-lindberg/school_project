export type RegionConfig = {
  en: string;
  jp: string;
};

export type RegionsConfig = {
  [key: string]: RegionConfig;
};

export const REGIONS_CONFIG: RegionsConfig = {
  Tokyo: { en: 'Tokyo', jp: '東京' },
  Kansai: { en: 'Kansai', jp: '関西' },
  Aichi: { en: 'Aichi', jp: '愛知県' },
  Ibaraki: { en: 'Ibaraki', jp: '茨城県' },
  Nagano: { en: 'Nagano', jp: '長野県' },
  Hokkaido: { en: 'Hokkaido', jp: '北海道' },
  Okinawa: { en: 'Okinawa', jp: '沖縄県' },
  Miyagi: { en: 'Miyagi', jp: '宮城県' },
  Hiroshima: { en: 'Hiroshima', jp: '広島県' },
  Fukuoka: { en: 'Fukuoka', jp: '福岡県' },
  Iwate: { en: 'Iwate', jp: '岩手県' },
  Yamanashi: { en: 'Yamanashi', jp: '山梨県' },
  Other: { en: 'Other', jp: 'その他' },
};

export const LOCATION_ORDER = [
  'Tokyo',
  'Kansai',
  'Aichi',
  'Ibaraki',
  'Nagano',
  'Hokkaido',
  'Okinawa',
  'Miyagi',
  'Hiroshima',
  'Fukuoka',
  'Iwate',
  'Yamanashi',
];
