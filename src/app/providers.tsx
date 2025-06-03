'use client';

import * as ReactDOMClient from 'react-dom/client';
import * as ReactDOM from 'react-dom';

// Polyfill findDOMNode for ReactQuill compatibility
const clientDOM = ReactDOMClient as unknown as Record<string, unknown>;
const domDOM = ReactDOM as unknown as Record<string, unknown>;
if (!clientDOM.findDOMNode && domDOM.findDOMNode) {
  clientDOM.findDOMNode = domDOM.findDOMNode;
}

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
