import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

type Message = {
  message_id: number;
  title: string;
  content: string;
  created_at: string;
  scheduled_deletion: string;
  is_broadcast: boolean;
  sender: {
    email: string;
    family_name: string | null;
    first_name: string | null;
  };
  is_read: boolean;
  read_at: string | null;
};

type Notification = {
  notification_id: number;
  type: 'CLAIM_SUBMITTED' | 'CLAIM_APPROVED' | 'CLAIM_REJECTED';
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

type UserList = {
  list_id: number;
  list_name: string;
  created_at: string;
  updated_at: string;
  user_id: number;
  schools: {
    list_id: number;
    school_id: number;
    created_at: string;
    school: {
      name_en: string | null;
      name_jp: string | null;
    };
  }[];
};

type ManagedSchool = {
  school_id: number;
  name: string;
};

interface DashboardContextType {
  messages: Message[];
  notifications: Notification[];
  userLists: UserList[];
  managedSchools: ManagedSchool[];
  userRole: string | null;
  isLoading: boolean;
  refreshData: () => Promise<void>;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [userLists, setUserLists] = useState<UserList[]>([]);
  const [managedSchools, setManagedSchools] = useState<ManagedSchool[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session } = useSession();

  const fetchData = async () => {
    if (!session?.user) return;

    try {
      setIsLoading(true);

      // First get the user ID
      const userResponse = await fetch('/api/user');
      const userData = await userResponse.json();

      if (!userResponse.ok || !userData.userId) {
        throw new Error('Failed to get user ID');
      }

      // Fetch all data in parallel
      const [messagesRes, notificationsRes, userListsRes, roleRes] = await Promise.all([
        fetch('/api/messages'),
        fetch('/api/notifications'),
        fetch(`/api/userLists?userId=${userData.userId}`),
        fetch('/api/user/role'),
      ]);

      const [messagesData, notificationsData, userListsData, roleData] = await Promise.all([
        messagesRes.json(),
        notificationsRes.json(),
        userListsRes.json(),
        roleRes.json(),
      ]);

      setMessages(messagesData);
      setNotifications(notificationsData);
      setUserLists(userListsData.lists);
      setUserRole(roleData.role);
      setManagedSchools(roleData.managedSchools || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user) {
      fetchData();
    }
  }, [session]);

  const refreshData = async () => {
    await fetchData();
  };

  return (
    <DashboardContext.Provider
      value={{
        messages,
        notifications,
        userLists,
        managedSchools,
        userRole,
        isLoading,
        refreshData,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}
