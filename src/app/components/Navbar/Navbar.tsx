'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: session } = useSession();

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo with image - smaller on mobile, larger on bigger screens */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="relative w-8 h-8 sm:w-10 sm:h-10">
              <Image
                src="/logo.png"
                alt="ISDBJ Logo"
                fill
                className="rounded-full object-contain"
                priority
              />
            </div>
            <span className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-600 truncate max-w-[200px] sm:max-w-none">
              ISDBJ - International Schools Database Japan
            </span>
          </Link>

          {/* Hamburger button - visible on small and medium screens */}
          <button
            className="lg:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Desktop menu - only visible on large screens */}
          <div className="hidden lg:flex space-x-4">
            <Link href="/list" className="text-gray-700 hover:text-blue-600">
              Schools
            </Link>
            {session ? (
              <>
                <Link href="/dashboard" className="text-gray-700 hover:text-blue-600">
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-gray-700 hover:text-blue-600"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-gray-700 hover:text-blue-600">
                  Login
                </Link>
                <Link href="/register" className="text-gray-700 hover:text-blue-600">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile/Tablet menu - hidden on large screens */}
        <div className={`lg:hidden ${isMenuOpen ? 'block' : 'hidden'}`}>
          <div className="flex flex-col space-y-3 py-4 px-4 sm:px-6">
            <Link href="/list" className="text-gray-700 hover:text-blue-600 text-sm sm:text-base py-1">
              Schools
            </Link>
            {session ? (
              <>
                <Link href="/dashboard" className="text-gray-700 hover:text-blue-600 text-sm sm:text-base py-1">
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-gray-700 hover:text-blue-600 text-sm sm:text-base py-1 text-left"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-gray-700 hover:text-blue-600 text-sm sm:text-base py-1">
                  Login
                </Link>
                <Link href="/register" className="text-gray-700 hover:text-blue-600 text-sm sm:text-base py-1">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
