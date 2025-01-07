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
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const userId = session?.user?.email ? parseInt(session.user.email.split('@')[0]) : 0;
        const response = await fetch(`/api/userLists?userId=${userId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch user lists');
        }
        const data = await response.json();
        setUserLists(data.lists);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    if (session?.user?.email) {
      fetchData();
    }
  }, [session, status, router]);

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
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Your Lists</h2>
        <button onClick={handleCreateList} className="mb-4 bg-blue-500 text-white p-2 rounded">
          Create New List
        </button>
        <ul>
          {userLists.map((list) => (
            <li key={list.list_id}>
              <span>{list.list_name}</span>
              <ul>
                {list.schools.map((school) => (
                  <li key={school.school_id}>
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
              <button onClick={() => handleEditList(list.list_id)} className="ml-2 text-blue-500">
                Edit
              </button>
              <button onClick={() => handleDeleteList(list.list_id)} className="ml-2 text-red-500">
                Delete
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default DashboardPage;
