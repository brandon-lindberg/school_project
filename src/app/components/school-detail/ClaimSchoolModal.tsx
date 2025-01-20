'use client';

import { useState } from 'react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import NotificationBanner from '@/app/components/NotificationBanner';

interface ClaimSchoolModalProps {
  schoolId: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onNotification: (notification: { type: 'success' | 'error'; message: string } | null) => void;
}

export function ClaimSchoolModal({
  schoolId,
  isOpen,
  onClose,
  onSuccess,
  onNotification,
}: ClaimSchoolModalProps) {
  const [verificationMethod, setVerificationMethod] = useState<'EMAIL' | 'DOCUMENT'>('EMAIL');
  const [verificationData, setVerificationData] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { language } = useLanguage();
  const { data: session } = useSession();
  const router = useRouter();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted');
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/schools/${schoolId}/claim`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          verificationMethod,
          verificationData,
          notes,
        }),
      });

      console.log('API Response:', response);
      const data = await response.json();
      console.log('API Data:', data);

      if (response.ok) {
        console.log('Claim submitted successfully');
        onSuccess();
        onClose();

        // Send success notification to parent
        onNotification({
          type: 'success',
          message:
            language === 'en'
              ? 'Your claim has been submitted successfully and is pending review.'
              : '申請が正常に送信され、審査待ちです。',
        });
      } else {
        console.log('Setting error notification');
        onNotification({
          type: 'error',
          message:
            language === 'en'
              ? 'Failed to submit claim. Please try again.'
              : '申請の送信に失敗しました。もう一度お試しください。',
        });
      }
    } catch (error) {
      console.error('Error submitting claim:', error);
      onNotification({
        type: 'error',
        message:
          language === 'en'
            ? 'An error occurred. Please try again.'
            : 'エラーが発生しました。もう一度お試しください。',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">
          {language === 'en' ? 'Claim School' : '学校の申請'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {language === 'en' ? 'Verification Method' : '確認方法'}
            </label>
            <select
              value={verificationMethod}
              onChange={e => setVerificationMethod(e.target.value as 'EMAIL' | 'DOCUMENT')}
              className="w-full rounded-md border border-gray-300 p-2"
              disabled={isSubmitting}
            >
              <option value="EMAIL">
                {language === 'en' ? 'Email Address' : 'メールアドレス'}
              </option>
              <option value="DOCUMENT">
                {language === 'en' ? 'Document Upload' : '書類アップロード'}
              </option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {verificationMethod === 'EMAIL'
                ? language === 'en'
                  ? 'School Email Address'
                  : '学校のメールアドレス'
                : language === 'en'
                  ? 'Document URL'
                  : '書類のURL'}
            </label>
            <input
              type={verificationMethod === 'EMAIL' ? 'email' : 'text'}
              value={verificationData}
              onChange={e => setVerificationData(e.target.value)}
              placeholder={
                verificationMethod === 'EMAIL'
                  ? language === 'en'
                    ? 'e.g., your.name@school.edu'
                    : '例：your.name@school.edu'
                  : language === 'en'
                    ? 'URL to verification document'
                    : '確認書類のURL'
              }
              className="w-full rounded-md border border-gray-300 p-2"
              disabled={isSubmitting}
            />
            <p className="mt-1 text-sm text-gray-500">
              {verificationMethod === 'EMAIL'
                ? language === 'en'
                  ? 'Enter your school email address. This will help us verify your affiliation with the school.'
                  : '学校のメールアドレスを入力してください。学校との関係を確認するために使用されます。'
                : language === 'en'
                  ? 'Provide a URL to an official document proving your affiliation with the school.'
                  : '学校との関係を証明する公式書類のURLを提供してください。'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {language === 'en' ? 'Additional Notes (Optional)' : '追加メモ（任意）'}
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full rounded-md border border-gray-300 p-2"
              rows={3}
              disabled={isSubmitting}
              placeholder={
                language === 'en'
                  ? 'Add any additional information that might help verify your claim'
                  : '申請の確認に役立つ追加情報を入力してください'
              }
            />
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
              disabled={isSubmitting}
            >
              {language === 'en' ? 'Cancel' : 'キャンセル'}
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  {language === 'en' ? 'Submitting...' : '送信中...'}
                </>
              ) : language === 'en' ? (
                'Submit Claim'
              ) : (
                '申請を送信'
              )}
            </button>
          </div>
        </form>

        {/* Instructions */}
        <div className="mb-6 text-sm text-gray-600 bg-gray-50 p-4 rounded">
          <h3 className="font-semibold mb-2">
            {language === 'en' ? 'How it works:' : '申請方法：'}
          </h3>
          <ul className="list-disc list-inside space-y-1">
            <li>
              {language === 'en' ? 'Choose your verification method' : '確認方法を選択してください'}
            </li>
            <li>
              {language === 'en'
                ? 'If using email, provide your school email address'
                : 'メールの場合、学校のメールアドレスを入力してください'}
            </li>
            <li>
              {language === 'en'
                ? 'If using document, provide a URL to official documentation'
                : '書類の場合、公式書類のURLを提供してください'}
            </li>
            <li>
              {language === 'en'
                ? 'Your claim will be reviewed by an administrator'
                : '管理者が申請を確認します'}
            </li>
            <li>
              {language === 'en'
                ? "You'll be notified when your claim is processed"
                : '申請が処理されたら通知されます'}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
