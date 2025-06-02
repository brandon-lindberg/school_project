import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { format } from 'date-fns';
import {
  XMarkIcon,
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

type User = {
  user_id: number;
  email: string;
  family_name: string | null;
  first_name: string | null;
};

type Message = {
  message_id: number;
  title: string;
  content: string;
  created_at: string;
  is_broadcast: boolean;
  recipients: {
    user: {
      email: string;
      family_name: string | null;
      first_name: string | null;
    };
    is_read: boolean;
    read_at: string | null;
  }[];
};

type SelectedUser = {
  user_id: number;
  displayName: string;
};

const MESSAGES_PER_PAGE = 10;

export default function MessageManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<SelectedUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isBroadcast, setIsBroadcast] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const { language } = useLanguage();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalMessages, setTotalMessages] = useState(0);
  const [messageFilter, setMessageFilter] = useState<'all' | 'broadcast' | 'direct'>('all');
  const [messageSearch, setMessageSearch] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  const fetchMessages = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/messages/sent?page=${currentPage}&limit=${MESSAGES_PER_PAGE}&filter=${messageFilter}&search=${messageSearch}&sort=${sortOrder}`
      );
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages);
        setTotalMessages(data.total);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }, [currentPage, messageFilter, messageSearch, sortOrder]);

  useEffect(() => {
    fetchUsers();
    fetchMessages();
  }, [fetchMessages]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!title.trim() || !content.trim()) {
      alert(language === 'en' ? 'Please fill in all fields' : 'すべての項目を入力してください');
      return;
    }

    if (!isBroadcast && selectedUsers.length === 0) {
      alert(
        language === 'en'
          ? 'Please select at least one recipient'
          : '少なくとも1人の受信者を選択してください'
      );
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content,
          recipientIds: isBroadcast ? null : selectedUsers.map(u => u.user_id),
          isBroadcast,
        }),
      });

      if (response.ok) {
        setTitle('');
        setContent('');
        setSelectedUsers([]);
        setIsBroadcast(false);
        fetchMessages();
        alert(language === 'en' ? 'Message sent successfully' : 'メッセージが正常に送信されました');
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert(
        language === 'en'
          ? 'Failed to send message. Please try again.'
          : 'メッセージの送信に失敗しました。もう一度お試しください。'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getUserName = (user: {
    email: string;
    family_name: string | null;
    first_name: string | null;
  }) => {
    if (user.family_name && user.first_name) {
      return `${user.family_name} ${user.first_name}`;
    }
    return user.email;
  };

  const filteredUsers = users.filter(user => {
    const searchLower = searchQuery.toLowerCase();
    const fullName = getUserName(user).toLowerCase();
    const email = user.email.toLowerCase();
    return fullName.includes(searchLower) || email.includes(searchLower);
  });

  const handleUserSelect = (user: User) => {
    if (!selectedUsers.some(u => u.user_id === user.user_id)) {
      setSelectedUsers([
        ...selectedUsers,
        {
          user_id: user.user_id,
          displayName: getUserName(user),
        },
      ]);
    }
    setSearchQuery('');
    setShowUserDropdown(false);
  };

  const removeUser = (userId: number) => {
    setSelectedUsers(selectedUsers.filter(u => u.user_id !== userId));
  };

  const totalPages = Math.ceil(totalMessages / MESSAGES_PER_PAGE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* New Message Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-2xl font-semibold text-gray-900">
            {language === 'en' ? 'Compose New Message' : '新規メッセージ作成'}
          </h2>
        </div>

        <div className="p-6 space-y-6">
          {/* Broadcast Toggle */}
          <div className="flex items-center space-x-3 pb-6 border-b border-gray-100">
            <input
              type="checkbox"
              id="broadcast"
              checked={isBroadcast}
              onChange={e => {
                setIsBroadcast(e.target.checked);
                if (e.target.checked) {
                  setSelectedUsers([]);
                  setSearchQuery('');
                }
              }}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="broadcast" className="text-gray-700">
              {language === 'en' ? 'Send to all users' : '全ユーザーに送信'}
            </label>
          </div>

          {/* Recipients Selection */}
          {!isBroadcast && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {language === 'en' ? 'To:' : '宛先:'}
              </label>
              <div className="relative">
                <div className="min-h-[42px] flex flex-wrap gap-2 p-2 border rounded-lg bg-white">
                  {selectedUsers.map(user => (
                    <span
                      key={user.user_id}
                      className="inline-flex items-center px-2.5 py-1.5 rounded-full text-sm bg-blue-50 text-blue-700"
                    >
                      {user.displayName}
                      <button
                        onClick={() => removeUser(user.user_id)}
                        className="ml-1.5 hover:text-blue-900"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </span>
                  ))}
                  <div className="relative flex-1 min-w-[200px]">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={e => {
                        setSearchQuery(e.target.value);
                        setShowUserDropdown(true);
                      }}
                      onFocus={() => setShowUserDropdown(true)}
                      placeholder={language === 'en' ? 'Search users...' : 'ユーザーを検索...'}
                      className="w-full border-0 p-1.5 focus:ring-0 text-sm"
                    />
                    {showUserDropdown && searchQuery && (
                      <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-auto">
                        {filteredUsers.length > 0 ? (
                          filteredUsers.map(user => (
                            <button
                              key={user.user_id}
                              onClick={() => handleUserSelect(user)}
                              className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm"
                            >
                              <div className="font-medium">{getUserName(user)}</div>
                              <div className="text-gray-500 text-xs">{user.email}</div>
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-2 text-sm text-gray-500">
                            {language === 'en' ? 'No users found' : 'ユーザーが見つかりません'}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Title */}
          <div>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder={language === 'en' ? 'Subject' : '件名'}
              className="w-full px-4 py-2 border-b border-gray-200 focus:border-blue-500 focus:ring-0 text-lg"
            />
          </div>

          {/* Content */}
          <div>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder={
                language === 'en' ? 'Write your message here...' : 'メッセージを入力してください...'
              }
              rows={8}
              className="w-full px-4 py-3 border rounded-lg focus:border-blue-500 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Send Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSendMessage}
              disabled={isLoading}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
            >
              {isLoading
                ? language === 'en'
                  ? 'Sending...'
                  : '送信中...'
                : language === 'en'
                  ? 'Send Message'
                  : 'メッセージを送信'}
            </button>
          </div>
        </div>
      </div>

      {/* Sent Messages */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold text-gray-900">
              {language === 'en' ? 'Sent Messages' : '送信済みメッセージ'}
            </h2>

            {/* Filters and Search */}
            <div className="flex flex-wrap items-center gap-4">
              {/* Message Type Filter */}
              <select
                value={messageFilter}
                onChange={e => {
                  setMessageFilter(e.target.value as 'all' | 'broadcast' | 'direct');
                  setCurrentPage(1);
                }}
                className="w-full sm:w-auto rounded-lg border-gray-300 text-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">
                  {language === 'en' ? 'All Messages' : 'すべてのメッセージ'}
                </option>
                <option value="broadcast">
                  {language === 'en' ? 'Broadcast Only' : '一斉送信のみ'}
                </option>
                <option value="direct">
                  {language === 'en' ? 'Direct Messages' : '個別送信のみ'}
                </option>
              </select>

              {/* Sort Order */}
              <select
                value={sortOrder}
                onChange={e => {
                  setSortOrder(e.target.value as 'desc' | 'asc');
                  setCurrentPage(1);
                }}
                className="w-full sm:w-auto rounded-lg border-gray-300 text-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="desc">{language === 'en' ? 'Newest First' : '新しい順'}</option>
                <option value="asc">{language === 'en' ? 'Oldest First' : '古い順'}</option>
              </select>

              {/* Search */}
              <div className="relative w-full sm:w-auto">
                <input
                  type="text"
                  value={messageSearch}
                  onChange={e => {
                    setMessageSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder={language === 'en' ? 'Search messages...' : 'メッセージを検索...'}
                  className="w-full sm:w-auto pl-9 pr-4 py-2 rounded-lg border border-gray-300 text-sm focus:ring-blue-500 focus:border-blue-500"
                />
                <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-2 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {messages.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              {language === 'en' ? 'No messages found' : 'メッセージが見つかりません'}
            </p>
          ) : (
            <>
              {messages.map(message => (
                <div key={message.message_id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-medium text-lg text-gray-900">{message.title}</h3>
                    <span className="text-sm text-gray-500">
                      {format(new Date(message.created_at), 'MMM d, yyyy h:mm a')}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4 whitespace-pre-wrap">{message.content}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>
                      {message.is_broadcast
                        ? language === 'en'
                          ? 'Sent to all users'
                          : '全ユーザーに送信'
                        : `${language === 'en' ? 'Recipients' : '受信者'}: ${message.recipients.length}`}
                    </span>
                    <span className="flex items-center">
                      <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                      {language === 'en' ? 'Read by' : '既読'}:{' '}
                      {message.recipients.filter(r => r.is_read).length}
                    </span>
                  </div>
                </div>
              ))}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 bg-gray-50">
                  <div className="text-sm text-gray-700">
                    {language === 'en'
                      ? `Showing ${(currentPage - 1) * MESSAGES_PER_PAGE + 1} to ${Math.min(
                        currentPage * MESSAGES_PER_PAGE,
                        totalMessages
                      )} of ${totalMessages} messages`
                      : `${totalMessages}件中${(currentPage - 1) * MESSAGES_PER_PAGE + 1}～${Math.min(
                        currentPage * MESSAGES_PER_PAGE,
                        totalMessages
                      )}件を表示`}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeftIcon className="w-5 h-5" />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-1 rounded-lg ${currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'hover:bg-gray-200 text-gray-700'
                          }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRightIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
