type Language = 'en' | 'jp';

export function getLocalizedContent(enContent: string | undefined | null, jpContent: string | undefined | null, language: Language): string | undefined {
  if (language === 'jp') {
    return jpContent || enContent || undefined;
  }
  return enContent || jpContent || undefined;
}

export function getLocalizedArray(enArray: string[] | undefined | null, jpArray: string[] | undefined | null, language: Language): string[] {
  if (language === 'jp') {
    return jpArray || enArray || [];
  }
  return enArray || jpArray || [];
}
