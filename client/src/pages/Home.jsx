import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Search, SlidersHorizontal, Home as HomeIcon, MessageCircle, PlusCircle,
  User, Bell, X, ArrowUpRight, ShieldCheck, MapPin, ChevronRight,
  Bookmark, Settings, HelpCircle, LogOut, Menu, Sparkles, TrendingUp,
  Package, CheckCircle2,
} from 'lucide-react';
import { apiRequest } from '../lib/api';
import { useNotificationCount } from '../hooks/useUnreadCount';
import MonoLogo from '../components/MonoLogo';

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
  if (!dateStr) return 'Recently';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return mins + 'm ago';
  const hours = Math.floor(mins / 60);
  if (hours < 24) return hours + 'h ago';
  const days = Math.floor(hours / 24);
  if (days < 7) return days + 'd ago';
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function Brand() {
  return <div className="flex items-center gap-2.5"><div className="grid h-9 w-9 place-items-center rounded-xl border border-[#e5e1d8] bg-white"><MonoLogo className="h-6 w-6" color="#10143f" /></div><div><p className="text-[12px] font-black uppercase tracking-[0.18em] text-[#10143f]">Verified campus<span className="text-[#c89036]">Gadget</span></p><p className="mt-0.5 text-[9px] text-[#817c72]">Student marketplace</p></div></div>;
}

function ListingCard({ item, navigate, featured = false }) {
  return <button onClick={() => navigate('/listing/' + item.id)} className={'group block w-full text-left ' + (featured ? 'sm:col-span-2' : '')}><div className={'relative mb-3 overflow-hidden bg-[#e9e5dc] ' + (featured ? 'aspect-[1.45] rounded-[24px]' : 'aspect-[1.08] rounded-[20px]')}><img src={item.image_url || fallbackImage(item.id)} alt={item.title} loading="lazy" className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.05]" /><div className="absolute inset-0 bg-gradient-to-t from-[#10143f]/65 via-transparent to-transparent opacity-80" /><span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-black text-[#10143f]">{item.condition || 'Good'}</span><div className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[0.1em] text-white/70">{item.category || 'Gadget'} · {timeAgo(item.created_at)}</p>{featured && <p className="mt-1 text-[17px] font-black leading-tight text-white">{item.title}</p>}</div><span className="grid h-9 w-9 shrink-0 translate-y-2 place-items-center rounded-full bg-[#d7a23a] text-[#10143f] opacity-0 transition duration-200 group-hover:translate-y-0 group-hover:opacity-100"><ArrowUpRight className="h-4 w-4" /></span></div></div><div className="flex items-start justify-between gap-3 px-0.5"><div className="min-w-0"><p className="truncate text-[13px] font-black tracking-[-0.01em] text-[#10143f]">{item.title}</p><p className="mt-1 text-[11px] font-medium text-[#817c72]">{item.condition || 'Good'} condition</p></div><p className="shrink-0 text-[13px] font-black text-[#10143f]">GHS {Number(item.price).toLocaleString()}</p></div></button>;
}

function LoadingCard() {
  return <div><div className="aspect-[1.08] animate-pulse rounded-[20px] bg-[#e9e5dc]" /><div className="mt-3 h-3 w-3/4 animate-pulse rounded bg-[#e9e5dc]" /><div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-[#e9e5dc]" /></div>;
}

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const notificationCount = useNotificationCount();
  const [activeCategory, setActiveCategory] = useState('All');
  const [heroMessage, setHeroMessage] = useState(0);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [advancedFilters, setAdvancedFilters] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    async function fetchListings() {
      try {
        const data = await apiRequest('/api/listings');
        setListings(data.listings || []);
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
    const interval = setInterval(() => setHeroMessage((current) => (current + 1) % HERO_MESSAGES.length), 5000);
    return () => clearInterval(interval);
  }, []);

  const query = searchQuery.trim().toLowerCase();
  const hasAdvancedFilters = advancedFilters && (advancedFilters.categories.length > 0 || advancedFilters.conditions.length > 0 || advancedFilters.minPrice > 0 || advancedFilters.maxPrice < 5000);
  const isFiltered = query.length > 0 || activeCategory !== 'All' || hasAdvancedFilters;
  const filteredListings = listings.filter((item) => {
    const matchesSearch = !query || item.title.toLowerCase().includes(query) || (item.description && item.description.toLowerCase().includes(query)) || (item.category && item.category.toLowerCase().includes(query));
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    let matchesAdvanced = true;
    if (hasAdvancedFilters) {
      const price = Number(item.price);
      matchesAdvanced = (advancedFilters.categories.length === 0 || advancedFilters.categories.includes(item.category)) && (advancedFilters.conditions.length === 0 || advancedFilters.conditions.includes(item.condition)) && price >= advancedFilters.minPrice && price <= advancedFilters.maxPrice;
    }
    return matchesSearch && matchesCategory && matchesAdvanced;
  });

  const featuredPool = filteredListings.length > 0 ? filteredListings : listings;
  const featuredListing = featuredPool.length > 0 ? featuredPool[heroMessage % featuredPool.length] : null;
  const navItems = [
    { key: 'home', label: 'Home', icon: HomeIcon, path: '/home' },
    { key: 'messages', label: 'Messages', icon: MessageCircle, path: '/messages' },
    { key: 'sell', label: 'Sell an item', icon: PlusCircle, path: '/sell' },
    { key: 'saved', label: 'Saved items', icon: Bookmark, path: '/saved' },
    { key: 'profile', label: 'Profile', icon: User, path: '/profile' },
  ];

  function resetFilters() {
    setSearchQuery('');
    setActiveCategory('All');
    setAdvancedFilters(null);
  }

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/welcome');
  }

  const SidebarContent = () => <div className="flex h-full flex-col px-5 py-6"><div className="mb-9 flex items-center justify-between"><Brand /><button onClick={() => setSidebarOpen(false)} className="grid h-8 w-8 place-items-center rounded-lg text-[#817c72] lg:hidden" aria-label="Close menu"><X className="h-4 w-4" /></button></div><p className="mb-3 px-3 text-[9px] font-black uppercase tracking-[0.18em] text-[#aaa59c]">Workspace</p><div className="space-y-1">{navItems.map(({ key, label, icon: Icon, path }) => <button key={key} onClick={() => { navigate(path); setSidebarOpen(false); }} className={'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[12px] font-semibold transition ' + (key === 'home' ? 'bg-[#10143f] text-[#d7a23a] shadow-[0_8px_18px_rgba(16,20,63,0.12)]' : 'text-[#77736c] hover:bg-[#f0ede7] hover:text-[#10143f]')}><Icon className="h-[17px] w-[17px]" strokeWidth={2.1} /><span>{label}</span>{key === 'messages' && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#e36b52]" />}</button>)}</div><p className="mb-3 mt-9 px-3 text-[9px] font-black uppercase tracking-[0.18em] text-[#aaa59c]">Account</p><div className="space-y-1"><button onClick={() => navigate('/settings')} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[12px] font-semibold text-[#77736c] transition hover:bg-[#f0ede7] hover:text-[#10143f]"><Settings className="h-[17px] w-[17px]" />Settings</button><button onClick={() => navigate('/support')} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[12px] font-semibold text-[#77736c] transition hover:bg-[#f0ede7] hover:text-[#10143f]"><HelpCircle className="h-[17px] w-[17px]" />Help & support</button><button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[12px] font-semibold text-[#c34f3b] transition hover:bg-[#fff0ec]"><LogOut className="h-[17px] w-[17px]" />Log out</button></div><div className="mt-auto rounded-2xl bg-[#10143f] p-4 text-white"><Sparkles className="mb-3 h-4 w-4 text-[#d7a23a]" /><p className="text-[12px] font-bold leading-relaxed">Find your next useful gadget on campus.</p><button onClick={() => navigate('/sell')} className="mt-3 text-[10px] font-black uppercase tracking-[0.12em] text-[#d7a23a]">Start selling <ArrowUpRight className="ml-1 inline h-3 w-3" /></button></div></div>;

  return <div className="min-h-screen bg-[#fbfaf7] pb-24 font-body text-[#10143f] lg:pb-8"><style>{'@keyframes heroFade { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }'}</style><aside className="fixed inset-y-0 left-0 z-40 hidden w-[244px] border-r border-[#e5e1d8] bg-[#fbfaf7] lg:block"><SidebarContent /></aside>{sidebarOpen && <><button onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-30 bg-[#10143f]/25 lg:hidden" aria-label="Close navigation" /><aside className="fixed inset-y-0 left-0 z-40 w-[280px] bg-[#fbfaf7] shadow-2xl lg:hidden"><SidebarContent /></aside></>}
    <div className="lg:ml-[244px]"><header className="sticky top-0 z-20 border-b border-[#e5e1d8] bg-[#fbfaf7]/95 backdrop-blur"><div className="flex h-[72px] items-center justify-between gap-4 px-5 sm:px-8 lg:px-10"><div className="flex items-center gap-3"><button onClick={() => setSidebarOpen(true)} className="grid h-9 w-9 place-items-center rounded-xl border border-[#e5e1d8] bg-white lg:hidden" aria-label="Open navigation"><Menu className="h-4 w-4" /></button><div><p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#aaa59c]">Marketplace</p><p className="mt-1 text-[14px] font-black">Home overview</p></div></div><div className="flex items-center gap-2"><button onClick={() => navigate('/notifications')} className="relative grid h-10 w-10 place-items-center rounded-full border border-[#e5e1d8] bg-white" aria-label="Notifications"><Bell className="h-4 w-4" />{notificationCount > 0 && <span className="absolute right-0 top-0 grid h-4 min-w-4 place-items-center rounded-full bg-[#e36b52] px-1 text-[9px] font-black text-white">{notificationCount}</span>}</button><button onClick={() => navigate('/profile')} className="flex items-center gap-2 rounded-full border border-[#e5e1d8] bg-white py-1.5 pl-1.5 pr-3 transition hover:border-[#c89036]"><span className="grid h-8 w-8 place-items-center rounded-full border border-[#e5e1d8] bg-white"><MonoLogo className="h-5 w-5" color="#10143f" /></span><span className="hidden text-left sm:block"><span className="block text-[10px] font-black uppercase tracking-[0.13em] text-[#10143f]">Campus Gadget</span><span className="block text-[9px] text-[#817c72]">My account</span></span></button></div></div></header>
      <main className="mx-auto max-w-[1360px] px-5 sm:px-8 lg:px-10"><section className="grid gap-6 py-8 lg:grid-cols-[1.08fr_0.92fr] lg:gap-8 lg:py-10"><div className="relative overflow-hidden rounded-[30px] border border-[#e5e1d8] bg-white px-6 py-7 text-[#10143f] sm:px-9 sm:py-10"><div className="absolute -right-20 -top-24 h-64 w-64 rounded-full border-[28px] border-[#10143f]/5" /><div className="absolute -bottom-28 right-16 h-52 w-52 rounded-full border-[22px] border-[#d7a23a]/10" /><div className="relative"><div className="mb-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#d7a23a]"><span className="grid h-6 w-6 place-items-center rounded-lg bg-[#d7a23a]/15"><Sparkles className="h-3.5 w-3.5" /></span><span className="text-[#c89036]">University of Ghana</span><span className="mx-1 text-[#10143f]">·</span><span className="text-[#10143f]">student market</span></div><h1 key={heroMessage} className="max-w-[590px] animate-[heroFade_650ms_ease-out] text-[2.7rem] font-black leading-[0.98] tracking-[-0.065em] sm:text-[4.35rem]">{HERO_MESSAGES[heroMessage]}</h1><p className="mt-6 max-w-[430px] text-[13px] leading-6 text-[#77736c]">Buy and sell useful tech with people who share your campus. No strangers, no inflated shop prices.</p><div className="mt-8 flex flex-wrap items-center gap-4"><button onClick={() => navigate('/sell')} className="rounded-full bg-[#d7a23a] px-5 py-3 text-[11px] font-black text-[#10143f] transition hover:bg-white active:scale-[0.98]">List an item <ArrowUpRight className="ml-1 inline h-3.5 w-3.5" /></button><div className="flex items-center gap-2" aria-label="Hero messages">{HERO_MESSAGES.map((message, index) => <button key={message} onClick={() => setHeroMessage(index)} aria-label={'Show message ' + (index + 1)} className={'h-1.5 rounded-full transition-all duration-300 ' + (heroMessage === index ? 'w-8 bg-[#d7a23a]' : 'w-1.5 bg-[#c9c3b8]')} />)}</div></div></div></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1"><div className="relative min-h-[245px] overflow-hidden rounded-[26px] bg-[#e9e5dc] sm:col-span-2 lg:col-span-1">{featuredListing ? <><img src={featuredListing.image_url || fallbackImage(featuredListing.id)} alt={featuredListing.title} className="absolute inset-0 h-full w-full object-cover transition duration-700 hover:scale-105" /><div className="absolute inset-0 bg-gradient-to-t from-[#10143f]/80 via-[#10143f]/5 to-transparent" /><div className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-4"><div><p className="mb-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#d7a23a]">Worth a look</p><p className="max-w-[250px] text-[19px] font-black leading-tight text-white">{featuredListing.title}</p><p className="mt-2 text-[12px] text-white/70">GHS {Number(featuredListing.price).toLocaleString()} · {featuredListing.condition}</p></div><button onClick={() => navigate('/listing/' + featuredListing.id)} className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#d7a23a] text-[#10143f] transition hover:bg-white" aria-label="View featured listing"><ArrowUpRight className="h-5 w-5" /></button></div></> : <div className="flex h-full items-end p-6"><p className="text-2xl font-black">Verified students. Better handoffs.</p></div>}</div><div className="grid grid-cols-1 gap-2 rounded-[22px] border border-[#e5e1d8] bg-white p-2 sm:grid-cols-3"><div className="rounded-xl bg-[#fcfaf5] p-3"><p className="text-[18px] font-black">{"Fresh"}</p><p className="mt-1 text-[9px] font-black uppercase tracking-[0.12em] text-[#aaa59c]">Live listings</p></div><div className="rounded-xl bg-[#fcfaf5] p-3"><p className="text-[18px] font-black">Browse</p><p className="mt-1 text-[9px] font-black uppercase tracking-[0.12em] text-[#aaa59c]">Verified campus</p></div><div className="rounded-xl bg-[#fcfaf5] p-3"><p className="flex items-center gap-1 text-[18px] font-black"><CheckCircle2 className="h-4 w-4 text-[#c89036]" /> Trusted</p><p className="mt-1 text-[9px] font-black uppercase tracking-[0.12em] text-[#aaa59c]">Handoffs</p></div></div></div></section>
      <section className="border-y border-[#e5e1d8] py-5"><div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div className="scrollbar-hide flex gap-2 overflow-x-auto">{CATEGORIES.map((category) => <button key={category} onClick={() => { setActiveCategory(category); setAdvancedFilters(null); }} className={'shrink-0 rounded-full px-4 py-2 text-[11px] font-black transition ' + (activeCategory === category ? 'bg-[#10143f] text-[#d7a23a]' : 'bg-white text-[#77736c] hover:bg-[#f0ede7]')}>{category}</button>)}</div><div className="flex items-center gap-2 lg:w-[360px]"><div className="flex min-w-0 flex-1 items-center gap-2 rounded-full border border-[#e5e1d8] bg-white px-4 py-2.5"><Search className="h-4 w-4 shrink-0 text-[#9a958c]" /><input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search campus gadgets" className="w-full bg-transparent text-[12px] outline-none placeholder:text-[#aaa59c]" />{query && <button onClick={() => setSearchQuery('')} aria-label="Clear search"><X className="h-3.5 w-3.5 text-[#77736c]" /></button>}</div><button onClick={() => navigate('/filters')} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#10143f] text-[#d7a23a]" aria-label="Open filters"><SlidersHorizontal className="h-4 w-4" /></button></div></div></section>
      <section className="py-10 sm:py-12"><div className="mb-7 flex items-end justify-between gap-4"><div><div className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-[#c89036]" /><p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#9a958c]">Fresh from campus</p></div><h2 className="mt-1 text-[2rem] font-black tracking-[-0.05em]">Recently listed</h2></div>{isFiltered && !loading && <div className="flex items-center gap-3 text-[12px] text-[#77736c]"><span>{filteredListings.length} result{filteredListings.length !== 1 ? 's' : ''}</span><button onClick={resetFilters} className="font-black text-[#c89036]">Clear</button></div>}</div>{loading && <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">{[1, 2, 3, 4, 5, 6, 7, 8].map((i) => <LoadingCard key={i} />)}</div>}{error && !loading && <p className="rounded-2xl border border-[#f2c9bf] bg-[#fff5f2] px-5 py-4 text-center text-[13px] text-[#c34f3b]">{error}</p>}{!loading && !error && filteredListings.length === 0 && <div className="border-y border-[#e5e1d8] py-16 text-center"><p className="font-black">{isFiltered ? 'No matching listings' : 'No listings yet'}</p><p className="mt-2 text-[13px] text-[#77736c]">{isFiltered ? 'Try a different category or search.' : 'Be the first to list a gadget.'}</p></div>}{!loading && !error && filteredListings.length > 0 && <div className="grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3 lg:grid-cols-4">{filteredListings.map((item, index) => <ListingCard key={item.id} item={item} navigate={navigate} featured={index === 0} />)}</div>}</section>
      <section className="mb-8 grid gap-4 border-t border-[#e5e1d8] py-8 sm:grid-cols-3"><div className="rounded-2xl bg-white p-4"><ShieldCheck className="mb-3 h-5 w-5 text-[#c89036]" /><p className="text-[12px] font-black">University email verified</p><p className="mt-2 text-[11px] leading-5 text-[#77736c]">Every seller confirms their student identity before listing.</p></div><div className="rounded-2xl bg-white p-4"><MapPin className="mb-3 h-5 w-5 text-[#c89036]" /><p className="text-[12px] font-black">Meet close to campus</p><p className="mt-2 text-[11px] leading-5 text-[#77736c]">A familiar public handoff is usually the safest one.</p></div><button onClick={() => navigate('/sell')} className="group rounded-2xl bg-[#f7efdF] p-4 text-left transition hover:bg-[#f1e4ca]"><Package className="mb-3 h-5 w-5 text-[#c89036]" /><p className="flex items-center justify-between text-[12px] font-black">Have something to sell? <ChevronRight className="h-4 w-4 transition group-hover:translate-x-1" /></p><p className="mt-2 text-[11px] leading-5 text-[#77736c]">Put it in front of verified students today.</p></button></section>
      </main></div><nav className="fixed inset-x-0 bottom-0 z-20 border-t border-[#25284b] bg-[#10143f] px-3 pb-[calc(0.6rem+env(safe-area-inset-bottom))] pt-2 lg:hidden"><div className="mx-auto flex max-w-md items-center justify-around">{navItems.slice(0, 4).map(({ key, label, icon: Icon, path }) => <button key={key} onClick={() => navigate(path)} className={'flex flex-col items-center gap-1 px-3 py-1 ' + (key === 'home' ? 'text-[#d7a23a]' : 'text-white/50')}><Icon className="h-[18px] w-[18px]" /><span className="text-[9px] font-bold">{key === 'sell' ? 'Sell' : label}</span></button>)}</div></nav></div>;
}
