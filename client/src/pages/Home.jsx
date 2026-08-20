import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Search, SlidersHorizontal, Home as HomeIcon, MessageCircle,
  PlusCircle, User, ShieldCheck, Bell, X,
} from 'lucide-react';
import { apiRequest } from '../lib/api';
import { useNotificationCount } from '../hooks/useUnreadCount';

const CATEGORIES = ['All', 'Phones', 'Laptops', 'Tablets', 'Accessories', 'Audio'];

const HERO_SLIDES = [
  {
    tag: "Editor's pick \u00b7 Verified sellers only",
    headline: 'Campus favourites,',
    headlineAccent: 'this week.',
    sub: '142 verified students are online right now trading gadgets across Legon.',
  },
  {
    tag: 'Why CampusGadget',
    headline: 'Every seller is a',
    headlineAccent: 'verified student.',
    sub: 'One-time password verification through your university email \u2014 no strangers, no scams.',
  },
];

function fallbackImage(id) {
  return 'https://picsum.photos/seed/listing' + id + '/400/400';
}

function timeAgo(dateStr) {
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

function ProductCard(props) {
  const item = props.item;
  const navigate = props.navigate;
  return (
    <button
      onClick={function () { navigate('/listing/' + item.id); }}
      className="w-44 sm:w-52 lg:w-56 shrink-0 text-left snap-start group"
    >
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-line mb-2.5">
        <img
          src={item.image_url || fallbackImage(item.id)}
          alt={item.title}
          className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
          loading="lazy"
        />
        <span className="absolute top-2.5 left-2.5 text-[10px] font-semibold tracking-wide uppercase bg-white/90 text-navy px-2 py-1 rounded-full">
          {item.condition}
        </span>
      </div>
      <p className="text-[13.5px] font-semibold text-navy leading-snug line-clamp-1">
        {item.title}
      </p>
      <div className="flex items-center gap-1.5 mt-0.5">
        <p className="text-[14px] font-bold text-navy">
          GHS {Number(item.price).toLocaleString()}
        </p>
        <span className="text-mute text-[11px]">&middot; {timeAgo(item.created_at)}</span>
      </div>
    </button>
  );
}

function SkeletonCard() {
  return (
    <div className="w-44 sm:w-52 lg:w-56 shrink-0">
      <div className="aspect-square rounded-2xl bg-line animate-pulse mb-2.5" />
      <div className="h-3.5 bg-line rounded animate-pulse mb-2 w-3/4" />
      <div className="h-3.5 bg-line rounded animate-pulse w-1/2" />
    </div>
  );
}

function ScrollRow(props) {
  if (props.items.length === 0) return null;
  return (
    <section className="mb-9">
      <div className="flex items-end justify-between px-4 sm:px-6 lg:px-10 mb-3.5">
        <h2 className="text-[17px] font-bold text-navy">{props.title}</h2>
      </div>
      <div className="flex gap-3.5 overflow-x-auto px-4 sm:px-6 lg:px-10 pb-1 snap-x snap-mandatory scrollbar-hide">
        {props.items.map(function (item) {
          return <ProductCard key={item.id} item={item} navigate={props.navigate} />;
        })}
      </div>
    </section>
  );
}

function SkeletonRow() {
  return (
    <section className="mb-9">
      <div className="px-4 sm:px-6 lg:px-10 mb-3.5">
        <div className="h-4 bg-line rounded animate-pulse w-32" />
      </div>
      <div className="flex gap-3.5 overflow-x-auto px-4 sm:px-6 lg:px-10 pb-1 scrollbar-hide">
        {[1, 2, 3, 4].map(function (i) { return <SkeletonCard key={i} />; })}
      </div>
    </section>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeCategory, setActiveCategory] = useState('All');
  const [slideIndex, setSlideIndex] = useState(0);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [advancedFilters, setAdvancedFilters] = useState(null);
  const notificationCount = useNotificationCount();

  useEffect(function () {
    const interval = setInterval(function () {
      setSlideIndex(function (prev) { return (prev + 1) % HERO_SLIDES.length; });
    }, 4500);
    return function () { clearInterval(interval); };
  }, []);

  useEffect(function () {
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

  // Pick up filters passed from the Filters screen (price range, condition, categories)
  useEffect(function () {
    if (location.state && location.state.filters) {
      setAdvancedFilters(location.state.filters);
      setActiveCategory('All');
      // Clear the navigation state so refreshing the page doesn't re-apply stale filters
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const slide = HERO_SLIDES[slideIndex];

  const query = searchQuery.trim().toLowerCase();
  const isSearching = query.length > 0;
  const isCategoryFiltered = activeCategory !== 'All';
  const hasAdvancedFilters = advancedFilters && (
    advancedFilters.categories.length > 0 ||
    advancedFilters.conditions.length > 0 ||
    advancedFilters.minPrice > 0 ||
    advancedFilters.maxPrice < 5000
  );
  const isFiltered = isSearching || isCategoryFiltered || hasAdvancedFilters;

  const filteredListings = listings.filter(function (item) {
    const matchesSearch = !isSearching ||
      item.title.toLowerCase().includes(query) ||
      (item.description && item.description.toLowerCase().includes(query)) ||
      (item.category && item.category.toLowerCase().includes(query));

    const matchesChipCategory = !isCategoryFiltered || item.category === activeCategory;

    let matchesAdvanced = true;
    if (hasAdvancedFilters) {
      const price = Number(item.price);
      const matchesCategory = advancedFilters.categories.length === 0 || advancedFilters.categories.includes(item.category);
      const matchesCondition = advancedFilters.conditions.length === 0 || advancedFilters.conditions.includes(item.condition);
      const matchesPrice = price >= advancedFilters.minPrice && price <= advancedFilters.maxPrice;
      matchesAdvanced = matchesCategory && matchesCondition && matchesPrice;
    }

    return matchesSearch && matchesChipCategory && matchesAdvanced;
  });

  function resetFilters() {
    setSearchQuery('');
    setActiveCategory('All');
    setAdvancedFilters(null);
  }

  const newThisWeek = filteredListings.slice(0, 6);
  const underFiveHundred = filteredListings.filter(function (item) { return Number(item.price) < 500; });
  const rest = filteredListings.filter(function (item) {
    return newThisWeek.indexOf(item) === -1 && underFiveHundred.indexOf(item) === -1;
  });

  const navItems = [
    { key: 'home', label: 'Home', icon: HomeIcon, path: '/home' },
    { key: 'messages', label: 'Messages', icon: MessageCircle, path: '/messages' },
    { key: 'sell', label: 'Sell', icon: PlusCircle, path: '/sell' },
    { key: 'profile', label: 'Profile', icon: User, path: '/profile' },
  ];

  let filterSummary = '';
  if (hasAdvancedFilters) {
    const parts = [];
    if (advancedFilters.categories.length > 0) parts.push(advancedFilters.categories.join(', '));
    if (advancedFilters.conditions.length > 0) parts.push(advancedFilters.conditions.join(', '));
    if (advancedFilters.minPrice > 0 || advancedFilters.maxPrice < 5000) {
      parts.push('GHS ' + advancedFilters.minPrice + '\u2013' + advancedFilters.maxPrice);
    }
    filterSummary = parts.join(' \u00b7 ');
  }

  return (
    <div className="min-h-screen bg-paper pb-24 lg:pb-10 font-body">
      <header className="sticky top-0 z-20 bg-paper/95 backdrop-blur-sm pt-5 pb-2.5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[10px] tracking-[0.2em] font-bold">
                <span className="text-navy">CAMPUS</span>
                <span className="text-gold-deep">GADGET</span>
              </p>
              <h1 className="font-display text-[1.35rem] font-semibold text-navy leading-none mt-0.5">
                Hey there
              </h1>
            </div>

            <div className="flex items-center">
              <button
                onClick={function () { navigate('/notifications'); }}
                className="relative w-10 h-10 rounded-full bg-white border border-line flex items-center justify-center mr-2"
              >
                <Bell className="w-4 h-4 text-navy" strokeWidth={2.2} />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                    {notificationCount}
                  </span>
                )}
              </button>

              <nav className="hidden lg:flex items-center gap-1">
                {navItems.map(function (item) {
                  const Icon = item.icon;
                  const active = item.key === 'home';
                  return (
                    <button
                      key={item.key}
                      onClick={function () { navigate(item.path); }}
                      className={'flex items-center gap-2 px-4 py-2.5 rounded-full text-[13.5px] font-semibold transition-colors ' + (active ? 'bg-navy text-gold' : 'text-slate hover:bg-navy/5')}
                    >
                      <Icon className="w-4 h-4" strokeWidth={2.2} />
                      {item.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="flex-1 flex items-center gap-2.5 bg-white border border-line rounded-full px-4 py-2.5">
              <Search className="w-4 h-4 text-mute shrink-0" strokeWidth={2.2} />
              <input
                type="text"
                value={searchQuery}
                onChange={function (e) { setSearchQuery(e.target.value); }}
                placeholder="Search laptops, phones, chargers..."
                className="w-full bg-transparent outline-none text-[13.5px] text-navy placeholder-mute"
              />
              {isSearching && (
                <button onClick={function () { setSearchQuery(''); }} className="shrink-0">
                  <X className="w-3.5 h-3.5 text-mute" strokeWidth={2.5} />
                </button>
              )}
            </div>
            <button
              onClick={function () { navigate('/filters'); }}
              className={'shrink-0 w-10 h-10 rounded-full flex items-center justify-center active:scale-95 transition relative ' + (hasAdvancedFilters ? 'bg-gold' : 'bg-navy')}
              aria-label="Open filters"
            >
              <SlidersHorizontal className={'w-4 h-4 ' + (hasAdvancedFilters ? 'text-navy' : 'text-gold')} strokeWidth={2.2} />
              {hasAdvancedFilters && (
                <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500 border-2 border-paper" />
              )}
            </button>
          </div>
        </div>
      </header>

      {!isSearching && !hasAdvancedFilters && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 mt-3 mb-8">
          <div className="relative w-full h-[50vh] min-h-[320px] max-h-[500px] rounded-[2rem] overflow-hidden bg-gradient-to-br from-navy-light via-navy to-navy-deep text-left">
            <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_75%_20%,rgba(227,163,53,0.35),transparent_55%)]" />
            <div key={slideIndex} className="relative h-full flex flex-col justify-end p-7 sm:p-10 animate-[slideFade_0.6s_ease-out]">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-9 h-9 rounded-full border-2 border-dashed border-gold flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4 text-gold" strokeWidth={2.2} />
                </div>
                <span className="text-[11px] font-bold tracking-[0.15em] text-gold uppercase">
                  {slide.tag}
                </span>
              </div>
              <h2 className="font-display text-white text-[2rem] sm:text-[2.6rem] leading-[1.05] font-semibold max-w-xl">
                {slide.headline} <span className="text-gold">{slide.headlineAccent}</span>
              </h2>
              <p className="text-white/70 text-[14.5px] mt-4 max-w-md">
                {slide.sub}
              </p>
            </div>

            <div className="absolute top-6 right-6 sm:right-9 flex gap-1.5">
              {HERO_SLIDES.map(function (_, i) {
                return (
                  <button
                    key={i}
                    onClick={function () { setSlideIndex(i); }}
                    className={'h-1.5 rounded-full transition-all duration-300 ' + (i === slideIndex ? 'w-6 bg-gold' : 'w-1.5 bg-white/30')}
                    aria-label={'Go to slide ' + (i + 1)}
                  />
                );
              })}
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pt-4 pb-1 scrollbar-hide">
            {CATEGORIES.map(function (cat) {
              return (
                <button
                  key={cat}
                  onClick={function () { setActiveCategory(cat); setAdvancedFilters(null); }}
                  className={'shrink-0 px-4 py-2 rounded-full text-[13px] font-semibold border transition-colors ' + (activeCategory === cat ? 'bg-navy text-gold border-navy' : 'bg-white text-navy border-line')}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {isFiltered && !loading && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 mt-3 mb-6 flex items-center justify-between gap-3">
          <p className="text-mute text-[13px]">
            {filteredListings.length} result{filteredListings.length !== 1 ? 's' : ''}
            {isSearching ? ' for "' + searchQuery + '"' : ''}
            {isCategoryFiltered && !isSearching ? ' in ' + activeCategory : ''}
            {hasAdvancedFilters ? ' \u00b7 ' + filterSummary : ''}
          </p>
          <button onClick={resetFilters} className="text-gold-deep text-[13px] font-semibold shrink-0">
            Clear
          </button>
        </div>
      )}

      {loading && (
        <>
          <SkeletonRow />
          <SkeletonRow />
        </>
      )}

      {error && !loading && (
        <p className="text-center text-red-500 text-[14px] py-10">{error}</p>
      )}

      {!loading && !error && filteredListings.length === 0 && (
        <div className="text-center py-16 px-6">
          <p className="text-navy font-semibold mb-2">
            {isFiltered ? 'No matches found' : 'No listings yet'}
          </p>
          <p className="text-mute text-[13.5px] mb-5">
            {isFiltered ? 'Try adjusting your filters or search.' : 'Be the first to list a gadget for sale.'}
          </p>
          {isFiltered ? (
            <button
              onClick={resetFilters}
              className="bg-navy text-gold font-bold text-[13px] px-5 py-3 rounded-full"
            >
              CLEAR FILTERS
            </button>
          ) : (
            <button
              onClick={function () { navigate('/sell'); }}
              className="bg-navy text-gold font-bold text-[13px] px-5 py-3 rounded-full"
            >
              LIST A GADGET
            </button>
          )}
        </div>
      )}

      {!loading && !error && filteredListings.length > 0 && isFiltered && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-10">
          {filteredListings.map(function (item) {
            return <ProductCard key={item.id} item={item} navigate={navigate} />;
          })}
        </div>
      )}

      {!loading && !error && filteredListings.length > 0 && !isFiltered && (
        <>
          <ScrollRow title="New this week" items={newThisWeek} navigate={navigate} />
          <ScrollRow title="Under GHS 500" items={underFiveHundred} navigate={navigate} />
          <ScrollRow title="More listings" items={rest} navigate={navigate} />
        </>
      )}

      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-20 bg-navy px-3 pt-2.5 pb-[calc(0.625rem+env(safe-area-inset-bottom))]">
        <div className="max-w-md mx-auto flex items-center justify-around">
          {navItems.map(function (item) {
            const Icon = item.icon;
            const active = item.key === 'home';
            return (
              <button key={item.key} onClick={function () { navigate(item.path); }} className="flex flex-col items-center gap-1 px-3 py-1">
                <Icon className={'w-[18px] h-[18px] ' + (active ? 'text-gold' : 'text-white/50')} strokeWidth={2.2} />
                <span className={'text-[9.5px] font-semibold ' + (active ? 'text-gold' : 'text-white/50')}>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

