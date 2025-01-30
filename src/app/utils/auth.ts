import { getSession, signOut, signIn } from 'next-auth/react';

export async function refreshSession() {
  try {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include',
    });
    const data = await response.json();
    console.log('[refreshSession] Response:', data);

    if (!data.success) {
      console.error('[refreshSession] Failed to refresh:', data.error);
      return null;
    }

    // Force a new session fetch
    const newSession = await getSession();
    console.log('[refreshSession] New session:', newSession);

    return newSession;
  } catch (error) {
    console.error('[refreshSession] Failed to refresh session:', error);
    return null;
  }
}

export async function forceRefresh() {
  try {
    await signOut({ redirect: false });
    // Small delay to ensure signOut completes
    await new Promise(resolve => setTimeout(resolve, 500));
    await signIn('credentials', { redirect: false });
    return await getSession();
  } catch (error) {
    console.error('[forceRefresh] Failed to force refresh:', error);
    return null;
  }
}
