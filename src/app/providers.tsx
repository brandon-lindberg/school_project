'use client';

import { SessionProvider } from 'next-auth/react';
import { LanguageProvider } from './contexts/LanguageContext';
import { ViewModeProvider } from './contexts/ViewModeContext';
import { UserProvider } from './contexts/UserContext';
import { ListStatusProvider } from './contexts/ListStatusContext';
import { BrowsingHistoryProvider } from './contexts/BrowsingHistoryContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <UserProvider>
        <ListStatusProvider>
          <LanguageProvider>
            <ViewModeProvider>
              <BrowsingHistoryProvider>{children}</BrowsingHistoryProvider>
            </ViewModeProvider>
          </LanguageProvider>
        </ListStatusProvider>
      </UserProvider>
    </SessionProvider>
  );
}
