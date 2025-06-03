'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import OfferStatus from '../components/OfferStatus';

interface OfferDetail {
  application: { applicantName: string };
  sentAt: string;
  letterUrl: string;
  status: string;
}

export default function OfferDetailPage() {
  const { offerId } = useParams() as { id: string; offerId: string };
  const [offer, setOffer] = useState<OfferDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOffer() {
      try {
        const res = await fetch(`/api/offers/${offerId}`, { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to load offer');
        const data: OfferDetail = await res.json();
        setOffer(data);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        setError(message);
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
      <OfferStatus offerId={offerId} initialStatus={offer.status} letterUrl={offer.letterUrl} />
    </div>
  );
}
