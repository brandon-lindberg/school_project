import React from 'react';

export type NotificationType = 'success' | 'error';

interface NotificationBannerProps {
  type: NotificationType;
  message: string;
  onClose: () => void;
}

const NotificationBanner: React.FC<NotificationBannerProps> = ({ type, message, onClose }) => {
  const bgColor = type === 'success' ? 'bg-green-50' : 'bg-red-50';
  const textColor = type === 'success' ? 'text-green-800' : 'text-red-800';
  const borderColor = type === 'success' ? 'border-green-200' : 'border-red-200';
  const iconColor = type === 'success' ? 'text-green-400' : 'text-red-400';

  return (
    <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md`}>
      <div
        className={`${bgColor} ${borderColor} border rounded-lg p-4 shadow-md flex items-center justify-between`}
      >
        <div className="flex items-center">
          {type === 'success' ? (
            <svg
              className={`${iconColor} w-5 h-5 mr-3`}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg
              className={`${iconColor} w-5 h-5 mr-3`}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          <span className={`${textColor} text-sm font-medium`}>{message}</span>
        </div>
        <button onClick={onClose} className={`${textColor} hover:${textColor} ml-4`}>
          <svg
            className="w-4 h-4"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default NotificationBanner;
