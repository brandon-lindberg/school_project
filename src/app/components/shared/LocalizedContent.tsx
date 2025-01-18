import React from 'react';
import { Language, getLocalizedContent } from '@/utils/language';

interface LocalizedContentProps {
  enContent?: string | null;
  jpContent?: string | null;
  language: Language;
  fallback?: string;
  className?: string;
}

export function LocalizedContent({
  enContent,
  jpContent,
  language,
  fallback = '',
  className = 'text-gray-700 whitespace-pre-wrap',
}: LocalizedContentProps) {
  const content = getLocalizedContent(enContent, jpContent, language) || fallback;

  return content ? <p className={className}>{content}</p> : null;
}
