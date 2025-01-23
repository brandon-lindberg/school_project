'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { BellIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { createPortal } from 'react-dom';
import { useLanguage } from '../contexts/LanguageContext';

type Notification = {
  notification_id: number;
  type: 'CLAIM_SUBMITTED' | 'CLAIM_APPROVED' | 'CLAIM_REJECTED';
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

export default function NotificationsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { data: session } = useSession();
  const [unreadCount, setUnreadCount] = useState(0);
  const [mounted, setMounted] = useState(false);
  const { language } = useLanguage();

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
        setUnreadCount(data.filter((n: Notification) => !n.is_read).length);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async (notificationIds: number[]) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationIds }),
      });

      if (response.ok) {
        setNotifications(
          notifications.map(n =>
            notificationIds.includes(n.notification_id) ? { ...n, is_read: true } : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - notificationIds.length));
      }
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    const unreadNotifications = notifications.filter(n => !n.is_read);
    if (unreadNotifications.length > 0) {
      markAsRead(unreadNotifications.map(n => n.notification_id));
    }
  };

  const formatDate = (date: string, formatStr: string) => {
    if (language === 'jp') {
      return format(new Date(date), formatStr, { locale: ja })
        .replace(/\d+月/, match => match.replace('月', '月 '))
        .replace(/\d+日/, match => match.replace('日', '日 '))
        .replace(/午前|午後/, match => `${match} `);
    }
    return format(new Date(date), formatStr);
  };

  if (!session) return null;

  return (
    <>
      <button
        onClick={handleOpen}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none cursor-pointer"
      >
        <BellIcon className="h-6 w-6 cursor-pointer" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {mounted &&
        createPortal(
          <div
            className={`fixed inset-0 ${isOpen ? '' : 'pointer-events-none'}`}
            style={{ zIndex: 99999 }}
          >
            {/* Overlay */}
            <div
              className={`fixed inset-0 bg-black transition-opacity duration-300 ${
                isOpen ? 'opacity-50' : 'opacity-0'
              }`}
              onClick={() => setIsOpen(false)}
            />

            {/* Sidebar */}
            <div
              className={`fixed right-0 top-0 h-full w-96 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
                isOpen ? 'translate-x-0' : 'translate-x-full'
              }`}
            >
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-semibold">
                  {language === 'en' ? 'Notifications' : '通知'}
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="overflow-y-auto h-[calc(100vh-64px)]">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    {language === 'en' ? 'No notifications' : '通知はありません'}
                  </div>
                ) : (
                  <div className="divide-y">
                    {notifications.map(notification => (
                      <div
                        key={notification.notification_id}
                        className={`p-4 ${notification.is_read ? 'bg-white' : 'bg-blue-50'}`}
                      >
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium text-gray-900">{notification.title}</h4>
                          <span className="text-xs text-gray-500">
                            {language === 'en'
                              ? formatDate(notification.created_at, 'MMM d, h:mm a')
                              : formatDate(notification.created_at, 'M月d日 aa h:mm')}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-gray-600">{notification.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
