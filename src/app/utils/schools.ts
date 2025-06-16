import { School } from '@/types/school';
import { Language } from '../types/language';
import { getLocalizedContent } from '@/utils/language';
import { REGIONS_CONFIG, REGION_ORDER } from '../config/regions';

// Simple map of major cities to their regions for fallback inference
const CITY_TO_REGION: Record<string, string> = {
  // Kanto major cities
  Tokyo: 'Kanto', Yokohama: 'Kanto', Chiba: 'Kanto', Saitama: 'Kanto',
  // Chubu
  Nagoya: 'Chubu', Niigata: 'Chubu', Kanazawa: 'Chubu',
  // Kansai
  Osaka: 'Kansai', Kyoto: 'Kansai', Kobe: 'Kansai', Nara: 'Kansai',
  // Tohoku
  Sendai: 'Tohoku', Aomori: 'Tohoku', Morioka: 'Tohoku',
  // Hokkaido
  Sapporo: 'Hokkaido', Niseko: 'Hokkaido',
  // Chugoku
  Hiroshima: 'Chugoku', Okayama: 'Chugoku',
  // Shikoku
  Matsuyama: 'Shikoku', Takamatsu: 'Shikoku',
  // Kyushu
  Fukuoka: 'Kyushu', Kumamoto: 'Kyushu', Naha: 'Kyushu',
};

export const groupSchoolsByLocation = (schools: School[], language: Language) => {
  // First, group schools by their location
  const grouped = schools.reduce((acc: { [key: string]: School[] }, school) => {
    // Check both English and Japanese locations
    let location = getLocalizedContent(school.location_en, school.location_jp, language) || 'Other';

    // Handle special cases for region matching
    if (
      location.includes('Kyoto') ||
      location.includes('Osaka') ||
      location.includes('Kobe') ||
      location.includes('京都') ||
      location.includes('大阪') ||
      location.includes('神戸')
    ) {
      location = 'Kansai';
    } else if (location.includes('Nagoya') || location.includes('名古屋')) {
      location = 'Aichi';
    } else if (location.includes('Tsukuba') || location.includes('つくば')) {
      location = 'Ibaraki';
    } else if (location.includes('Sendai') || location.includes('仙台')) {
      location = 'Miyagi';
    } else if (location.includes('Appi Kogen') || location.includes('安比高原')) {
      location = 'Iwate';
    } else if (location.includes('Kofu') || location.includes('甲府')) {
      location = 'Yamanashi';
    } else if (
      location.includes('Sapporo') ||
      location.includes('札幌') ||
      location.includes('Niseko') ||
      location.includes('ニセコ')
    ) {
      location = 'Hokkaido';
    } else if (location.includes('Tokyo') || location.includes('東京')) {
      location = 'Tokyo';
    } else if (location.includes('Nagano') || location.includes('長野')) {
      location = 'Nagano';
    } else if (location.includes('Okinawa') || location.includes('沖縄')) {
      location = 'Okinawa';
    } else if (location.includes('Hiroshima') || location.includes('広島')) {
      location = 'Hiroshima';
    } else if (location.includes('Fukuoka') || location.includes('福岡')) {
      location = 'Fukuoka';
    }

    if (!acc[location]) {
      acc[location] = [];
    }
    acc[location].push(school);
    return acc;
  }, {});

  // Create an ordered object based on LOCATION_ORDER
  const orderedLocations = REGION_ORDER.reduce((acc: { [key: string]: School[] }, location) => {
    if (grouped[location]) {
      acc[location] = grouped[location];
    }
    return acc;
  }, {});

  // Add any remaining locations not in the predefined order
  Object.entries(grouped).forEach(([location, schools]) => {
    if (!orderedLocations[location] && location !== 'Other') {
      orderedLocations[location] = schools;
    }
  });

  // Add 'Other' category at the end if it exists
  if (grouped['Other']) {
    orderedLocations['Other'] = grouped['Other'];
  }

  return orderedLocations;
};

/**
 * Group schools dynamically by the eight major regions, then by city.
 * Returns an object: { [regionKey]: { [cityName]: School[] } }
 */
export const groupSchoolsByRegionAndCity = (
  schools: School[],
  language: Language
): Record<string, Record<string, School[]>> => {
  const grouped: Record<string, Record<string, School[]>> = {};
  schools.forEach(school => {
    // Determine region key by matching config key or Japanese label
    const regionRaw = (getLocalizedContent(
      school.region_en || '',
      school.region_jp || '',
      language
    ) || '').trim();
    // Try direct key match (case-insensitive)
    let regionKey = Object.keys(REGIONS_CONFIG).find(
      key => key.toLowerCase() === regionRaw.toLowerCase()
    );
    // Fallback to matching Japanese label exactly
    if (!regionKey) {
      regionKey = Object.entries(REGIONS_CONFIG).find(
        ([key, value]) => value.jp === regionRaw
      )?.[0];
    }
    if (!regionKey) {
      // Infer region from city if not set
      const cityRaw = getLocalizedContent(school.location_en || '', school.location_jp || '', language) || '';
      const normalizedCity = cityRaw.trim();
      const inferred = CITY_TO_REGION[normalizedCity];
      regionKey = inferred || 'Other';
    }
    // Determine city name from location
    const cityRaw =
      getLocalizedContent(school.location_en || '', school.location_jp || '', language) ||
      'Other';
    const cityKey = cityRaw;

    // Initialize containers
    if (!grouped[regionKey]) {
      grouped[regionKey] = {};
    }
    if (!grouped[regionKey][cityKey]) {
      grouped[regionKey][cityKey] = [];
    }
    grouped[regionKey][cityKey].push(school);
  });

  // Order regions according to REGION_ORDER, and append Other at end
  const ordered: Record<string, Record<string, School[]>> = {};
  REGION_ORDER.forEach(region => {
    if (grouped[region]) {
      ordered[region] = grouped[region];
    }
  });
  if (grouped.Other) {
    ordered.Other = grouped.Other;
  }
  return ordered;
};
