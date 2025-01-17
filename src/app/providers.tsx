'use client';

import { SessionProvider } from 'next-auth/react';
import { LanguageProvider } from './contexts/LanguageContext';
import { ViewModeProvider } from './contexts/ViewModeContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <LanguageProvider>
        <ViewModeProvider>{children}</ViewModeProvider>
      </LanguageProvider>
    </SessionProvider>
  );
}
