'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';

type MessageType = {
  id: string;
  applicationId: string;
  senderId: string;
  content: string;
  createdAt: string;
  sender: { user_id: string; first_name: string | null; family_name: string | null };
};

type Props = {
  applicationId: string;
  allowCandidateMessages: boolean;
  isAdmin: boolean;
};

export default function ApplicationMessages({ applicationId, allowCandidateMessages: initialAllow, isAdmin }: Props) {
  const { data: session } = useSession();
  const userId: string | null = session?.user?.id ?? null;

  const [messages, setMessages] = useState<MessageType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allowCandidateMessages, setAllowCandidateMessages] = useState(initialAllow);
  const [newMessage, setNewMessage] = useState('');

  // Fetch conversation
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/applications/${applicationId}/messages`);
        if (!res.ok) throw new Error('Failed to load messages');
        const data: MessageType[] = await res.json();
        setMessages(data);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        setError(message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [applicationId]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    try {
      const res = await fetch(`/api/applications/${applicationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newMessage.trim() }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to send message');
      }
      const sent: MessageType = await res.json();
      setMessages(prev => [...prev, sent]);
      setNewMessage('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    }
  };

  const handleToggle = async () => {
    try {
      const updated = !allowCandidateMessages;
      const res = await fetch(`/api/applications/${applicationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ allowCandidateMessages: updated }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update setting');
      }
      setAllowCandidateMessages(updated);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    }
  };

  const canSend = isAdmin || allowCandidateMessages;

  return (
    <div className="flex flex-col h-full">
      {/* Admin toggle */}
      {isAdmin && (
        <div className="px-4 py-2 flex items-center space-x-2">
          <label htmlFor="reply-toggle" className="inline-flex relative items-center cursor-pointer">
            <input
              id="reply-toggle"
              type="checkbox"
              className="sr-only peer"
              checked={allowCandidateMessages}
              onChange={handleToggle}
            />
            <div className="w-10 h-5 bg-gray-200 rounded-full peer-checked:bg-green-600 peer-focus:ring-2 peer-focus:ring-blue-500 relative after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border after:border-gray-300 after:rounded-full after:h-4 after:w-4 after:transition-transform peer-checked:after:translate-x-5"></div>
          </label>
          <span className="text-sm text-gray-700">
            {allowCandidateMessages ? 'Enable replies' : 'Read-only'}
          </span>
        </div>
      )}
      {/* Error message */}
      {error && <p className="text-red-500 text-center px-4">{error}</p>}
      {/* Message bubbles container */}
      <div className="flex-1 overflow-auto px-4 py-2 space-y-3">
        {loading ? (
          <p className="text-center text-gray-500">Loading messages...</p>
        ) : messages.length === 0 ? (
          <p className="text-center text-gray-500">No messages</p>
        ) : (
          messages.map(msg => {
            const fromCurrent = userId === msg.senderId;
            return (
              <div key={msg.id} className={`flex ${fromCurrent ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] px-3 py-2 rounded-xl ${fromCurrent ? 'bg-blue-500 text-white rounded-br-none' : 'bg-gray-200 text-gray-800 rounded-bl-none'}`}>
                  <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                  <span className={`block text-[10px] mt-1 ${fromCurrent ? 'text-blue-100' : 'text-gray-500'}`}>{new Date(msg.createdAt).toLocaleTimeString()}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
      {/* Input area */}
      {canSend && (
        <div className="border-t px-4 py-2 flex items-center space-x-2">
          <textarea
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            placeholder="Aa"
            rows={1}
            className="flex-1 resize-none h-10 px-3 py-1 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <button
            onClick={handleSend}
            disabled={!newMessage.trim()}
            className="text-blue-600 hover:text-blue-800 disabled:text-gray-400"
          >
            <PaperAirplaneIcon className="h-5 w-5 rotate-90" />
          </button>
        </div>
      )}
    </div>
  );
}
