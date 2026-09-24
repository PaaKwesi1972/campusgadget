import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Home as HomeIcon, MessageCircle, PlusCircle, User, Bookmark,
  Settings, HelpCircle, Bell, X, Menu, ArrowUpRight, LogOut,
} from 'lucide-react';
import MonoLogo from './MonoLogo';

const NAV_ITEMS = [
  { key: 'home', label: 'Home', icon: HomeIcon, path: '/home' },
  { key: 'messages', label: 'Messages', icon: MessageCircle, path: '/messages' },
  { key: 'sell', label: 'Sell an item', icon: PlusCircle, path: '/sell' },
  { key: 'saved', label: 'Saved items', icon: Bookmark, path: '/saved' },
  { key: 'profile', label: 'Profile', icon: User, path: '/profile' },
];

function Brand() {
  return <div className="flex items-center gap-2.5"><div className="grid h-9 w-9 place-items-center rounded-xl border border-[#e5e1d8] bg-white"><MonoLogo className="h-6 w-6" color="#10143f" /></div><div><p className="text-[12px] font-black uppercase tracking-[0.18em] text-[#10143f]">Campus<span className="text-[#c89036]">Gadget</span></p><p className="mt-0.5 text-[9px] text-[#817c72]">Student marketplace</p></div></div>;
}

export default function DashboardLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const notificationCount = 0;

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/welcome');
  }

  const SidebarContent = () => (
    <div className="flex h-full flex-col px-5 py-6">
      <div className="mb-9 flex items-center justify-between"><Brand /><button onClick={() => setSidebarOpen(false)} className="grid h-8 w-8 place-items-center rounded-lg text-[#817c72] lg:hidden" aria-label="Close menu"><X className="h-4 w-4" /></button></div>
      <p className="mb-3 px-3 text-[9px] font-black uppercase tracking-[0.18em] text-[#aaa59c]">Workspace</p>
      <div className="space-y-1">{NAV_ITEMS.map(({ key, label, icon: Icon, path }) => <button key={key} onClick={() => { navigate(path); setSidebarOpen(false); }} className={'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[12px] font-semibold transition ' + (location.pathname === path || (key === 'messages' && location.pathname.startsWith('/messages')) || (key === 'profile' && location.pathname === '/profile') ? 'bg-[#10143f] text-[#d7a23a] shadow-[0_8px_18px_rgba(16,20,63,0.12)]' : 'text-[#77736c] hover:bg-[#f0ede7] hover:text-[#10143f]')}><Icon className="h-[17px] w-[17px]" strokeWidth={2.1} /><span>{label}</span></button>)}</div>
      <p className="mb-3 mt-9 px-3 text-[9px] font-black uppercase tracking-[0.18em] text-[#aaa59c]">Account</p>
      <div className="space-y-1"><button onClick={() => navigate('/settings')} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[12px] font-semibold text-[#77736c] transition hover:bg-[#f0ede7] hover:text-[#10143f]"><Settings className="h-[17px] w-[17px]" />Settings</button><button onClick={() => navigate('/support')} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[12px] font-semibold text-[#77736c] transition hover:bg-[#f0ede7] hover:text-[#10143f]"><HelpCircle className="h-[17px] w-[17px]" />Help & support</button><button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[12px] font-semibold text-[#c34f3b] transition hover:bg-[#fff0ec]"><LogOut className="h-[17px] w-[17px]" />Log out</button></div>
      <div className="mt-auto rounded-2xl bg-[#10143f] p-4 text-white"><p className="text-[12px] font-bold leading-relaxed">Find your next useful gadget on campus.</p><button onClick={() => navigate('/sell')} className="mt-3 text-[10px] font-black uppercase tracking-[0.12em] text-[#d7a23a]">Start selling <ArrowUpRight className="ml-1 inline h-3 w-3" /></button></div>
    </div>
  );

  return <div className="min-h-screen bg-[#fbfaf7] font-body text-[#10143f]">
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[244px] border-r border-[#e5e1d8] bg-[#fbfaf7] lg:block"><SidebarContent /></aside>
    {sidebarOpen && <><button onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-30 bg-[#10143f]/25 lg:hidden" aria-label="Close navigation" /><aside className="fixed inset-y-0 left-0 z-40 w-[280px] bg-[#fbfaf7] shadow-2xl lg:hidden"><SidebarContent /></aside></>}
    <div className="lg:ml-[244px]">
      <header className="sticky top-0 z-20 border-b border-[#e5e1d8] bg-[#fbfaf7]/95 backdrop-blur"><div className="flex h-[72px] items-center justify-between gap-4 px-5 sm:px-8 lg:px-10"><div className="flex items-center gap-3"><button onClick={() => setSidebarOpen(true)} className="grid h-9 w-9 place-items-center rounded-xl border border-[#e5e1d8] bg-white lg:hidden" aria-label="Open navigation"><Menu className="h-4 w-4" /></button><div><p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#aaa59c]">Campus Gadget</p><p className="mt-1 text-[14px] font-black">{location.pathname === '/home' ? 'Home overview' : 'Marketplace workspace'}</p></div></div><div className="flex items-center gap-2"><button onClick={() => navigate('/notifications')} className="relative grid h-10 w-10 place-items-center rounded-full border border-[#e5e1d8] bg-white" aria-label="Notifications"><Bell className="h-4 w-4" />{notificationCount > 0 && <span className="absolute right-0 top-0 grid h-4 min-w-4 place-items-center rounded-full bg-[#e36b52] px-1 text-[9px] font-black text-white">{notificationCount}</span>}</button><button onClick={() => navigate('/profile')} className="flex items-center gap-2 rounded-full border border-[#e5e1d8] bg-white py-1.5 pl-1.5 pr-3 transition hover:border-[#c89036]"><span className="grid h-8 w-8 place-items-center rounded-full border border-[#e5e1d8] bg-white"><MonoLogo className="h-5 w-5" color="#10143f" /></span><span className="hidden text-left sm:block"><span className="block text-[10px] font-black uppercase tracking-[0.13em] text-[#10143f]">Campus Gadget</span><span className="block text-[9px] text-[#817c72]">My account</span></span></button></div></div></header>
      <main className="min-h-[calc(100vh-72px)]">{children}</main>
    </div>
  </div>;
}
