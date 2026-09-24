import { useNavigate } from 'react-router-dom';
import {
  Bell, Bookmark, Home as HomeIcon, LogOut, MessageCircle,
  Package, PlusCircle, User,
} from 'lucide-react';
import { useNotificationCount, useUnreadCount } from '../hooks/useUnreadCount';

const ITEMS = [
  { key: 'home', label: 'Home', icon: HomeIcon, path: '/home' },
  { key: 'messages', label: 'Messages', icon: MessageCircle, path: '/messages', count: 'messages' },
  { key: 'sell', label: 'Sell an item', icon: PlusCircle, path: '/sell' },
  { key: 'saved', label: 'Saved items', icon: Bookmark, path: '/saved' },
  { key: 'listings', label: 'My listings', icon: Package, path: '/my-listings' },
  { key: 'notifications', label: 'Notifications', icon: Bell, path: '/notifications', count: 'notifications' },
  { key: 'profile', label: 'Profile', icon: User, path: '/profile' },
];

export default function DashboardSidebar({ active = 'home' }) {
  const navigate = useNavigate();
  const unreadCount = useUnreadCount();
  const notificationCount = useNotificationCount();

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/welcome');
  }

  function getBadge(item) {
    if (item.count === 'messages') return unreadCount;
    if (item.count === 'notifications') return notificationCount;
    return 0;
  }

  function NavItems({ mobile = false }) {
    return <div className={mobile ? 'flex w-full items-center justify-around' : 'space-y-1'}>{ITEMS.map((item) => {
      const Icon = item.icon;
      const badge = getBadge(item);
      const isActive = item.key === active;
      return <button key={item.key} onClick={() => navigate(item.path)} className={mobile ? 'relative flex flex-col items-center gap-1 px-2 py-1 ' + (isActive ? 'text-[#d7a23a]' : 'text-white/50') : 'group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ' + (isActive ? 'bg-[#10143f] text-[#d7a23a]' : 'text-[#77736c] hover:bg-white hover:text-[#10143f]')}><span className="relative"><Icon className={mobile ? 'h-[18px] w-[18px]' : 'h-[17px] w-[17px]'} />{badge > 0 && <span className="absolute -right-2 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-[#e36b52] px-1 text-[8px] font-black text-white">{badge}</span>}</span><span className={mobile ? 'text-[9px] font-bold' : 'text-[12px] font-bold'}>{item.label}</span></button>;
    })}</div>;
  }

  return <>
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-[#e5e1d8] bg-[#fbfaf7] px-6 py-8 lg:block"><div className="flex h-full flex-col"><div className="mb-10"><button onClick={() => navigate('/home')} className="text-left"><span className="text-[12px] font-black uppercase tracking-[0.2em]">Campus<span className="text-[#c89036]">Gadget</span></span><span className="mt-2 block text-[10px] text-[#817c72]">The student marketplace</span></button></div><NavItems /><div className="mt-auto"><button onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[12px] font-bold text-[#9b665a] transition hover:bg-[#fff2ef]"><LogOut className="h-[17px] w-[17px]" /> Log out</button></div></div></aside>
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-[#25284b] bg-[#10143f] px-3 pb-[calc(0.6rem+env(safe-area-inset-bottom))] pt-2 lg:hidden"><NavItems mobile /></nav>
  </>;
}

export function DashboardFooter() {
  return <footer className="mt-14 border-t border-[#e5e1d8] pt-5 text-[11px] text-[#aaa59c]">© {new Date().getFullYear()} CampusGadget · Made for students, by students.</footer>;
}

export function dashboardPageClass() {
  return 'min-h-screen overflow-x-hidden bg-[#fbfaf7] pb-24 font-body text-[#10143f] lg:pb-10 lg:pl-64';
}
