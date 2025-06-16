export type RegionConfig = {
  en: string;
  jp: string;
};

export type RegionsConfig = {
  [key: string]: RegionConfig;
};

export const REGIONS_CONFIG: RegionsConfig = {
  Hokkaido: { en: 'Hokkaidō Region', jp: '北海道地方' },
  Tohoku: { en: 'Tōhoku Region', jp: '東北地方' },
  Kanto: { en: 'Kantō Region', jp: '関東地方' },
  Chubu: { en: 'Chūbu Region', jp: '中部地方' },
  Kansai: { en: 'Kansai Region', jp: '関西地方' },
  Chugoku: { en: 'Chūgoku Region', jp: '中国地方' },
  Shikoku: { en: 'Shikoku Region', jp: '四国地方' },
  Kyushu: { en: 'Kyūshū Region', jp: '九州地方' },
  Other: { en: 'Other', jp: 'その他' },
};

export const REGION_ORDER = [
  'Kanto',
  'Kansai',
  'Hokkaido',
  'Tohoku',
  'Chubu',
  'Chugoku',
  'Shikoku',
  'Kyushu',
];
