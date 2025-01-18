export type Language = 'en' | 'jp';

export function getLocalizedContent(
  enContent?: string | null,
  jpContent?: string | null,
  language: Language = 'en'
): string | undefined {
  if (language === 'jp' && jpContent) {
    return jpContent;
  }
  if (language === 'en' && enContent) {
    return enContent;
  }
  return enContent || jpContent || undefined;
}

export function getLocalizedArray(
  enArray?: string[] | null,
  jpArray?: string[] | null,
  language: Language = 'en'
): string[] {
  if (language === 'jp' && jpArray) {
    return jpArray;
  }
  if (language === 'en' && enArray) {
    return enArray;
  }
  return enArray || jpArray || [];
}
