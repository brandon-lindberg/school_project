'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import OfferStatus from '../components/OfferStatus';

export default function OfferDetailPage() {
  const { id: schoolId, offerId } = useParams() as { id: string; offerId: string };
  const [offer, setOffer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOffer() {
      try {
        const res = await fetch(`/api/offers/${offerId}`, { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to load offer');
        setOffer(await res.json());
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchOffer();
  }, [offerId]);

  if (loading) return <div className="p-8">Loading offer...</div>;
  if (error || !offer) return <div className="p-8 text-red-500">{error || 'Offer not found'}</div>;

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Offer for {offer.application.applicantName}</h1>
      <p><strong>Sent at:</strong> {new Date(offer.sentAt).toLocaleString()}</p>
      <p>
        <strong>Letter:</strong>{' '}
        <a href={offer.letterUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
          View Letter
        </a>
      </p>
      <OfferStatus offerId={offerId} initialStatus={offer.status} />
    </div>
  );
}
