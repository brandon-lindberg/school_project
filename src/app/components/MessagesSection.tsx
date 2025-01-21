import { useState, useEffect } from 'react';
import { format, differenceInDays } from 'date-fns';
import { ja } from 'date-fns/locale';
import { useLanguage } from '../contexts/LanguageContext';
import { ChevronDownIcon, ChevronUpIcon, ClockIcon } from '@heroicons/react/24/outline';

type Message = {
  message: {
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
  };
  is_read: boolean;
  read_at: string | null;
};

export default function MessagesSection() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [expandedMessageId, setExpandedMessageId] = useState<number | null>(null);
  const { language } = useLanguage();

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await fetch('/api/messages');
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const markAsRead = async (messageId: number) => {
    try {
      const response = await fetch(`/api/messages/${messageId}/read`, {
        method: 'POST',
      });
      if (response.ok) {
        setMessages(
          messages.map(msg =>
            msg.message.message_id === messageId
              ? { ...msg, is_read: true, read_at: new Date().toISOString() }
              : msg
          )
        );
      }
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const handleMessageClick = async (messageId: number) => {
    if (expandedMessageId === messageId) {
      setExpandedMessageId(null);
    } else {
      setExpandedMessageId(messageId);
      const message = messages.find(msg => msg.message.message_id === messageId);
      if (message && !message.is_read) {
        await markAsRead(messageId);
      }
    }
  };

  const getSenderName = (sender: Message['message']['sender']) => {
    if (sender.family_name && sender.first_name) {
      return `${sender.family_name} ${sender.first_name}`;
    }
    return sender.email;
  };

  const formatDate = (date: string, formatStr: string) => {
    if (language === 'jp') {
      return format(new Date(date), formatStr, { locale: ja })
        .replace(/\d+月/, match => match.replace('月', '月 ')) // Add space after month
        .replace(/\d+日/, match => match.replace('日', '日 ')) // Add space after day
        .replace(/午前|午後/, match => `${match} `); // Add space after AM/PM
    }
    return format(new Date(date), formatStr);
  };

  const getExpirationInfo = (scheduledDeletion: string) => {
    const daysLeft = differenceInDays(new Date(scheduledDeletion), new Date());

    if (language === 'en') {
      return {
        text: `${daysLeft} ${daysLeft === 1 ? 'day' : 'days'} until deletion`,
        tooltip: `This message will be automatically deleted on ${formatDate(scheduledDeletion, 'MMM d, yyyy')}`,
      };
    } else {
      return {
        text: `削除まで${daysLeft}日`,
        tooltip: `このメッセージは${formatDate(scheduledDeletion, 'yyyy年M月d日')}に自動的に削除されます`,
      };
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-2xl font-semibold text-[#333333] mb-6">
        {language === 'en' ? 'Messages' : 'メッセージ'}
      </h2>

      <div className="space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-4">
            {language === 'en' ? 'No messages' : 'メッセージはありません'}
          </div>
        ) : (
          messages.map(msg => (
            <div key={msg.message.message_id} className="space-y-2">
              {/* Message Preview */}
              <button
                onClick={() => handleMessageClick(msg.message.message_id)}
                className={`w-full text-left transition-colors ${
                  expandedMessageId === msg.message.message_id
                    ? 'bg-blue-50'
                    : msg.is_read
                      ? 'bg-white hover:bg-gray-50'
                      : 'bg-blue-50 hover:bg-blue-100'
                } p-4 rounded-lg border flex items-start justify-between group`}
              >
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-gray-900 truncate">{msg.message.title}</h4>
                    {!msg.is_read && (
                      <span className="inline-block px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                        {language === 'en' ? 'New' : '新着'}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 truncate">{msg.message.content}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                    <ClockIcon className="w-4 h-4" />
                    <span title={getExpirationInfo(msg.message.scheduled_deletion).tooltip}>
                      {getExpirationInfo(msg.message.scheduled_deletion).text}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs text-gray-500 mb-1">
                    {language === 'en'
                      ? formatDate(msg.message.created_at, 'MMM d, h:mm a')
                      : formatDate(msg.message.created_at, 'M月d日 aa h:mm')}
                  </span>
                  {expandedMessageId === msg.message.message_id ? (
                    <ChevronUpIcon className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </button>

              {/* Expanded Message */}
              {expandedMessageId === msg.message.message_id && (
                <div className="ml-4 pl-4 border-l-2 border-blue-200">
                  <div className="bg-white rounded-lg border p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="font-medium text-gray-900">
                          {getSenderName(msg.message.sender)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {language === 'en'
                            ? formatDate(msg.message.created_at, 'MMM d, yyyy h:mm a')
                            : formatDate(msg.message.created_at, 'yyyy年M月d日 aa h:mm')}
                        </div>
                        <div
                          className="text-sm text-gray-500 mt-1"
                          title={getExpirationInfo(msg.message.scheduled_deletion).tooltip}
                        >
                          <span className="inline-flex items-center gap-1">
                            <ClockIcon className="w-4 h-4" />
                            {getExpirationInfo(msg.message.scheduled_deletion).text}
                          </span>
                        </div>
                      </div>
                      {msg.is_read && (
                        <div className="text-xs text-gray-500">
                          {language === 'en' ? 'Read' : '既読'}
                          {msg.read_at &&
                            (language === 'en'
                              ? ` • ${formatDate(msg.read_at, 'MMM d, h:mm a')}`
                              : ` • ${formatDate(msg.read_at, 'M月d日 aa h:mm')}`)}
                        </div>
                      )}
                    </div>
                    <div className="prose prose-sm max-w-none">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {msg.message.title}
                      </h3>
                      <p className="text-gray-700 whitespace-pre-wrap">{msg.message.content}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
