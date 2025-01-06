'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

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
    const response = await fetch('/api/user'); // Replace with your actual API endpoint
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to fetch user ID:', response.status, errorText);
      throw new Error('Failed to fetch user ID');
    }
    const data = await response.json();
    return data.userId; // Adjust this based on your API response structure
  } catch (error) {
    console.error('Error fetching user ID:', error);
    throw error; // Re-throw the error to handle it in the calling function
  }
};

const DashboardPage: React.FC = () => {
  const [userLists, setUserLists] = useState<UserList[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user ID dynamically
        const userId = await getUserId();
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

    fetchData();
  }, []);

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
