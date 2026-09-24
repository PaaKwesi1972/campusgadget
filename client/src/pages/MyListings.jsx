import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, ArrowUpRight, Package, Pencil, AlertCircle } from 'lucide-react';
import { apiRequest } from '../lib/api';
import PageLoader from '../components/PageLoader';

export default function MyListings() {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(function () { fetchMyListings(); }, []);

  async function fetchMyListings() {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    try {
      const data = await apiRequest('/api/listings');
      setListings((data.listings || []).filter((item) => item.seller_id === currentUser.id));
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
      await apiRequest('/api/listings/' + id, { method: 'DELETE', headers: { Authorization: 'Bearer ' + token } });
      setListings((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) return <PageLoader />;

  return <div className="min-h-[calc(100vh-72px)] bg-[#fbfaf7] px-5 py-7 font-body text-[#10143f] sm:px-8 lg:px-10 lg:py-10"><div className="mx-auto max-w-[1120px]">
    <section className="mb-8 flex flex-col gap-5 border-b border-[#e5e1d8] pb-8 md:flex-row md:items-end md:justify-between"><div><p className="mb-2 text-[10px] font-black uppercase tracking-[0.22em] text-[#c89036]">Seller workspace</p><h1 className="font-body text-[2.25rem] font-black tracking-[-0.05em] sm:text-[3rem]">My listings</h1><p className="mt-2 text-[13px] leading-6 text-[#77736c]">Keep your live gadgets accurate, clear, and ready for a good handoff.</p></div><button onClick={() => navigate('/sell')} className="flex items-center gap-2 self-start rounded-full bg-[#10143f] px-4 py-2.5 text-[11px] font-black text-[#d7a23a] transition hover:bg-[#c89036] hover:text-[#10143f]"><Plus className="h-4 w-4" /> New listing</button></section>
    <div className="mb-6 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl border border-[#e5e1d8] bg-white p-4"><p className="text-[20px] font-black">{listings.length}</p><p className="mt-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#aaa59c]">Your listings</p></div><div className="rounded-2xl border border-[#e5e1d8] bg-white p-4"><p className="text-[20px] font-black">{listings.filter((item) => item.status === 'active').length}</p><p className="mt-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#aaa59c]">Currently active</p></div><div className="rounded-2xl border border-[#e5e1d8] bg-white p-4"><p className="text-[20px] font-black">{listings.filter((item) => item.status === 'sold').length}</p><p className="mt-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#aaa59c]">Completed sales</p></div></div>
    {error && <div className="mb-5 flex items-center gap-2 rounded-2xl border border-[#f2c9bf] bg-[#fff5f2] px-5 py-4 text-[13px] text-[#c34f3b]"><AlertCircle className="h-4 w-4" />{error}</div>}
    {!error && listings.length === 0 ? <div className="rounded-[24px] border border-dashed border-[#d9d2c6] bg-white px-6 py-20 text-center"><div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-[#f7efdF]"><Package className="h-5 w-5 text-[#c89036]" /></div><p className="text-[14px] font-black">Nothing listed yet</p><p className="mt-2 text-[13px] text-[#817c72]">Your first gadget can be live in a few minutes.</p><button onClick={() => navigate('/sell')} className="mt-6 rounded-full bg-[#10143f] px-5 py-3 text-[11px] font-black uppercase tracking-[0.1em] text-[#d7a23a]">Create listing</button></div> : <div className="grid gap-4 md:grid-cols-2">{listings.map((item) => <article key={item.id} className="group overflow-hidden rounded-[22px] border border-[#e5e1d8] bg-white shadow-[0_10px_25px_rgba(16,20,63,0.03)]"><div className="flex gap-4 p-4"><img src={item.image_url || 'https://picsum.photos/seed/listing' + item.id + '/300/300'} alt={item.title} className="h-24 w-24 shrink-0 rounded-2xl object-cover" /><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><div className="min-w-0"><p className="truncate text-[14px] font-black">{item.title}</p><p className="mt-1 text-[11px] text-[#817c72]">{item.category || 'Gadget'} · {item.condition || 'Good'}</p></div><span className="shrink-0 rounded-full bg-[#f7efdF] px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.1em] text-[#c89036]">{item.status || 'active'}</span></div><p className="mt-3 text-[16px] font-black">GHS {Number(item.price).toLocaleString()}</p></div></div><div className="flex border-t border-[#eeeae3] px-4 py-3"><button onClick={() => navigate('/listing/' + item.id + '/edit')} className="flex flex-1 items-center justify-center gap-2 text-[11px] font-black text-[#10143f]"><Pencil className="h-3.5 w-3.5 text-[#c89036]" /> Edit listing</button><button onClick={() => handleDelete(item.id)} disabled={deletingId === item.id} className="flex items-center gap-2 border-l border-[#eeeae3] px-4 text-[11px] font-black text-[#c34f3b] disabled:opacity-50"><Trash2 className="h-3.5 w-3.5" /> {deletingId === item.id ? 'Removing…' : 'Remove'}</button><button onClick={() => navigate('/listing/' + item.id)} className="grid h-7 w-7 place-items-center rounded-full bg-[#f7efdF] text-[#10143f]"><ArrowUpRight className="h-3.5 w-3.5" /></button></div></article>)}</div>}
  </div></div>;
}
