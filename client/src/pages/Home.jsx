import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Search, SlidersHorizontal, Home as HomeIcon, MessageCircle,
  PlusCircle, User, Bell, X, ArrowUpRight, ShieldCheck,
  MapPin, ChevronRight, Bookmark, Package, LogOut,
} from 'lucide-react';
import { apiRequest } from '../lib/api';
import { useNotificationCount, useUnreadCount } from '../hooks/useUnreadCount';
import { DashboardFooter } from '../components/DashboardSidebar';
import DashboardSidebar from '../components/DashboardSidebar';

const CATEGORIES = ['All', 'Phones', 'Laptops', 'Tablets', 'Accessories', 'Audio'];
const HERO_MESSAGES = [
  'The useful things are usually nearby.',
  'A better laptop, without the new-device price.',
  'Find a charger before the lecture starts.',
  'Good tech should keep moving around campus.',
];

function fallbackImage(id) {
  return 'https://picsum.photos/seed/campus-gadget-' + id + '/900/900';
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return mins + 'm ago';
  const hours = Math.floor(mins / 60);
  if (hours < 24) return hours + 'h ago';
  const days = Math.floor(hours / 24);
  if (days < 7) return days + 'd ago';
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function ListingCard({ item, navigate, featured }) {
  return (
    <button onClick={() => navigate('/listing/' + item.id)} className={'group block w-full text-left ' + (featured ? 'sm:col-span-2' : '')}>
      <div className={'relative mb-3 overflow-hidden bg-[#e9e5dc] ' + (featured ? 'aspect-[1.55] rounded-[24px]' : 'aspect-square rounded-[18px]')}>
        <img src={item.image_url || fallbackImage(item.id)} alt={item.title} loading="lazy" className="h-full w-full object-cover transition duration-500 ease-out group-hover:scale-[1.035]" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/55 to-transparent" />
        <span className="absolute left-3 top-3 rounded-full bg-[#fbfaf7] px-2.5 py-1 text-[10px] font-bold text-[#10143f]">{item.condition}</span>
        <span className="absolute bottom-3 left-3 text-[11px] font-semibold text-white/90">{item.category || 'Gadget'} · {timeAgo(item.created_at)}</span>
        <span className="absolute bottom-3 right-3 grid h-8 w-8 translate-y-2 place-items-center rounded-full bg-[#d7a23a] text-[#10143f] opacity-0 transition duration-200 group-hover:translate-y-0 group-hover:opacity-100"><ArrowUpRight className="h-4 w-4" /></span>
      </div>
      <div className="flex items-start justify-between gap-3 px-0.5"><div className="min-w-0"><p className="truncate text-[14px] font-bold tracking-[-0.02em] text-[#10143f]">{item.title}</p><p className="mt-1 text-[11px] text-[#817c72]">{item.condition} condition</p></div><p className="shrink-0 text-[14px] font-black text-[#10143f]">GHS {Number(item.price).toLocaleString()}</p></div>
    </button>
  );
}

function LoadingCard() {
  return <div><div className="aspect-square animate-pulse rounded-[18px] bg-[#e9e5dc]" /><div className="mt-3 h-3 w-3/4 animate-pulse rounded bg-[#e9e5dc]" /><div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-[#e9e5dc]" /></div>;
}

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const notificationCount = useNotificationCount();
  const unreadCount = useUnreadCount();
  const [activeCategory, setActiveCategory] = useState('All');
  const [heroMessage, setHeroMessage] = useState(0);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [advancedFilters, setAdvancedFilters] = useState(null);
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    async function fetchListings() {
      try {
        const data = await apiRequest('/api/listings');
        setListings(data.listings);
      } catch (err) {
        setError('Could not load listings. Is the backend running?');
      } finally {
        setLoading(false);
      }
    }
    fetchListings();
  }, []);

  useEffect(() => {
    if (location.state && location.state.filters) {
      setAdvancedFilters(location.state.filters);
      setActiveCategory('All');
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    const interval = setInterval(() => setHeroMessage((current) => (current + 1) % HERO_MESSAGES.length), 4500);
    return () => clearInterval(interval);
  }, []);

  const query = searchQuery.trim().toLowerCase();
  const isSearching = query.length > 0;
  const hasAdvancedFilters = advancedFilters && (advancedFilters.categories.length > 0 || advancedFilters.conditions.length > 0 || advancedFilters.minPrice > 0 || advancedFilters.maxPrice < 5000);
  const isFiltered = isSearching || activeCategory !== 'All' || hasAdvancedFilters;
  const filteredListings = listings.filter((item) => {
    const matchesSearch = !isSearching || item.title.toLowerCase().includes(query) || (item.description && item.description.toLowerCase().includes(query)) || (item.category && item.category.toLowerCase().includes(query));
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    let matchesAdvanced = true;
    if (hasAdvancedFilters) {
      const price = Number(item.price);
      matchesAdvanced = (advancedFilters.categories.length === 0 || advancedFilters.categories.includes(item.category)) && (advancedFilters.conditions.length === 0 || advancedFilters.conditions.includes(item.condition)) && price >= advancedFilters.minPrice && price <= advancedFilters.maxPrice;
    }
    return matchesSearch && matchesCategory && matchesAdvanced;
  });

  const featuredListing = filteredListings[0] || listings[0];
  const navItems = [
    { key: 'home', label: 'Home', icon: HomeIcon, path: '/home' },
    { key: 'messages', label: 'Messages', icon: MessageCircle, path: '/messages', badge: unreadCount },
    { key: 'sell', label: 'Sell an item', icon: PlusCircle, path: '/sell' },
    { key: 'saved', label: 'Saved items', icon: Bookmark, path: '/saved' },
    { key: 'listings', label: 'My listings', icon: Package, path: '/my-listings' },
    { key: 'notifications', label: 'Notifications', icon: Bell, path: '/notifications', badge: notificationCount },
    { key: 'profile', label: 'Profile', icon: User, path: '/profile' },
  ];

  function resetFilters() {
    setSearchQuery('');
    setActiveCategory('All');
    setAdvancedFilters(null);
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/welcome');
  }

  function Sidebar({ mobile = false }) {
    return (
      <nav className={mobile ? 'flex items-center justify-around' : 'flex h-full flex-col'}>
        {!mobile && <div className="mb-10"><button onClick={() => navigate('/home')} className="text-left"><span className="text-[12px] font-black uppercase tracking-[0.2em]">Campus<span className="text-[#c89036]">Gadget</span></span><span className="mt-2 block text-[10px] text-[#817c72]">The student marketplace</span></button></div>}
        <div className={mobile ? 'flex w-full items-center justify-around' : 'space-y-1'}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.key === 'home';
            return (
              <button key={item.key} onClick={() => navigate(item.path)} className={mobile ? 'relative flex flex-col items-center gap-1 px-2 py-1 text-[#d7a23a]' : 'group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ' + (active ? 'bg-[#10143f] text-[#d7a23a]' : 'text-[#77736c] hover:bg-white hover:text-[#10143f]')}>
                <span className="relative"><Icon className={mobile ? 'h-[18px] w-[18px]' : 'h-[17px] w-[17px]'} />{item.badge > 0 && <span className="absolute -right-2 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-[#e36b52] px-1 text-[8px] font-black text-white">{item.badge}</span>}</span>
                <span className={mobile ? 'text-[9px] font-bold' : 'text-[12px] font-bold'}>{item.label}</span>
              </button>
            );
          })}
        </div>
        {!mobile && <div className="mt-auto"><p className="mb-5 border-t border-[#e5e1d8] pt-5 text-[10px] leading-relaxed text-[#aaa59c]">© {new Date().getFullYear()} CampusGadget<br />Made for students, by students.</p><button onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[12px] font-bold text-[#9b665a] transition hover:bg-[#fff2ef]"><LogOut className="h-[17px] w-[17px]" /> Log out</button></div>}
      </nav>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#fbfaf7] pb-24 font-body text-[#10143f] lg:pb-0 lg:pl-64">
      <style>{'@keyframes heroFade { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }'}</style>
      <DashboardSidebar active="home" />
      <header className="border-b border-[#e5e1d8] bg-[#fbfaf7]/95 backdrop-blur lg:sticky lg:top-0 lg:z-20"><div className="mx-auto max-w-[1360px] px-5 sm:px-8 lg:px-12"><div className="flex h-[72px] items-center justify-between gap-5"><button onClick={() => navigate('/home')} className="shrink-0 text-left lg:hidden"><span className="text-[11px] font-black uppercase tracking-[0.2em]">Campus<span className="text-[#c89036]">Gadget</span></span></button><div className="hidden lg:block"><p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#c89036]">Browse the exchange</p><p className="mt-1 text-[12px] text-[#817c72]">Find something useful for your next semester</p></div><div className="flex items-center gap-2"><button onClick={() => navigate('/notifications')} className="relative grid h-10 w-10 place-items-center rounded-full border border-[#e5e1d8] bg-white" aria-label="Notifications"><Bell className="h-4 w-4" />{notificationCount > 0 && <span className="absolute right-0 top-0 grid h-4 min-w-4 place-items-center rounded-full bg-[#e36b52] px-1 text-[9px] font-black text-white">{notificationCount}</span>}</button><button onClick={() => navigate('/profile')} className="grid h-10 w-10 place-items-center rounded-full bg-[#10143f] text-[11px] font-black text-[#d7a23a]">{currentUser.full_name ? currentUser.full_name.split(' ').map((part) => part[0]).slice(0, 2).join('') : 'CG'}</button></div></div></div></header>

      <main className="mx-auto max-w-[1360px] px-5 sm:px-8 lg:px-12"><section className="grid gap-8 py-9 sm:py-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:gap-14 lg:py-16"><div><p className="mb-5 text-[10px] font-black uppercase tracking-[0.22em] text-[#c89036]">University of Ghana · student market</p><h1 key={heroMessage} className="max-w-[560px] animate-[heroFade_650ms_ease-out] font-display text-[3rem] leading-[0.94] tracking-[-0.065em] sm:text-[4.6rem]">{HERO_MESSAGES[heroMessage]}</h1><p className="mt-6 max-w-[430px] text-[14px] leading-7 text-[#77736c]">Buy and sell useful tech with people who share your campus. No strangers, no inflated shop prices.</p><div className="mt-8 flex flex-wrap items-center gap-5"><button onClick={() => navigate('/sell')} className="rounded-full bg-[#10143f] px-5 py-3 text-[12px] font-black text-[#d7a23a] transition hover:bg-[#c89036] hover:text-[#10143f] active:scale-[0.98]">List an item</button><div className="flex items-center gap-2" aria-label="Hero messages">{HERO_MESSAGES.map((message, index) => <button key={message} onClick={() => setHeroMessage(index)} aria-label={'Show message ' + (index + 1)} className={'h-1.5 rounded-full transition-all duration-300 ' + (heroMessage === index ? 'w-8 bg-[#c89036]' : 'w-1.5 bg-[#c9c3b8]')} />)}</div></div></div><div className="relative min-h-[330px] overflow-hidden rounded-[26px] bg-[#10143f] sm:min-h-[430px]">{featuredListing ? <><img src={featuredListing.image_url || fallbackImage(featuredListing.id)} alt={featuredListing.title} className="absolute inset-0 h-full w-full object-cover opacity-80 transition duration-700 hover:scale-105" /><div className="absolute inset-0 bg-gradient-to-t from-[#10143f] via-[#10143f]/10 to-transparent" /><div className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-4 sm:inset-x-7 sm:bottom-7"><div><p className="mb-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#d7a23a]">Worth a look</p><p className="max-w-[280px] text-[20px] font-black leading-tight text-white sm:text-[25px]">{featuredListing.title}</p><p className="mt-2 text-[13px] text-white/70">GHS {Number(featuredListing.price).toLocaleString()} · {featuredListing.condition}</p></div><button onClick={() => navigate('/listing/' + featuredListing.id)} className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#d7a23a] text-[#10143f] transition hover:bg-white" aria-label="View featured listing"><ArrowUpRight className="h-5 w-5" /></button></div></> : <div className="flex h-full flex-col justify-end p-7 text-white"><ShieldCheck className="mb-auto h-6 w-6 text-[#d7a23a]" /><p className="max-w-[310px] font-display text-[2.3rem] leading-none">Verified students. Better handoffs.</p></div>}</div></section>

      <section className="border-y border-[#e5e1d8] py-5"><div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div className="scrollbar-hide flex gap-2 overflow-x-auto">{CATEGORIES.map((category) => <button key={category} onClick={() => { setActiveCategory(category); setAdvancedFilters(null); }} className={'shrink-0 rounded-full px-4 py-2 text-[11px] font-black transition ' + (activeCategory === category ? 'bg-[#10143f] text-[#d7a23a]' : 'bg-white text-[#77736c] hover:bg-[#f0ede7]')}>{category}</button>)}</div><div className="flex items-center gap-2 lg:w-[360px]"><div className="flex min-w-0 flex-1 items-center gap-2 rounded-full border border-[#e5e1d8] bg-white px-4 py-2.5"><Search className="h-4 w-4 shrink-0 text-[#9a958c]" /><input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search listings" className="w-full bg-transparent text-[12px] outline-none placeholder:text-[#aaa59c]" />{isSearching && <button onClick={() => setSearchQuery('')}><X className="h-3.5 w-3.5 text-[#77736c]" /></button>}</div><button onClick={() => navigate('/filters')} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#10143f] text-[#d7a23a]" aria-label="Open filters"><SlidersHorizontal className="h-4 w-4" /></button></div></div></section>

      <section className="py-10 sm:py-12"><div className="mb-7 flex items-end justify-between gap-4"><div><p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#9a958c]">Browse the exchange</p><h2 className="mt-1 font-display text-[2rem] tracking-[-0.05em]">Recently listed</h2></div>{isFiltered && !loading && <div className="flex items-center gap-3 text-[12px] text-[#77736c]"><span>{filteredListings.length} result{filteredListings.length !== 1 ? 's' : ''}</span><button onClick={resetFilters} className="font-black text-[#c89036]">Clear</button></div>}</div>{loading && <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">{[1, 2, 3, 4, 5, 6, 7, 8].map((i) => <LoadingCard key={i} />)}</div>}{error && !loading && <p className="py-10 text-center text-[13px] text-[#c34f3b]">{error}</p>}{!loading && !error && filteredListings.length === 0 && <div className="border-y border-[#e5e1d8] py-16 text-center"><p className="font-black">{isFiltered ? 'No matching listings' : 'No listings yet'}</p><p className="mt-2 text-[13px] text-[#77736c]">{isFiltered ? 'Try a different category or search.' : 'Be the first to list a gadget.'}</p></div>}{!loading && !error && filteredListings.length > 0 && <div className="grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3 lg:grid-cols-4">{filteredListings.map((item, index) => <ListingCard key={item.id} item={item} navigate={navigate} featured={index === 0} />)}</div>}</section>

      <section className="mb-8 grid border-t border-[#e5e1d8] py-8 sm:grid-cols-3 sm:gap-8"><div className="mb-5 sm:mb-0"><p className="flex items-center gap-2 text-[12px] font-black"><ShieldCheck className="h-4 w-4 text-[#c89036]" /> University email verified</p><p className="mt-2 max-w-[250px] text-[12px] leading-relaxed text-[#77736c]">Every seller confirms their student identity before listing or messaging.</p></div><div className="mb-5 sm:mb-0"><p className="flex items-center gap-2 text-[12px] font-black"><MapPin className="h-4 w-4 text-[#c89036]" /> Meet close to campus</p><p className="mt-2 max-w-[250px] text-[12px] leading-relaxed text-[#77736c]">A simple handoff is usually the safest one.</p></div><button onClick={() => navigate('/sell')} className="flex items-start justify-between text-left text-[12px] font-black hover:text-[#c89036]">Have something to sell? <ChevronRight className="h-4 w-4" /></button></section>
      <DashboardFooter />
      </main>
    </div>
  );
}
