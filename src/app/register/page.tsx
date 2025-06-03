'use client';
export const dynamic = 'force-dynamic';

import React, { Suspense } from 'react';
import RegisterPageContent from './RegisterPageContent';

export default function RegisterPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RegisterPageContent />
    </Suspense>
  );
}
