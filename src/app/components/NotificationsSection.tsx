import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { useLanguage } from '../contexts/LanguageContext';
import { useDashboard } from '../contexts/DashboardContext';
import Link from 'next/link';
import { Card } from './shared/Card';

export default function NotificationsSection() {
  const { notifications, refreshData } = useDashboard();
  const { language } = useLanguage();

  const clearAllNotifications = async () => {
    try {
      const response = await fetch('/api/notifications/clear', {
        method: 'POST',
      });
      if (response.ok) {
        refreshData();
      }
    } catch (error) {
      console.error('Error clearing notifications:', error);
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

  return (
    <Card>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-heading font-semibold text-neutral-900">
          {language === 'en' ? 'Notifications' : '通知'}
        </h2>
        {notifications.length > 0 && (
          <button
            onClick={clearAllNotifications}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            {language === 'en' ? 'Clear all' : 'すべて削除'}
          </button>
        )}
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="text-center text-gray-500 py-4">
            {language === 'en' ? 'No notifications' : '通知はありません'}
          </div>
        ) : (
          notifications.map(notification => (
            <Link
              key={notification.notification_id}
              href={notification.url || '#'}
              className="block"
            >
              <div
                className={`p-4 rounded-md border border-neutral-200 ${notification.is_read ? 'bg-neutral-50' : 'bg-primary/10'
                  }`}
              >
                <div className="flex justify-between items-start">
                  <h4 className="font-medium text-neutral-900">{notification.title}</h4>
                  <span className="text-xs text-gray-500">
                    {language === 'en'
                      ? formatDate(notification.created_at, 'MMM d, h:mm a')
                      : formatDate(notification.created_at, 'M月d日 aa h:mm')}
                  </span>
                </div>
                <p className="mt-1 text-sm text-neutral-700">{notification.message}</p>
              </div>
            </Link>
          ))
        )}
      </div>
    </Card>
  );
}
