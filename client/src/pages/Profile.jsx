import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Heart, Store, Settings, HelpCircle, LogOut, ChevronRight, Star, ShieldAlert, BadgeCheck, ArrowUpRight } from 'lucide-react';
import { apiRequest } from '../lib/api';

const MENU_ITEMS = [
  { icon: Package, label: 'My Listings', detail: 'Manage items you have posted', path: '/my-listings' },
  { icon: Heart, label: 'Saved Items', detail: 'Your private gadget shortlist', path: '/saved' },
  { icon: Store, label: 'Vendor Application', detail: 'Register an off-campus business', path: '/vendor-registration' },
  { icon: Settings, label: 'Account Settings', detail: 'Update your account preferences', path: '/settings' },
  { icon: HelpCircle, label: 'Help & Support', detail: 'Get help with Campus Gadget', path: '/support' },
];

export default function Profile() {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const fullName = currentUser.full_name || 'Campus Gadget user';
  const initials = fullName.split(' ').map((word) => word[0]).slice(0, 2).join('').toUpperCase();
  const [stats, setStats] = useState({ listingsCount: 0, soldCount: 0, rating: 0 });

  useEffect(function () {
    async function fetchStats() {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const data = await apiRequest('/api/listings/my-stats', { headers: { Authorization: 'Bearer ' + token } });
        setStats(data.stats);
      } catch (err) {
        // Keep the profile usable when stats are unavailable.
      }
    }
    fetchStats();
  }, []);

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/welcome');
  }

  return <div className="min-h-[calc(100vh-72px)] bg-[#fbfaf7] px-5 py-7 font-body text-[#10143f] sm:px-8 lg:px-10 lg:py-10"><div className="mx-auto max-w-[1120px]">
    <section className="mb-8 border-b border-[#e5e1d8] pb-8"><p className="mb-2 text-[10px] font-black uppercase tracking-[0.22em] text-[#c89036]">Account workspace</p><div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"><div><h1 className="font-body text-[2.25rem] font-black tracking-[-0.05em] sm:text-[3rem]">Profile</h1><p className="mt-2 text-[13px] leading-6 text-[#77736c]">Manage your identity, listings, and marketplace activity.</p></div><button onClick={() => navigate('/sell')} className="flex items-center gap-2 self-start rounded-full bg-[#10143f] px-4 py-2.5 text-[11px] font-black text-[#d7a23a] transition hover:bg-[#c89036] hover:text-[#10143f]">List an item <ArrowUpRight className="h-3.5 w-3.5" /></button></div></section>
    <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="min-w-0 space-y-6"><div className="rounded-[26px] border border-[#e5e1d8] bg-white p-5 shadow-[0_12px_30px_rgba(16,20,63,0.04)] sm:p-7"><div className="flex flex-col gap-5 sm:flex-row sm:items-center"><div className="grid h-20 w-20 shrink-0 place-items-center rounded-[24px] border border-[#e5e1d8] bg-[#fcfaf5] text-[24px] font-black text-[#10143f]">{initials || '?'}</div><div className="min-w-0"><div className="flex items-center gap-2"><h2 className="truncate text-[20px] font-black tracking-[-0.03em]">{fullName}</h2><BadgeCheck className="h-4 w-4 shrink-0 text-[#c89036]" /></div><p className="mt-1 text-[12px] text-[#817c72]">{currentUser.email || 'Verified University of Ghana student'}</p><span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#f7efdF] px-3 py-1 text-[10px] font-black text-[#c89036]"><span className="h-1.5 w-1.5 rounded-full bg-[#30924a]" /> {currentUser.user_type === 'vendor' ? 'Registered vendor' : 'Verified UG student'}</span></div></div><div className="mt-6 grid grid-cols-3 divide-x divide-[#e5e1d8] rounded-2xl bg-[#fcfaf5] py-4"><div className="text-center"><p className="text-[19px] font-black">{stats.listingsCount}</p><p className="mt-1 text-[10px] font-bold uppercase tracking-[0.1em] text-[#aaa59c]">Listings</p></div><div className="text-center"><p className="flex items-center justify-center gap-1 text-[19px] font-black">{stats.rating ? stats.rating.toFixed(1) : '—'}<Star className="h-3.5 w-3.5 fill-[#d7a23a] text-[#d7a23a]" /></p><p className="mt-1 text-[10px] font-bold uppercase tracking-[0.1em] text-[#aaa59c]">Rating</p></div><div className="text-center"><p className="text-[19px] font-black">{stats.soldCount}</p><p className="mt-1 text-[10px] font-bold uppercase tracking-[0.1em] text-[#aaa59c]">Sold</p></div></div></div>
        <div className="overflow-hidden rounded-[26px] border border-[#e5e1d8] bg-white">{MENU_ITEMS.map(({ icon: Icon, label, detail, path }) => <button key={label} onClick={() => navigate(path)} className="group flex w-full items-center gap-4 border-b border-[#eeeae3] px-5 py-4 text-left transition last:border-b-0 hover:bg-[#fcfaf5] sm:px-6"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#f7efdF] text-[#c89036]"><Icon className="h-4 w-4" /></span><span className="min-w-0 flex-1"><span className="block text-[13px] font-black">{label}</span><span className="mt-1 block truncate text-[11px] text-[#817c72]">{detail}</span></span><ChevronRight className="h-4 w-4 text-[#c9c3b8] transition group-hover:translate-x-0.5 group-hover:text-[#c89036]" /></button>)}<button onClick={() => navigate('/admin')} className="group flex w-full items-center gap-4 border-b border-[#eeeae3] px-5 py-4 text-left transition hover:bg-[#fcfaf5] sm:px-6"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#f7efdF] text-[#c89036]"><ShieldAlert className="h-4 w-4" /></span><span className="min-w-0 flex-1"><span className="block text-[13px] font-black">Admin Dashboard</span><span className="mt-1 block text-[11px] text-[#817c72]">Review marketplace activity</span></span><ChevronRight className="h-4 w-4 text-[#c9c3b8]" /></button><button onClick={handleLogout} className="group flex w-full items-center gap-4 px-5 py-4 text-left transition hover:bg-[#fff5f2] sm:px-6"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#fff0ec] text-[#c34f3b]"><LogOut className="h-4 w-4" /></span><span className="min-w-0 flex-1"><span className="block text-[13px] font-black text-[#c34f3b]">Log out</span><span className="mt-1 block text-[11px] text-[#817c72]">Leave this account on this device</span></span><ChevronRight className="h-4 w-4 text-[#c9c3b8]" /></button></div></div>
      <aside className="hidden h-fit rounded-[26px] bg-[#10143f] p-6 text-white lg:block"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#d7a23a]">Your account</p><h2 className="mt-4 font-body text-[23px] font-black leading-tight tracking-[-0.04em]">A trusted profile makes better handoffs.</h2><p className="mt-4 text-[12px] leading-6 text-white/65">Keep your details current and use a clear profile when you buy, sell, or message someone on campus.</p><div className="mt-7 border-t border-white/15 pt-4"><p className="text-[11px] font-bold text-white/80">Need a hand?</p><button onClick={() => navigate('/support')} className="mt-2 text-[11px] font-black text-[#d7a23a]">Visit help & support <ArrowUpRight className="ml-1 inline h-3 w-3" /></button></div></aside>
    </section>
  </div></div>;
}
