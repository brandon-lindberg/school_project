import Link from 'next/link';

export default function Home() {
  return (
    <main className="font-sans p-8 text-black bg-[var(--background)]">
      <h1>Welcome to My International Schools App</h1>
      <div className="mt-4">
        <Link href="/register" className="mr-4 text-blue-500 hover:underline">
          Register
        </Link>
        <Link href="/login" className="text-blue-500 hover:underline">
          Login
        </Link>
      </div>
    </main>
  );
}
