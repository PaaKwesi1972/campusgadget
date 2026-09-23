import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ArrowUpRight, Check, Edit3, PackageOpen,
  Plus, Search, Trash2, X,
} from 'lucide-react';
import { apiRequest } from '../lib/api';
import PageLoader from '../components/PageLoader';

function fallbackImage(id) {
  return 'https://picsum.photos/seed/my-campus-listing-' + id + '/700/700';
}

export default function MyListings() {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    fetchMyListings();
  }, []);

  async function fetchMyListings() {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    try {
      const data = await apiRequest('/api/listings');
      setListings(data.listings.filter((item) => item.seller_id === currentUser.id));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    const token = localStorage.getItem('token');
    setDeletingId(id);
    try {
      await apiRequest('/api/listings/' + id, {
        method: 'DELETE',
        headers: { Authorization: 'Bearer ' + token },
      });
      setListings((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  }

  const activeCount = listings.filter((item) => item.status === 'active').length;
  const soldCount = listings.filter((item) => item.status === 'sold').length;
  const filteredListings = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return listings.filter((item) => {
      const matchesStatus = statusFilter === 'All' || item.status === statusFilter.toLowerCase();
      const matchesQuery = !normalized || item.title.toLowerCase().includes(normalized) || item.category?.toLowerCase().includes(normalized);
      return matchesStatus && matchesQuery;
    });
  }, [listings, query, statusFilter]);

  if (loading) return <PageLoader />;

  return (
    <div className="min-h-screen bg-[#fbfaf7] font-body text-[#10143f]">
      <header className="border-b border-[#e5e1d8] bg-[#fbfaf7]">
        <div className="mx-auto flex h-[72px] max-w-[1180px] items-center justify-between px-5 sm:px-8 lg:px-12">
          <button onClick={() => navigate('/profile')} className="flex items-center gap-3"><ArrowLeft className="h-5 w-5" /><span className="hidden text-[12px] font-semibold sm:inline">Back to profile</span></button>
          <button onClick={() => navigate('/home')} className="text-[11px] font-black uppercase tracking-[0.2em]">Campus<span className="text-[#c89036]">Gadget</span></button>
          <button onClick={() => navigate('/sell')} className="grid h-10 w-10 place-items-center rounded-full bg-[#10143f] text-[#d7a23a] sm:hidden"><Plus className="h-4 w-4" /></button>
        </div>
      </header>

      <main className="mx-auto max-w-[1180px] px-5 py-9 sm:px-8 sm:py-12 lg:px-12 lg:py-16">
        <div className="flex flex-col gap-6 border-b border-[#e5e1d8] pb-9 sm:flex-row sm:items-end sm:justify-between"><div><p className="mb-3 text-[10px] font-black uppercase tracking-[0.22em] text-[#c89036]">Seller space</p><h1 className="font-display text-[3rem] leading-none tracking-[-0.065em] sm:text-[4rem]">My listings</h1><p className="mt-4 max-w-md text-[14px] leading-7 text-[#77736c]">Keep an eye on what is available, what has sold, and what needs a small update.</p></div><button onClick={() => navigate('/sell')} className="hidden items-center gap-2 rounded-full bg-[#10143f] px-5 py-3 text-[12px] font-black text-[#d7a23a] transition hover:bg-[#c89036] hover:text-[#10143f] sm:inline-flex">List another item <ArrowUpRight className="h-4 w-4" /></button></div>

        <section className="grid grid-cols-3 border-b border-[#e5e1d8] sm:max-w-xl"><div className="border-r border-[#e5e1d8] py-6 pr-5"><p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#9a958c]">All items</p><p className="mt-2 font-display text-[2rem] tracking-[-0.05em]">{listings.length}</p></div><div className="border-r border-[#e5e1d8] px-5 py-6"><p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#9a958c]">Active</p><p className="mt-2 font-display text-[2rem] tracking-[-0.05em]">{activeCount}</p></div><div className="py-6 pl-5"><p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#9a958c]">Sold</p><p className="mt-2 font-display text-[2rem] tracking-[-0.05em]">{soldCount}</p></div></section>

        <section className="py-8"><div className="flex flex-col gap-4 border-b border-[#e5e1d8] pb-5 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-2"><button onClick={() => setStatusFilter('All')} className={'rounded-full px-4 py-2 text-[11px] font-black ' + (statusFilter === 'All' ? 'bg-[#10143f] text-[#d7a23a]' : 'bg-white text-[#77736c]')}>All</button><button onClick={() => setStatusFilter('Active')} className={'rounded-full px-4 py-2 text-[11px] font-black ' + (statusFilter === 'Active' ? 'bg-[#10143f] text-[#d7a23a]' : 'bg-white text-[#77736c]')}>Active</button><button onClick={() => setStatusFilter('Sold')} className={'rounded-full px-4 py-2 text-[11px] font-black ' + (statusFilter === 'Sold' ? 'bg-[#10143f] text-[#d7a23a]' : 'bg-white text-[#77736c]')}>Sold</button></div><div className="flex items-center gap-2 rounded-full border border-[#e5e1d8] bg-white px-4 py-2.5 sm:w-[280px]"><Search className="h-4 w-4 shrink-0 text-[#9a958c]" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search your listings" className="w-full bg-transparent text-[12px] outline-none placeholder:text-[#aaa59c]" />{query && <button onClick={() => setQuery('')}><X className="h-3.5 w-3.5 text-[#77736c]" /></button>}</div></div></section>

        {error && <div className="mb-7 border-l-2 border-[#c34f3b] bg-[#fff2ef] px-4 py-3 text-[13px] text-[#a43b2d]">{error}</div>}
        {!error && listings.length === 0 && <div className="border-y border-[#e5e1d8] py-20 text-center"><PackageOpen className="mx-auto mb-5 h-7 w-7 text-[#c89036]" /><p className="font-black">You have not listed anything yet.</p><p className="mx-auto mt-2 max-w-xs text-[13px] leading-6 text-[#77736c]">When you are ready, add a gadget and make it available to someone on campus.</p><button onClick={() => navigate('/sell')} className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#10143f] px-5 py-3 text-[12px] font-black text-[#d7a23a]">Create a listing <Plus className="h-4 w-4" /></button></div>}
        {!error && listings.length > 0 && filteredListings.length === 0 && <div className="border-y border-[#e5e1d8] py-16 text-center"><p className="font-black">No matching listings</p><p className="mt-2 text-[13px] text-[#77736c]">Try another search or status filter.</p></div>}
        {!error && filteredListings.length > 0 && <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{filteredListings.map((item) => <article key={item.id} className="group overflow-hidden border border-[#e5e1d8] bg-white"><button onClick={() => navigate('/listing/' + item.id + '/edit')} className="block w-full text-left"><div className="relative aspect-[1.12] overflow-hidden bg-[#e9e5dc]"><img src={item.image_url || fallbackImage(item.id)} alt={item.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.035]" /><span className={'absolute left-3 top-3 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.1em] ' + (item.status === 'sold' ? 'bg-[#e6e2da] text-[#77736c]' : 'bg-[#f1e8d2] text-[#a77b2e]')}>{item.status}</span><span className="absolute bottom-3 right-3 grid h-8 w-8 place-items-center rounded-full bg-white/90 text-[#10143f] opacity-0 transition group-hover:opacity-100"><Edit3 className="h-3.5 w-3.5" /></span></div><div className="p-4"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><h2 className="truncate text-[14px] font-black">{item.title}</h2><p className="mt-1 text-[11px] text-[#817c72]">{item.category} · {item.condition}</p></div><p className="shrink-0 text-[14px] font-black">GHS {Number(item.price).toLocaleString()}</p></div></div></button><div className="flex items-center justify-between border-t border-[#eeeae2] px-4 py-3"><button onClick={() => navigate('/listing/' + item.id + '/edit')} className="flex items-center gap-1.5 text-[11px] font-black text-[#77736c] hover:text-[#10143f]"><Edit3 className="h-3.5 w-3.5" /> Edit listing</button><button onClick={() => handleDelete(item.id)} disabled={deletingId === item.id} className="flex items-center gap-1.5 text-[11px] font-black text-[#b45645] disabled:opacity-50">{deletingId === item.id ? 'Removing…' : <><Trash2 className="h-3.5 w-3.5" /> Remove</>}</button></div></article>)}</div>}
        <footer className="mt-14 border-t border-[#e5e1d8] pt-5 text-[11px] text-[#aaa59c]">© {new Date().getFullYear()} CampusGadget · Your listings, your campus.</footer>
      </main>
    </div>
  );
}


