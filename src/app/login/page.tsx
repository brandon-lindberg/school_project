'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useLanguage } from '../contexts/LanguageContext';

export default function LoginPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const translations = {
    title: language === 'en' ? 'Login' : 'ログイン',
    email: language === 'en' ? 'Email' : 'メールアドレス',
    password: language === 'en' ? 'Password' : 'パスワード',
    loginButton: language === 'en' ? 'Log In' : 'ログイン',
    unknownError: language === 'en' ? 'An unknown error occurred' : '不明なエラーが発生しました',
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setMessage(result.error);
      } else {
        router.push('/dashboard');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setMessage(err.message);
      } else {
        setMessage(translations.unknownError);
      }
    }
  };

  return (
    <main className="p-4 flex justify-center items-center min-h-screen">
      <div className="max-w-xs w-full">
        <h1 className="text-xl font-bold mb-4">{translations.title}</h1>
        <form onSubmit={handleLogin} className="flex flex-col gap-2">
          <label className="flex flex-col">
            {translations.email}
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border p-2 rounded"
            />
          </label>

          <label className="flex flex-col">
            {translations.password}
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="border p-2 rounded"
            />
          </label>

          <button type="submit" className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
            {translations.loginButton}
          </button>
        </form>

        {message && <p className="mt-4 text-red-500">{message}</p>}
      </div>
    </main>
  );
}
