'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import ApplicationList from './components/ApplicationList';

// Define shape of applications for this list
interface ApplicationListItem {
  id: number;
  applicantName: string;
  email: string;
  status: string;
  currentStage: string;
  rating?: number | null;
  interviews?: { id: number }[];
  offer?: { status: string };
  nationality?: string;
  hasJapaneseVisa?: boolean;
  jlpt?: string;
}

export default function ApplicationsPage() {
  const { id: schoolId } = useParams() as { id: string };
  const [applications, setApplications] = useState<ApplicationListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nationalityFilter, setNationalityFilter] = useState<string[]>(['All']);
  const [visaFilter, setVisaFilter] = useState<string[]>(['All']);
  const [statusFilter, setStatusFilter] = useState<string[]>(['All']);
  const [ratingFilter, setRatingFilter] = useState<string[]>(['All']);
  const [jlptFilter, setJlptFilter] = useState<string[]>(['All']);
  // Accordion expand/collapse state for each filter
  const [openNationality, setOpenNationality] = useState(false);
  const [openVisa, setOpenVisa] = useState(false);
  const [openStatus, setOpenStatus] = useState(false);
  const [openRating, setOpenRating] = useState(false);
  const [openJlpt, setOpenJlpt] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const searchParams = useSearchParams();
  const jobPostingId = searchParams?.get('jobPostingId');

  useEffect(() => {
    async function fetchApplications() {
      try {
        // Include jobPostingId filter if provided
        const endpoint = `/api/schools/${schoolId}/recruitment/applications${jobPostingId ? `?jobPostingId=${jobPostingId}` : ''}`;
        const res = await fetch(endpoint, { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to fetch applications');
        const data: ApplicationListItem[] = await res.json();
        console.log('fetchApplications data:', data);
        setApplications(data);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        setError(message);
      } finally {
        setLoading(false);
      }
    }
    fetchApplications();
  }, [schoolId, jobPostingId]);

  // Derive filter options and filtered list before early returns
  const nationalityOptions = useMemo(() => {
    const unique = Array.from(
      new Set(
        applications.map(app => app.nationality || '').filter(n => n)
      )
    );
    return ['All', ...unique];
  }, [applications]);
  const statusOptions = useMemo(
    () => ['All', ...Array.from(new Set(applications.map(a => a.status)))],
    [applications]
  );
  const ratingOptions = useMemo(
    () => ['All', ...Array.from(new Set(applications.map(a => a.rating).filter(r => r != null))).map(r => String(r))],
    [applications]
  );
  const jlptOptions = useMemo(
    () => ['All', 'None', 'N1', 'N2', 'N3', 'N4', 'N5'],
    []
  );
  const filteredApplications = useMemo(
    () => applications.filter(a => {
      // Nationality multi-filter
      if (!nationalityFilter.includes('All') && !nationalityFilter.includes(a.nationality || '')) return false;
      // Visa multi-filter
      if (!visaFilter.includes('All')) {
        if (a.hasJapaneseVisa && !visaFilter.includes('Yes')) return false;
        if (!a.hasJapaneseVisa && !visaFilter.includes('No')) return false;
      }
      // Status multi-filter
      if (!statusFilter.includes('All') && !statusFilter.includes(a.status)) return false;
      // Rating multi-filter
      if (!ratingFilter.includes('All') && !ratingFilter.includes(String(a.rating))) return false;
      // JLPT multi-filter
      if (!jlptFilter.includes('All') && !jlptFilter.includes(a.jlpt || 'None')) return false;
      return true;
    }),
    [applications, nationalityFilter, visaFilter, statusFilter, ratingFilter, jlptFilter]
  );

  if (loading) {
    return <div className="p-8">Loading applications...</div>;
  }
  if (error) {
    return <div className="p-8 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Applications</h1>
      <button
        onClick={() => setShowFilters(f => !f)}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        {showFilters ? 'Hide Filters' : 'Show Filters'}
      </button>
      {showFilters && (
        <div className="space-y-4 mb-6">
          {/* Nationality Panel */}
          <div className="border rounded">
            <button
              onClick={() => setOpenNationality(o => !o)}
              className="w-full flex justify-between px-4 py-2 bg-gray-100 hover:bg-gray-200"
            >
              <span>Nationality</span>
              <span className="text-gray-600">
                {nationalityFilter.includes('All') ? 'All' : nationalityFilter.join(', ')}
              </span>
            </button>
            {openNationality && (
              <div className="p-4 flex flex-wrap gap-2">
                {nationalityOptions.map(n => (
                  <button
                    key={n}
                    onClick={() => {
                      setNationalityFilter(prev => {
                        if (n === 'All') return ['All'];
                        const next = prev.includes('All') ? [] : [...prev];
                        const idx = next.indexOf(n);
                        if (idx >= 0) next.splice(idx, 1);
                        else next.push(n);
                        return next.length ? next : ['All'];
                      });
                    }}
                    className={`px-3 py-1 rounded-full ${nationalityFilter.includes(n) ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                  >{n}</button>
                ))}
              </div>
            )}
          </div>

          {/* Japanese Visa Panel */}
          <div className="border rounded">
            <button
              onClick={() => setOpenVisa(o => !o)}
              className="w-full flex justify-between px-4 py-2 bg-gray-100 hover:bg-gray-200"
            >
              <span>Japanese Visa</span>
              <span className="text-gray-600">{visaFilter.includes('All') ? 'All' : visaFilter.join(', ')}</span>
            </button>
            {openVisa && (
              <div className="p-4 flex flex-wrap gap-2">
                {['All', 'Yes', 'No'].map(v => (
                  <button
                    key={v}
                    onClick={() => {
                      setVisaFilter(prev => {
                        if (v === 'All') return ['All'];
                        const next = prev.includes('All') ? [] : [...prev];
                        const idx = next.indexOf(v);
                        if (idx >= 0) next.splice(idx, 1);
                        else next.push(v);
                        return next.length ? next : ['All'];
                      });
                    }}
                    className={`px-3 py-1 rounded-full ${visaFilter.includes(v) ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                  >{v}</button>
                ))}
              </div>
            )}
          </div>

          {/* Status Panel */}
          <div className="border rounded">
            <button
              onClick={() => setOpenStatus(o => !o)}
              className="w-full flex justify-between px-4 py-2 bg-gray-100 hover:bg-gray-200"
            >
              <span>Status</span>
              <span className="text-gray-600">{statusFilter.includes('All') ? 'All' : statusFilter.join(', ')}</span>
            </button>
            {openStatus && (
              <div className="p-4 flex flex-wrap gap-2">
                {statusOptions.map(s => (
                  <button
                    key={s}
                    onClick={() => {
                      setStatusFilter(prev => {
                        if (s === 'All') return ['All'];
                        const next = prev.includes('All') ? [] : [...prev];
                        const idx = next.indexOf(s);
                        if (idx >= 0) next.splice(idx, 1);
                        else next.push(s);
                        return next.length ? next : ['All'];
                      });
                    }}
                    className={`px-3 py-1 rounded-full ${statusFilter.includes(s) ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                  >{s}</button>
                ))}
              </div>
            )}
          </div>

          {/* Rating Panel */}
          <div className="border rounded">
            <button
              onClick={() => setOpenRating(o => !o)}
              className="w-full flex justify-between px-4 py-2 bg-gray-100 hover:bg-gray-200"
            >
              <span>Rating</span>
              <span className="text-gray-600">{ratingFilter.includes('All') ? 'All' : ratingFilter.join(', ')}</span>
            </button>
            {openRating && (
              <div className="p-4 flex flex-wrap gap-2">
                {ratingOptions.map(r => (
                  <button
                    key={r}
                    onClick={() => {
                      setRatingFilter(prev => {
                        if (r === 'All') return ['All'];
                        const next = prev.includes('All') ? [] : [...prev];
                        const idx = next.indexOf(r);
                        if (idx >= 0) next.splice(idx, 1);
                        else next.push(r);
                        return next.length ? next : ['All'];
                      });
                    }}
                    className={`px-3 py-1 rounded-full ${ratingFilter.includes(r) ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                  >{r}</button>
                ))}
              </div>
            )}
          </div>

          {/* JLPT Panel */}
          <div className="border rounded">
            <button
              onClick={() => setOpenJlpt(o => !o)}
              className="w-full flex justify-between px-4 py-2 bg-gray-100 hover:bg-gray-200"
            >
              <span>JLPT</span>
              <span className="text-gray-600">{jlptFilter.includes('All') ? 'All' : jlptFilter.join(', ')}</span>
            </button>
            {openJlpt && (
              <div className="p-4 flex flex-wrap gap-2">
                {jlptOptions.map(level => (
                  <button
                    key={level}
                    onClick={() => {
                      setJlptFilter(prev => {
                        if (level === 'All') return ['All'];
                        const next = prev.includes('All') ? [] : [...prev];
                        const idx = next.indexOf(level);
                        if (idx >= 0) next.splice(idx, 1);
                        else next.push(level);
                        return next.length ? next : ['All'];
                      });
                    }}
                    className={`px-3 py-1 rounded-full ${jlptFilter.includes(level) ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                  >{level}</button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      <ApplicationList applications={filteredApplications} schoolId={schoolId} />
    </div>
  );
}
