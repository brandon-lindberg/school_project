'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

type ViewMode = 'list' | 'grid';

interface ViewModeContextType {
  viewMode: ViewMode;
  updateViewMode: (newMode: ViewMode) => Promise<void>;
}

const ViewModeContext = createContext<ViewModeContextType | undefined>(undefined);

export function ViewModeProvider({ children }: { children: React.ReactNode }) {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const { data: session } = useSession();

  // Fetch initial view mode preference
  useEffect(() => {
    const fetchViewMode = async () => {
      try {
        if (session?.user) {
          const response = await fetch('/api/user/preferences');
          if (response.ok) {
            const data = await response.json();
            if (data.preferred_view_mode) {
              console.log('ViewModeContext - fetched viewMode:', data.preferred_view_mode);
              setViewMode(data.preferred_view_mode);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching view mode preference:', error);
      }
    };

    fetchViewMode();
  }, [session]);

  // Update view mode and persist to server
  const updateViewMode = async (newMode: ViewMode) => {
    try {
      if (session?.user) {
        const response = await fetch('/api/user/preferences', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ preferred_view_mode: newMode }),
        });

        if (response.ok) {
          console.log('ViewModeContext - updated viewMode:', newMode);
          setViewMode(newMode);
        } else {
          console.error('Failed to update view mode preference');
        }
      } else {
        setViewMode(newMode);
      }
    } catch (error) {
      console.error('Error updating view mode preference:', error);
    }
  };

  return (
    <ViewModeContext.Provider value={{ viewMode, updateViewMode }}>
      {children}
    </ViewModeContext.Provider>
  );
}

export function useViewMode() {
  const context = useContext(ViewModeContext);
  if (context === undefined) {
    throw new Error('useViewMode must be used within a ViewModeProvider');
  }
  return context;
}
