'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

// Define types for fetched applications and offers
interface ApplicationDTO {
  id: number;
  applicantName: string;
  offer?: {
    id: number;
    sentAt: string;
    letterUrl: string;
    status: string;
  };
}
interface OfferListItem {
  id: number;
  sentAt: string;
  letterUrl: string;
  status: string;
  applicantName: string;
  applicationId: number;
}

export default function OffersPage() {
  const { id: schoolId } = useParams() as { id: string };
  const [offers, setOffers] = useState<OfferListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOffers() {
      try {
        const res = await fetch(`/api/schools/${schoolId}/recruitment/applications`, { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to fetch applications');
        const apps: ApplicationDTO[] = await res.json();
        const offersList: OfferListItem[] = apps
          .filter(app => app.offer)
          .map(app => ({
            id: app.offer!.id,
            sentAt: app.offer!.sentAt,
            letterUrl: app.offer!.letterUrl,
            status: app.offer!.status,
            applicantName: app.applicantName,
            applicationId: app.id,
          }));
        setOffers(offersList);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        setError(message);
      } finally {
        setLoading(false);
      }
    }
    fetchOffers();
  }, [schoolId]);

  if (loading) return <div className="p-8">Loading offers...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Offers</h1>
      <ul className="space-y-4">
        {offers.map(offer => (
          <li key={offer.id} className="bg-white p-4 rounded shadow flex justify-between items-center">
            <div>
              <p className="font-semibold">{offer.applicantName}</p>
              <p className="text-sm text-gray-600">{new Date(offer.sentAt).toLocaleString()} — {offer.status}</p>
            </div>
            <Link
              href={`/schools/${schoolId}/employment/recruitment/offers/${offer.id}`}
              className="text-blue-500 hover:underline"
            >
              View
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
