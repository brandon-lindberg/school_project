'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

interface UserContextType {
  userId: number | null;
}

const UserContext = createContext<UserContextType>({ userId: null });

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: session } = useSession();
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const fetchUserId = async () => {
      if (!session) {
        setUserId(null);
        return;
      }
      try {
        const response = await fetch('/api/user');
        const data = await response.json();
        if (data.userId) {
          setUserId(data.userId);
        }
      } catch (error) {
        console.error('Error fetching user ID:', error);
      }
    };

    fetchUserId();
  }, [session]);

  return <UserContext.Provider value={{ userId }}>{children}</UserContext.Provider>;
};

export const useUser = () => useContext(UserContext);
