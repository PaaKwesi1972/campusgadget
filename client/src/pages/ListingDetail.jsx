import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ArrowUpRight, Heart, MapPin, ShieldCheck,
  Star, Tag, UserRound,
} from 'lucide-react';
import { apiRequest } from '../lib/api';
import PageLoader from '../components/PageLoader';

function fallbackImage(id) {
  return 'https://picsum.photos/seed/campus-detail-' + id + '/1200/1000';
}

export default function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [savingHeart, setSavingHeart] = useState(false);

  useEffect(() => {
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
            // Save state is non-critical.
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
      // Keep the current state if the save request fails.
    } finally {
      setSavingHeart(false);
    }
  }

  if (loading) return <PageLoader />;

  if (error || !listing) {
    return <div className="flex min-h-screen flex-col items-center justify-center bg-[#fbfaf7] px-6 text-center font-body text-[#10143f]"><p className="font-black">Listing not found</p><p className="mt-2 text-[13px] text-[#77736c]">This item may have been removed or is no longer available.</p><button onClick={() => navigate('/home')} className="mt-6 rounded-full bg-[#10143f] px-5 py-3 text-[12px] font-black text-[#d7a23a]">Back to browse</button></div>;
  }

  return (
    <div className="min-h-screen bg-[#fbfaf7] pb-28 font-body text-[#10143f]">
      <header className="border-b border-[#e5e1d8] bg-[#fbfaf7]">
        <div className="mx-auto flex h-[72px] max-w-[1240px] items-center justify-between px-5 sm:px-8 lg:px-12"><button onClick={() => navigate(-1)} className="flex items-center gap-3"><ArrowLeft className="h-5 w-5" /><span className="hidden text-[12px] font-semibold sm:inline">Back to browse</span></button><button onClick={() => navigate('/home')} className="text-[11px] font-black uppercase tracking-[0.2em]">Campus<span className="text-[#c89036]">Gadget</span></button><button onClick={handleToggleSave} disabled={savingHeart} className={'grid h-10 w-10 place-items-center rounded-full border transition ' + (saved ? 'border-[#c89036] bg-[#f1e8d2] text-[#a77b2e]' : 'border-[#e5e1d8] bg-white text-[#10143f]')} aria-label={saved ? 'Remove from saved items' : 'Save item'}><Heart className="h-4 w-4" fill={saved ? 'currentColor' : 'none'} /></button></div>
      </header>

      <main className="mx-auto grid max-w-[1240px] gap-9 px-5 py-7 sm:px-8 sm:py-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:px-12 lg:py-14">
        <section><div className="relative overflow-hidden rounded-[24px] bg-[#e9e5dc]"><img src={listing.image_url || fallbackImage(listing.id)} alt={listing.title} className="aspect-[1.08] w-full object-cover sm:aspect-[1.2] lg:aspect-[1.05]" /><div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/45 to-transparent" /><span className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.1em] text-[#10143f]"><Tag className="h-3 w-3 text-[#c89036]" /> {listing.category}</span></div><div className="mt-4 flex items-center justify-between text-[11px] text-[#817c72]"><span>Listed on campus</span><button onClick={handleToggleSave} disabled={savingHeart} className="flex items-center gap-1.5 font-black text-[#a77b2e] lg:hidden"><Heart className="h-3.5 w-3.5" fill={saved ? 'currentColor' : 'none'} /> {saved ? 'Saved' : 'Save item'}</button></div></section>

        <section className="lg:pt-2"><div className="flex items-start justify-between gap-5"><div><p className="mb-4 text-[10px] font-black uppercase tracking-[0.22em] text-[#c89036]">{listing.condition} condition</p><h1 className="max-w-xl font-display text-[2.8rem] leading-[0.94] tracking-[-0.065em] sm:text-[4rem]">{listing.title}</h1></div><button onClick={handleToggleSave} disabled={savingHeart} className={'hidden h-11 w-11 shrink-0 place-items-center rounded-full border transition lg:grid ' + (saved ? 'border-[#c89036] bg-[#f1e8d2] text-[#a77b2e]' : 'border-[#e5e1d8] bg-white text-[#10143f]')} aria-label={saved ? 'Remove from saved items' : 'Save item'}><Heart className="h-5 w-5" fill={saved ? 'currentColor' : 'none'} /></button></div><p className="mt-6 font-display text-[2rem] tracking-[-0.04em]">GHS {Number(listing.price).toLocaleString()}</p>

          <div className="my-8 border-y border-[#e5e1d8] py-6"><p className="mb-3 text-[10px] font-black uppercase tracking-[0.18em] text-[#9a958c]">About this item</p><p className="text-[14px] leading-7 text-[#77736c]">{listing.description}</p></div>

          <button onClick={() => navigate('/listing/' + listing.id + '/review')} className="flex w-full items-center gap-4 border-b border-[#e5e1d8] pb-6 text-left"><div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#f1e8d2] text-[13px] font-black text-[#a77b2e]">{listing.seller_name ? listing.seller_name.charAt(0).toUpperCase() : '?'}</div><div className="min-w-0 flex-1"><p className="text-[14px] font-black">{listing.seller_name || 'Campus seller'}</p><p className="mt-1 flex flex-wrap items-center gap-1 text-[11px] text-[#817c72]"><Star className="h-3 w-3 fill-[#c89036] text-[#c89036]" /> {Number(listing.seller_rating || 0).toFixed(1)} · Verified UG student · <span className="font-black text-[#a77b2e]">See reviews</span></p></div><ArrowUpRight className="h-4 w-4 shrink-0 text-[#c9c3b8]" /></button>

          <div className="mt-7 grid gap-3 sm:grid-cols-2"><div className="flex items-start gap-3 bg-white p-4"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#a77b2e]" /><div><p className="text-[12px] font-black">Verified seller</p><p className="mt-1 text-[11px] leading-relaxed text-[#817c72]">University email checked before listing.</p></div></div><div className="flex items-start gap-3 bg-white p-4"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#a77b2e]" /><div><p className="text-[12px] font-black">Meet on campus</p><p className="mt-1 text-[11px] leading-relaxed text-[#817c72]">Choose a public, convenient handoff.</p></div></div></div>
        </section>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-[#e5e1d8] bg-[#fbfaf7]/95 px-5 py-4 backdrop-blur sm:px-8"><div className="mx-auto flex max-w-[1240px] items-center gap-3 lg:justify-end"><button onClick={handleToggleSave} disabled={savingHeart} className={'grid h-12 w-12 shrink-0 place-items-center rounded-full border lg:hidden ' + (saved ? 'border-[#c89036] bg-[#f1e8d2] text-[#a77b2e]' : 'border-[#e5e1d8] bg-white')} aria-label="Save item"><Heart className="h-5 w-5" fill={saved ? 'currentColor' : 'none'} /></button><button onClick={() => navigate('/messages/' + listing.id)} className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#10143f] py-3.5 text-[12px] font-black text-[#d7a23a] transition hover:bg-[#c89036] hover:text-[#10143f] sm:max-w-md">Message seller <ArrowUpRight className="h-4 w-4" /></button></div></div>
    </div>
  );
}
