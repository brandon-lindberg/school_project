'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLanguage } from '../contexts/LanguageContext';
import { signIn } from 'next-auth/react';

export default function RegisterPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams?.get('next');
  const { language } = useLanguage();
  const [email, setEmail] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const translations = {
    title: language === 'en' ? 'Register' : '新規登録',
    email: language === 'en' ? 'Email' : 'メールアドレス',
    familyName: language === 'en' ? 'Family Name' : '姓',
    firstName: language === 'en' ? 'First Name' : '名',
    phoneNumber: language === 'en' ? 'Phone Number' : '電話番号',
    password: language === 'en' ? 'Password' : 'パスワード',
    signUpButton: language === 'en' ? 'Sign Up' : '登録',
    unknownError: language === 'en' ? 'An unknown error occurred' : '不明なエラーが発生しました',
    somethingWrong: language === 'en' ? 'Something went wrong' : 'エラーが発生しました',
    successMessage: language === 'en' ? 'Success! Your user ID: ' : '登録完了！ユーザーID: ',
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, familyName, firstName, phoneNumber, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || translations.somethingWrong);
      } else {
        const signInResult = await signIn('credentials', { email, password, redirect: false });
        if (signInResult?.error) {
          setMessage(signInResult.error);
        } else {
          await new Promise(resolve => setTimeout(resolve, 1000));
          router.push(nextPath ?? '/list');
          router.refresh();
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error) setMessage(err.message);
      else setMessage(translations.unknownError);
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen p-4 bg-[var(--background)] text-black">
      <div className="max-w-lg w-full">
        <h1 className="text-2xl font-bold mb-4">{translations.title}</h1>
        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <label className="flex flex-col">
            {translations.email}
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="mt-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            />
          </label>
          <label className="flex flex-col">
            {translations.familyName}
            <input
              type="text"
              value={familyName}
              onChange={e => setFamilyName(e.target.value)}
              className="mt-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            />
          </label>
          <label className="flex flex-col">
            {translations.firstName}
            <input
              type="text"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              className="mt-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            />
          </label>
          <label className="flex flex-col">
            {translations.phoneNumber}
            <input
              type="text"
              value={phoneNumber}
              onChange={e => setPhoneNumber(e.target.value)}
              className="mt-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            />
          </label>
          <label className="flex flex-col">
            {translations.password}
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="mt-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            />
          </label>
          <button type="submit" className="bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
            {translations.signUpButton}
          </button>
        </form>
        {message && <p className="mt-4 text-red-500">{message}</p>}
      </div>
    </main>
  );
}
