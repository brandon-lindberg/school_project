'use client';

import { SessionProvider } from 'next-auth/react';
import { LanguageProvider } from './contexts/LanguageContext';
import { ViewModeProvider } from './contexts/ViewModeContext';
import { UserProvider } from './contexts/UserContext';
import { ListStatusProvider } from './contexts/ListStatusContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <UserProvider>
        <ListStatusProvider>
          <LanguageProvider>
            <ViewModeProvider>{children}</ViewModeProvider>
          </LanguageProvider>
        </ListStatusProvider>
      </UserProvider>
    </SessionProvider>
  );
}
