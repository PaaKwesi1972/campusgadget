import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Star, ChevronRight, MessageCircle, ShieldCheck, MapPin, BadgeCheck, Share2 } from 'lucide-react';
import { apiRequest } from '../lib/api';
import PageLoader from '../components/PageLoader';

function fallbackImage(id) {
  return 'https://picsum.photos/seed/listing' + id + '/1000/1000';
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
            const savedData = await apiRequest('/api/saved/ids', { headers: { Authorization: 'Bearer ' + token } });
            setSaved(savedData.savedIds.includes(Number(id)));
          } catch (err) {
            // Saved status is optional.
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
      const data = await apiRequest('/api/saved/' + id + '/toggle', { method: 'POST', headers: { Authorization: 'Bearer ' + token } });
      setSaved(data.saved);
    } catch (err) {
      // Keep the current state if the request fails.
    } finally {
      setSavingHeart(false);
    }
  }

  if (loading) return <PageLoader />;

  if (error || !listing) {
    return <div className="flex min-h-[calc(100vh-72px)] items-center justify-center bg-[#fbfaf7] px-6 text-center font-body"><div><p className="text-[15px] font-black text-[#10143f]">Listing not found</p><p className="mt-2 text-[13px] text-[#817c72]">This gadget may have been removed or is no longer available.</p><button onClick={() => navigate('/home')} className="mt-6 rounded-full bg-[#10143f] px-5 py-3 text-[11px] font-black uppercase tracking-[0.1em] text-[#d7a23a]">Back to marketplace</button></div></div>;
  }

  const image = listing.image_url || fallbackImage(listing.id);
  const sellerInitial = listing.seller_name ? listing.seller_name.charAt(0).toUpperCase() : '?';
  const rating = Number(listing.seller_rating || 0).toFixed(1);

  return <div className="min-h-[calc(100vh-72px)] bg-[#fbfaf7] px-5 py-6 pb-28 font-body text-[#10143f] sm:px-8 lg:px-10 lg:py-10 lg:pb-10"><div className="mx-auto max-w-[1120px]">
    <div className="mb-6 flex items-center justify-between"><button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.12em] text-[#77736c] transition hover:text-[#10143f]"><span className="grid h-9 w-9 place-items-center rounded-full border border-[#e5e1d8] bg-white"><ArrowLeft className="h-4 w-4" /></span> Back</button><div className="flex items-center gap-2"><button onClick={() => { if (navigator.share) navigator.share({ title: listing.title, url: window.location.href }); }} className="grid h-9 w-9 place-items-center rounded-full border border-[#e5e1d8] bg-white text-[#77736c] transition hover:border-[#c89036]" aria-label="Share listing"><Share2 className="h-4 w-4" /></button><button onClick={handleToggleSave} disabled={savingHeart} className="grid h-9 w-9 place-items-center rounded-full border border-[#e5e1d8] bg-white transition hover:border-[#c89036] disabled:opacity-60" aria-label={saved ? 'Remove from saved items' : 'Save listing'}><Heart className={'h-4 w-4 ' + (saved ? 'fill-[#e36b52] text-[#e36b52]' : 'text-[#10143f]')} /></button></div></div>
    <section className="grid gap-7 lg:grid-cols-[minmax(0,1.04fr)_minmax(350px,0.96fr)] lg:items-start"><div className="relative overflow-hidden rounded-[28px] border border-[#e5e1d8] bg-[#e9e5dc] shadow-[0_16px_40px_rgba(16,20,63,0.06)]"><div className="aspect-square sm:aspect-[1.1] lg:aspect-[0.95]"><img src={image} alt={listing.title} className="h-full w-full object-cover" /></div><div className="absolute left-5 top-5 rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.1em] text-[#10143f]">{listing.condition || 'Good'} condition</div><div className="absolute inset-x-5 bottom-5 flex items-center justify-between"><span className="rounded-full bg-[#10143f]/85 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.1em] text-[#d7a23a]">{listing.category || 'Gadget'}</span><span className="rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-bold text-[#10143f]">Verified campus listing</span></div></div>
      <div><p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#c89036]">Available on campus</p><h1 className="mt-3 text-[2.25rem] font-black leading-[1.02] tracking-[-0.055em] sm:text-[3.35rem]">{listing.title}</h1><p className="mt-5 text-[2rem] font-black tracking-[-0.04em] text-[#10143f]">GHS {Number(listing.price).toLocaleString()}</p><div className="mt-6 flex flex-wrap gap-2"><span className="rounded-full bg-[#f7efdF] px-3 py-1.5 text-[10px] font-black text-[#c89036]">{listing.condition || 'Good'}</span><span className="rounded-full bg-white px-3 py-1.5 text-[10px] font-bold text-[#77736c]">{listing.category || 'Gadget'}</span><span className="rounded-full bg-white px-3 py-1.5 text-[10px] font-bold text-[#77736c]">Student seller</span></div><div className="mt-7 rounded-[22px] border border-[#e5e1d8] bg-white p-4 sm:p-5"><button onClick={() => navigate('/listing/' + listing.id + '/review')} className="flex w-full items-center gap-3 text-left"><div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#f7efdF] text-[15px] font-black text-[#10143f]">{sellerInitial}</div><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><p className="truncate text-[13px] font-black">{listing.seller_name || 'Campus Gadget seller'}</p><BadgeCheck className="h-3.5 w-3.5 shrink-0 text-[#c89036]" /></div><p className="mt-1 flex items-center gap-1 text-[11px] text-[#817c72]"><Star className="h-3 w-3 fill-[#d7a23a] text-[#d7a23a]" /> {rating} · Verified UG Student</p></div><ChevronRight className="h-4 w-4 text-[#c9c3b8]" /></button><button onClick={() => navigate('/messages/' + listing.id)} className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-[#10143f] py-3.5 text-[11px] font-black uppercase tracking-[0.12em] text-[#d7a23a] transition hover:bg-[#c89036] hover:text-[#10143f]"><MessageCircle className="h-4 w-4" /> Message seller</button></div><div className="mt-6"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#aaa59c]">About this item</p><p className="mt-3 text-[13px] leading-7 text-[#55576a]">{listing.description || 'The seller has not added a description yet.'}</p></div><div className="mt-7 grid gap-3 sm:grid-cols-2"><div className="rounded-2xl bg-[#f7efdF] p-4"><ShieldCheck className="mb-3 h-4 w-4 text-[#c89036]" /><p className="text-[11px] font-black">Verified community</p><p className="mt-1 text-[11px] leading-5 text-[#817c72]">Message with confidence inside Campus Gadget.</p></div><div className="rounded-2xl bg-[#f7efdF] p-4"><MapPin className="mb-3 h-4 w-4 text-[#c89036]" /><p className="text-[11px] font-black">Meet near campus</p><p className="mt-1 text-[11px] leading-5 text-[#817c72]">Choose a familiar public place for handoff.</p></div></div></div></section>
  </div><div className="fixed inset-x-0 bottom-0 z-20 border-t border-[#e5e1d8] bg-[#fbfaf7]/95 px-5 py-3 backdrop-blur lg:hidden"><button onClick={() => navigate('/messages/' + listing.id)} className="mx-auto flex w-full max-w-[520px] items-center justify-center gap-2 rounded-full bg-[#10143f] py-3.5 text-[11px] font-black uppercase tracking-[0.12em] text-[#d7a23a]"><MessageCircle className="h-4 w-4" /> Message seller</button></div></div>;
}
