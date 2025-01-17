'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { School } from '@/types/school';
import { useViewMode } from '../contexts/ViewModeContext';

const Navbar = dynamic(() => import('./Navbar'), { ssr: false });

export default function ClientNavbar() {
  const [schools, setSchools] = useState<School[]>([]);
  const { viewMode } = useViewMode();

  console.log('ClientNavbar - current viewMode:', viewMode);

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

  const handleRegionClick = (region: string) => {
    const element = document.getElementById(region);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });

      // Dispatch event to expand the section
      const event = new CustomEvent('expandRegion', { detail: region });
      window.dispatchEvent(event);
    }
  };

  return <Navbar schools={schools} onRegionClick={handleRegionClick} viewMode={viewMode} />;
}
