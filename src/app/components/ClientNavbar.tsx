'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { School } from '@/types/school';
import { useViewMode } from '../contexts/ViewModeContext';

const Navbar = dynamic(() => import('./Navbar'), { ssr: false });

export default function ClientNavbar() {
  const [schools, setSchools] = useState<School[]>([]);
  const { viewMode } = useViewMode();

  // Fetch schools
  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const response = await fetch('/api/schools?limit=1000');
        const data = await response.json();
        setSchools(data.schools);
      } catch (error) {
        console.error('Error fetching schools:', error);
      }
    };

    fetchSchools();
  }, []);

  return <Navbar schools={schools} viewMode={viewMode} />;
}
