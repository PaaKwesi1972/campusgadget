import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowUpRight, ChevronRight, CircleHelp, Heart, Mail,
  Package, Settings, ShieldAlert, Star, Store, UserRound,
} from 'lucide-react';
import { apiRequest } from '../lib/api';
import DashboardSidebar, { DashboardFooter } from '../components/DashboardSidebar';

const ACCOUNT_LINKS = [
  { icon: Package, label: 'My listings', note: 'Manage what you have posted', path: '/my-listings' },
  { icon: Heart, label: 'Saved items', note: 'Gadgets you want to revisit', path: '/saved' },
  { icon: Store, label: 'Vendor application', note: 'Register an off-campus business', path: '/vendor-registration' },
  { icon: Settings, label: 'Account settings', note: 'Update your password and preferences', path: '/settings' },
  { icon: CircleHelp, label: 'Help and support', note: 'Get answers about CampusGadget', path: '/support' },
];

export default function Profile() {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const fullName = currentUser.full_name || 'CampusGadget member';
  const initials = fullName.split(' ').map((word) => word[0]).slice(0, 2).join('').toUpperCase();
  const [stats, setStats] = useState({ listingsCount: 0, soldCount: 0, rating: 0 });

  useEffect(() => {
    async function fetchStats() {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const data = await apiRequest('/api/listings/my-stats', { headers: { Authorization: 'Bearer ' + token } });
        setStats(data.stats);
      } catch (err) {
        // Stats are supplementary; leave the page usable if they fail.
      }
    }
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#fbfaf7] pb-24 font-body text-[#10143f] lg:pb-10 lg:pl-64">
      <DashboardSidebar active="profile" />
      <header className="border-b border-[#e5e1d8] bg-[#fbfaf7]"><div className="mx-auto flex h-[72px] max-w-[1080px] items-center justify-between px-5 sm:px-8 lg:px-12"><div><p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#c89036]">Account</p><p className="mt-1 text-[12px] text-[#817c72]">Your CampusGadget profile</p></div><button onClick={() => navigate('/settings')} className="grid h-10 w-10 place-items-center rounded-full border border-[#e5e1d8] bg-white" aria-label="Account settings"><Settings className="h-4 w-4" /></button></div></header>

      <main className="mx-auto max-w-[1080px] px-5 py-9 sm:px-8 sm:py-12 lg:px-12 lg:py-16">
        <section className="grid gap-8 border-b border-[#e5e1d8] pb-10 lg:grid-cols-[1fr_0.9fr] lg:items-end lg:gap-16"><div className="flex items-start gap-5"><div className="grid h-20 w-20 shrink-0 place-items-center rounded-full bg-[#10143f] font-display text-[28px] text-[#d7a23a] sm:h-24 sm:w-24 sm:text-[34px]">{initials || '?'}</div><div className="min-w-0"><p className="mb-3 text-[10px] font-black uppercase tracking-[0.22em] text-[#c89036]">Your profile</p><h1 className="truncate font-display text-[2.7rem] leading-none tracking-[-0.06em] sm:text-[3.7rem]">{fullName}</h1><p className="mt-3 flex items-center gap-2 text-[12px] text-[#77736c]"><Mail className="h-3.5 w-3.5 text-[#a77b2e]" /> {currentUser.email || 'Verified campus account'}</p><span className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#f1e8d2] px-3 py-1.5 text-[10px] font-black text-[#a77b2e]"><span className="h-1.5 w-1.5 rounded-full bg-[#c89036]" /> {currentUser.user_type === 'vendor' ? 'Registered vendor' : 'Verified UG student'}</span></div></div><div className="grid grid-cols-3 border-y border-[#e5e1d8] sm:max-w-md lg:justify-self-end"><div className="border-r border-[#e5e1d8] py-4 pr-5"><p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#9a958c]">Listings</p><p className="mt-2 font-display text-[2rem] leading-none">{stats.listingsCount}</p></div><div className="border-r border-[#e5e1d8] px-5 py-4"><p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#9a958c]">Sold</p><p className="mt-2 font-display text-[2rem] leading-none">{stats.soldCount}</p></div><div className="py-4 pl-5"><p className="flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#9a958c]">Rating <Star className="h-3 w-3 fill-[#c89036] text-[#c89036]" /></p><p className="mt-2 font-display text-[2rem] leading-none">{stats.rating ? stats.rating.toFixed(1) : '—'}</p></div></div></section>

        <section className="grid gap-8 py-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16"><div><div className="mb-5 flex items-end justify-between"><div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#9a958c]">Account shortcuts</p><h2 className="mt-1 text-[18px] font-black">Keep things in order</h2></div></div><div className="divide-y divide-[#eeeae2] border-y border-[#e5e1d8] bg-white">{ACCOUNT_LINKS.map((item) => { const Icon = item.icon; return <button key={item.path} onClick={() => navigate(item.path)} className="group flex w-full items-center gap-4 px-4 py-4 text-left transition hover:bg-[#fdf9f1] sm:px-5"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#f1e8d2] text-[#a77b2e]"><Icon className="h-4 w-4" /></span><span className="min-w-0 flex-1"><span className="block text-[13px] font-black">{item.label}</span><span className="mt-1 block truncate text-[11px] text-[#817c72]">{item.note}</span></span><ChevronRight className="h-4 w-4 shrink-0 text-[#c9c3b8] transition group-hover:text-[#c89036]" /></button>; })}</div></div><aside className="h-fit bg-[#10143f] p-6 text-white sm:p-7"><UserRound className="h-5 w-5 text-[#d7a23a]" /><p className="mt-8 font-display text-[2rem] leading-none tracking-[-0.04em]">Your campus, your marketplace.</p><p className="mt-4 text-[12px] leading-6 text-white/65">Keep your details current so buyers and sellers know who they are meeting.</p><button onClick={() => navigate('/settings')} className="mt-7 inline-flex items-center gap-2 text-[11px] font-black text-[#d7a23a]">Review account settings <ArrowUpRight className="h-4 w-4" /></button></aside></section>

        {currentUser.user_type === 'admin' && <button onClick={() => navigate('/admin')} className="mb-8 flex w-full items-center gap-3 border border-[#e5e1d8] bg-white px-5 py-4 text-left"><ShieldAlert className="h-5 w-5 text-[#a77b2e]" /><span className="flex-1"><span className="block text-[13px] font-black">Admin dashboard</span><span className="mt-1 block text-[11px] text-[#817c72]">Review marketplace activity and reports.</span></span><ArrowUpRight className="h-4 w-4 text-[#c9c3b8]" /></button>}
        <DashboardFooter />
      </main>
    </div>
  );
}
