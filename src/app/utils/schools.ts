import { School } from '@/types/school';
import { Language } from '../types/language';
import { getLocalizedContent } from '@/utils/language';
import { LOCATION_ORDER } from '../config/regions';

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
    }

    if (!acc[location]) {
      acc[location] = [];
    }
    acc[location].push(school);
    return acc;
  }, {});

  // Create an ordered object based on LOCATION_ORDER
  const orderedLocations = LOCATION_ORDER.reduce((acc: { [key: string]: School[] }, location) => {
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
