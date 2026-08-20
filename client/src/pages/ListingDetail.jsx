import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Star, ChevronRight } from 'lucide-react';
import { apiRequest } from '../lib/api';
import PageLoader from '../components/PageLoader';

function fallbackImage(id) {
  return 'https://picsum.photos/seed/listing' + id + '/800/800';
}

export default function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [savingHeart, setSavingHeart] = useState(false);

  useEffect(function () {
    async function fetchListing() {
      try {
        const data = await apiRequest('/api/listings/' + id);
        setListing(data.listing);

        const token = localStorage.getItem('token');
        if (token) {
          try {
            const savedData = await apiRequest('/api/saved/ids', {
              headers: { Authorization: 'Bearer ' + token },
            });
            setSaved(savedData.savedIds.includes(Number(id)));
          } catch (err) {
            // Not critical if this fails, heart just starts unfilled
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchListing();
  }, [id]);

  async function handleToggleSave() {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    setSavingHeart(true);
    try {
      const data = await apiRequest('/api/saved/' + id + '/toggle', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + token },
      });
      setSaved(data.saved);
    } catch (err) {
      // Fail silently, heart just stays as-is
    } finally {
      setSavingHeart(false);
    }
  }

  if (loading) return <PageLoader />;

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center font-body">
        <p className="text-navy font-semibold mb-2">Listing not found</p>
        <button onClick={function () { navigate('/home'); }} className="text-gold-deep font-semibold text-sm underline">
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-body pb-28">
      <div className="relative w-full aspect-square bg-line">
        <img
          src={listing.image_url || fallbackImage(listing.id)}
          alt={listing.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-5 inset-x-5 flex items-center justify-between">
          <button
            onClick={function () { navigate(-1); }}
            className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center"
          >
            <ArrowLeft className="w-4 h-4 text-navy" strokeWidth={2.2} />
          </button>
          <button
            onClick={handleToggleSave}
            disabled={savingHeart}
            className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center disabled:opacity-60"
          >
            <Heart
              className={'w-4 h-4 ' + (saved ? 'text-red-500' : 'text-navy')}
              strokeWidth={2.2}
              fill={saved ? 'currentColor' : 'none'}
            />
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 pt-6">
        <span className="inline-block text-[11px] font-semibold uppercase tracking-wide bg-[#F9EFE0] text-gold-deep px-2.5 py-1 rounded-full mb-3">
          {listing.condition}
        </span>

        <h1 className="font-display text-[1.5rem] font-semibold text-navy leading-snug mb-2">
          {listing.title}
        </h1>
        <p className="text-[1.4rem] font-bold text-navy mb-6">
          GHS {Number(listing.price).toLocaleString()}
        </p>

        <div className="h-px bg-line mb-6" />

        <button
          onClick={function () { navigate('/listing/' + listing.id + '/review'); }}
          className="w-full flex items-center gap-3 mb-6"
        >
          <div className="w-11 h-11 rounded-full bg-line shrink-0 flex items-center justify-center font-bold text-navy text-[14px]">
            {listing.seller_name ? listing.seller_name.charAt(0) : '?'}
          </div>
          <div className="flex-1 text-left">
            <p className="font-semibold text-navy text-[14.5px]">{listing.seller_name}</p>
            <p className="text-slate text-[12.5px] flex items-center gap-1">
              <Star className="w-3 h-3 fill-gold text-gold" strokeWidth={0} />
              {Number(listing.seller_rating).toFixed(1)} &middot; Verified UG Student
              <span className="text-gold-deep font-semibold ml-1">&middot; See reviews</span>
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-mute shrink-0" strokeWidth={2} />
        </button>

        <div className="h-px bg-line mb-6" />

        <p className="text-[11px] font-semibold tracking-[0.15em] uppercase text-mute mb-2">
          Description
        </p>
        <p className="text-navy text-[14.5px] leading-relaxed">
          {listing.description}
        </p>
      </div>

      <div className="fixed bottom-0 inset-x-0 bg-white border-t border-line px-6 py-4">
        <button
          onClick={function () { navigate('/messages/' + listing.id); }}
          className="w-full max-w-2xl mx-auto block bg-navy text-gold font-bold tracking-[0.1em] text-sm py-4 rounded-full active:scale-[0.98] hover:bg-navy-light transition"
        >
          MESSAGE SELLER
        </button>
      </div>
    </div>
  );
}