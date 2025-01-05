'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || 'Invalid credentials');
      } else {
        setMessage(`Logged in! User ID: ${data.userId}`);
        router.push('/list');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setMessage(err.message);
      } else {
        setMessage('An unknown error occurred');
      }
    }
  };

  return (
    <main className="p-4 flex justify-center items-center min-h-screen">
      <div className="max-w-xs w-full">
        <h1 className="text-xl font-bold mb-4">Login</h1>
        <form onSubmit={handleLogin} className="flex flex-col gap-2">
          <label className="flex flex-col">
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border p-2 rounded"
            />
          </label>

          <label className="flex flex-col">
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="border p-2 rounded"
            />
          </label>

          <button type="submit" className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
            Log In
          </button>
        </form>

        {message && <p className="mt-4 text-red-500">{message}</p>}
      </div>
    </main>
  );
}
