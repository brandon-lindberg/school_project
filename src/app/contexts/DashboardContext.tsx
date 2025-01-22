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
  const loadDataRef = React.useRef<() => Promise<void>>(() => Promise.resolve());

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      if (!session?.user?.email || !mounted) return;

      try {
        setIsLoading(true);

        // First get the user ID
        const userResponse = await fetch('/api/user');
        if (!userResponse.ok) {
          throw new Error(`Failed to get user ID: ${userResponse.statusText}`);
        }

        const userData = await userResponse.json();
        if (!userData?.userId) {
          throw new Error('User ID not found in response');
        }

        if (!mounted) return;

        // Fetch all data in parallel
        const [messagesRes, notificationsRes, userListsRes, roleRes] = await Promise.all([
          fetch('/api/messages'),
          fetch('/api/notifications'),
          fetch(`/api/userLists?userId=${userData.userId}`),
          fetch('/api/user/role'),
        ]);

        if (!mounted) return;

        // Check if any requests failed
        const failedRequests = [
          { name: 'messages', res: messagesRes },
          { name: 'notifications', res: notificationsRes },
          { name: 'userLists', res: userListsRes },
          { name: 'role', res: roleRes },
        ].filter(req => !req.res.ok);

        if (failedRequests.length > 0) {
          throw new Error(
            `Failed requests: ${failedRequests.map(req => `${req.name} (${req.res.status})`).join(', ')}`
          );
        }

        const [messagesData, notificationsData, userListsData, roleData] = await Promise.all([
          messagesRes.json(),
          notificationsRes.json(),
          userListsRes.json(),
          roleRes.json(),
        ]);

        if (!mounted) return;

        setMessages(messagesData);
        setNotifications(notificationsData);
        setUserLists(userListsData.lists || []);
        setUserRole(roleData.role);
        setManagedSchools(roleData.managedSchools || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Reset states on error
        if (mounted) {
          setMessages([]);
          setNotifications([]);
          setUserLists([]);
          setUserRole(null);
          setManagedSchools([]);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadData();
    loadDataRef.current = loadData;

    return () => {
      mounted = false;
    };
  }, [session?.user?.email]);

  const refreshData = async () => {
    if (loadDataRef.current) {
      await loadDataRef.current();
    }
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
