'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

// Define the type for user list items
type UserList = {
  list_id: number;
  list_name: string;
  created_at: Date;
  updated_at: Date;
  user_id: number;
  schools: { list_id: number; school_id: number }[];
};

// Function to fetch the user ID dynamically
const getUserId = async (): Promise<number> => {
  try {
    const response = await fetch('/api/user');
    if (!response.ok) {
      const errorData = await response.json();
      if (response.status === 401) {
        throw new Error('Please log in to access this page');
      }
      throw new Error(errorData.error || 'Failed to fetch user ID');
    }
    const data = await response.json();
    return data.userId;
  } catch (error) {
    console.error('Error fetching user ID:', error);
    throw error;
  }
};

const DashboardPage: React.FC = () => {
  const [userLists, setUserLists] = useState<UserList[]>([]);
  const [userId, setUserId] = useState<number | null>(null);
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') {
      return;
    }

    if (status === 'unauthenticated') {
      router.replace('/login');
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Get the actual userId using the getUserId function
        const fetchedUserId = await getUserId();
        setUserId(fetchedUserId);

        const response = await fetch(`/api/userLists?userId=${fetchedUserId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch user lists');
        }
        const data = await response.json();
        setUserLists(data.lists);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (session) {
      fetchData();
    }
  }, [session, status, router]);

  if (status === 'loading' || isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <p className="text-center">Loading...</p>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null; // Return null since we're redirecting
  }

  const handleCreateList = () => {
    // Logic to create a new list
  };

  const handleEditList = (listId: number) => {
    // Logic to edit a list
  };

  const handleDeleteList = (listId: number) => {
    // Logic to delete a list
  };

  const handleDeleteSchoolFromList = async (listId: number, schoolId: number) => {
    try {
      const response = await fetch(`/api/userLists?listId=${listId}&schoolId=${schoolId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to remove school from list');
      }

      // Refresh the list after deletion
      const updatedLists = userLists.map((list) => {
        if (list.list_id === listId) {
          return {
            ...list,
            schools: list.schools.filter((school) => school.school_id !== schoolId),
          };
        }
        return list;
      });

      setUserLists(updatedLists);
    } catch (error) {
      console.error('Error removing school from list:', error);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-6 text-center sm:text-left">Dashboard</h1>

      <section>
        <h2 className="text-2xl font-semibold mb-4 text-center sm:text-left">Your Lists</h2>
        <ul className="space-y-4">
          {userLists.map((list) => (
            <li key={list.list_id} className="border p-4 rounded shadow-sm">
              <span className="block font-medium">{list.list_name}</span>
              <ul className="mt-2 space-y-2">
                {list.schools.map((school) => (
                  <li key={school.school_id} className="flex justify-between items-center">
                    <span>School ID: {school.school_id}</span>
                    <button
                      onClick={() => handleDeleteSchoolFromList(list.list_id, school.school_id)}
                      className="ml-2 text-red-500"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex justify-end space-x-2">
                <button onClick={() => handleEditList(list.list_id)} className="text-blue-500">
                  Edit
                </button>
                <button onClick={() => handleDeleteList(list.list_id)} className="text-red-500">
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default DashboardPage;
