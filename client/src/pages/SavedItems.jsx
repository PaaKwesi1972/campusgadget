import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Search, ArrowUpRight, Bookmark, ShieldCheck } from 'lucide-react';
import { apiRequest } from '../lib/api';
import PageLoader from '../components/PageLoader';

export default function SavedItems() {
  const navigate = useNavigate();
  const [savedListings, setSavedListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(function () {
    async function fetchSaved() {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      try {
        const data = await apiRequest('/api/saved', { headers: { Authorization: 'Bearer ' + token } });
        setSavedListings(data.savedListings || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchSaved();
  }, [navigate]);

  const query = searchQuery.trim().toLowerCase();
  const visibleListings = savedListings.filter((item) => !query || [item.title, item.category, item.condition].filter(Boolean).some((value) => value.toLowerCase().includes(query)));

  if (loading) return <PageLoader />;

  return <div className="min-h-[calc(100vh-72px)] bg-[#fbfaf7] px-5 py-7 font-body text-[#10143f] sm:px-8 lg:px-10 lg:py-10"><div className="mx-auto max-w-[1120px]">
    <section className="mb-8 flex flex-col gap-5 border-b border-[#e5e1d8] pb-8 md:flex-row md:items-end md:justify-between"><div><p className="mb-2 text-[10px] font-black uppercase tracking-[0.22em] text-[#c89036]">Your collection</p><div className="flex items-center gap-3"><h1 className="font-body text-[2.25rem] font-black tracking-[-0.05em] sm:text-[3rem]">Saved items</h1><span className="rounded-full bg-[#f7efdF] px-2.5 py-1 text-[10px] font-black text-[#c89036]">{savedListings.length}</span></div><p className="mt-2 max-w-[500px] text-[13px] leading-6 text-[#77736c]">A shortlist of gadgets you may want to come back to.</p></div><button onClick={() => navigate('/home')} className="hidden items-center gap-2 self-start rounded-full border border-[#e5e1d8] bg-white px-4 py-2.5 text-[11px] font-black text-[#10143f] transition hover:border-[#c89036] md:flex"><Bookmark className="h-4 w-4 text-[#c89036]" /> Browse marketplace <ArrowUpRight className="h-3.5 w-3.5" /></button></section>
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#aaa59c]">Your shortlist</p><p className="mt-1 text-[13px] font-bold">{visibleListings.length} item{visibleListings.length === 1 ? '' : 's'} showing</p></div><div className="flex items-center gap-2"><div className="flex min-w-0 items-center gap-2 rounded-full border border-[#e5e1d8] bg-white px-4 py-2.5 sm:w-[250px]"><Search className="h-4 w-4 shrink-0 text-[#9a958c]" /><input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search saved items" className="w-full bg-transparent text-[12px] font-medium outline-none placeholder:text-[#aaa59c]" /></div></div></div>
    {error && <div className="rounded-2xl border border-[#f2c9bf] bg-[#fff5f2] px-5 py-4 text-[13px] text-[#c34f3b]">{error}</div>}
    {!error && visibleListings.length === 0 && <div className="rounded-[24px] border border-dashed border-[#d9d2c6] bg-white px-6 py-20 text-center"><div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-[#f7efdF]"><Heart className="h-5 w-5 text-[#c89036]" /></div><p className="text-[14px] font-black">{query ? 'No matching saved items' : 'Your saved list is empty'}</p><p className="mx-auto mt-2 max-w-[330px] text-[13px] leading-6 text-[#817c72]">{query ? 'Try searching by title, category, or condition.' : 'Tap the heart on any listing to keep it here for later.'}</p><button onClick={() => navigate('/home')} className="mt-6 rounded-full bg-[#10143f] px-5 py-3 text-[11px] font-black uppercase tracking-[0.1em] text-[#d7a23a]">Browse gadgets</button></div>}
    {!error && visibleListings.length > 0 && <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">{visibleListings.map((item) => <button key={item.id} onClick={() => navigate('/listing/' + item.id)} className="group text-left"><div className="relative mb-3 aspect-square overflow-hidden rounded-[20px] bg-[#e9e5dc]"><img src={item.image_url || 'https://picsum.photos/seed/listing' + item.id + '/700/700'} alt={item.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" /><div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/55 to-transparent" /><span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-black text-[#10143f]">{item.condition || 'Gadget'}</span><span className="absolute bottom-3 right-3 grid h-8 w-8 place-items-center rounded-full bg-[#d7a23a] text-[#10143f] opacity-0 transition group-hover:opacity-100"><ArrowUpRight className="h-4 w-4" /></span></div><p className="truncate text-[13px] font-black text-[#10143f]">{item.title}</p><p className="mt-1 text-[11px] font-semibold text-[#817c72]">{item.category || 'Gadget'}</p><p className="mt-1 text-[13px] font-black text-[#10143f]">GHS {Number(item.price).toLocaleString()}</p></button>)}</div>}
    <div className="mt-10 flex items-start gap-3 border-t border-[#e5e1d8] pt-6 text-[11px] leading-5 text-[#817c72]"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#c89036]" /><p>Saved items are private to your account. Message a seller whenever you are ready to ask about a listing.</p></div>
  </div></div>;
}
