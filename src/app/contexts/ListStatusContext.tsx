'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useUser } from './UserContext';

interface ListStatus {
  isInList: boolean;
  listId: number | null;
}

interface UserList {
  list_id: number;
  schools: {
    school_id: number;
    list_id: number;
  }[];
}

interface ListStatusContextType {
  listStatuses: Record<string, ListStatus>;
  updateListStatus: (schoolId: number, status: ListStatus) => void;
}

const ListStatusContext = createContext<ListStatusContextType>({
  listStatuses: {},
  updateListStatus: () => {},
});

export const ListStatusProvider = ({ children }: { children: React.ReactNode }) => {
  const { userId } = useUser();
  const [listStatuses, setListStatuses] = useState<Record<string, ListStatus>>({});

  useEffect(() => {
    const fetchListStatuses = async () => {
      if (!userId) {
        setListStatuses({});
        return;
      }

      try {
        const response = await fetch(`/api/userLists?userId=${userId}`);
        const data = await response.json();

        const statusMap: Record<string, ListStatus> = {};
        data.lists.forEach((list: UserList) => {
          list.schools.forEach(school => {
            statusMap[school.school_id] = {
              isInList: true,
              listId: list.list_id,
            };
          });
        });

        setListStatuses(statusMap);
      } catch (error) {
        console.error('Error fetching list statuses:', error);
      }
    };

    fetchListStatuses();
  }, [userId]);

  const updateListStatus = (schoolId: number, status: ListStatus) => {
    setListStatuses(prev => ({
      ...prev,
      [schoolId]: status,
    }));
  };

  return (
    <ListStatusContext.Provider value={{ listStatuses, updateListStatus }}>
      {children}
    </ListStatusContext.Provider>
  );
};

export const useListStatus = () => useContext(ListStatusContext);
