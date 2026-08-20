import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Home as HomeIcon, MessageCircle, PlusCircle, User,
  Package, Heart, Store, Settings, HelpCircle, LogOut, ChevronRight, Star, ShieldAlert,
} from 'lucide-react';
import { apiRequest } from '../lib/api';
import { useUnreadCount } from '../hooks/useUnreadCount';

const MENU_ITEMS = [
  { icon: Package, label: 'My Listings', path: '/my-listings' },
  { icon: Heart, label: 'Saved Items', path: '/saved' },
  { icon: Store, label: 'Vendor Application', path: '/vendor-registration' },
  { icon: Settings, label: 'Account Settings', path: '/settings' },
  { icon: HelpCircle, label: 'Help & Support', path: '/support' },
];

export default function Profile() {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const fullName = currentUser.full_name || 'Not logged in';
  const initials = fullName.split(' ').map(function (w) { return w[0]; }).slice(0, 2).join('').toUpperCase();
  const unreadCount = useUnreadCount();

  const [stats, setStats] = useState({ listingsCount: 0, soldCount: 0, rating: 0 });

  useEffect(function () {
    async function fetchStats() {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const data = await apiRequest('/api/listings/my-stats', {
          headers: { Authorization: 'Bearer ' + token },
        });
        setStats(data.stats);
      } catch (err) {
        // Fail silently, stats just stay at 0
      }
    }
    fetchStats();
  }, []);

  const navItems = [
    { key: 'home', label: 'Home', icon: HomeIcon, path: '/home' },
    { key: 'messages', label: 'Messages', icon: MessageCircle, path: '/messages' },
    { key: 'sell', label: 'Sell', icon: PlusCircle, path: '/sell' },
    { key: 'profile', label: 'Profile', icon: User, path: '/profile' },
  ];

  const handleLogout = function () {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/welcome');
  };

  return (
    <div className="min-h-screen bg-white font-body pb-24">
      <div className="bg-navy px-6 pt-12 pb-8 flex flex-col items-center text-center">
        <div className="w-20 h-20 rounded-full bg-[#F9EFE0] border-2 border-gold flex items-center justify-center font-bold text-gold-deep text-[24px] mb-3">
          {initials || '?'}
        </div>
        <p className="text-white font-semibold text-[19px]">{fullName}</p>

        <div className="flex items-center gap-1.5 mt-2 bg-white/10 px-3 py-1 rounded-full">
          <span className="text-gold text-[11px]">&#10003;</span>
          <span className="text-gold text-[12.5px] font-semibold">
            {currentUser.user_type === 'vendor' ? 'Registered Vendor' : 'Verified UG Student'}
          </span>
        </div>

        <div className="flex items-center gap-8 mt-6">
          <div className="text-center">
            <p className="text-white font-bold text-[16px]">{stats.listingsCount}</p>
            <p className="text-white/50 text-[10.5px]">Listings</p>
          </div>
          <div className="text-center">
            <p className="text-white font-bold text-[16px]">{stats.rating ? stats.rating.toFixed(1) : '\u2014'}</p>
            <p className="text-white/50 text-[10.5px]">Rating</p>
          </div>
          <div className="text-center">
            <p className="text-white font-bold text-[16px]">{stats.soldCount}</p>
            <p className="text-white/50 text-[10.5px]">Sold</p>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-6">
        {MENU_ITEMS.map(function (item) {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              onClick={function () { navigate(item.path); }}
              className="w-full flex items-center gap-3.5 py-4 border-b border-line text-left"
            >
              <Icon className="w-[18px] h-[18px] text-navy shrink-0" strokeWidth={2} />
              <span className="flex-1 text-navy font-semibold text-[14.5px]">{item.label}</span>
              <ChevronRight className="w-4 h-4 text-mute" strokeWidth={2} />
            </button>
          );
        })}

        <button
          onClick={function () { navigate('/admin'); }}
          className="w-full flex items-center gap-3.5 py-4 border-b border-line text-left"
        >
          <ShieldAlert className="w-[18px] h-[18px] text-gold-deep shrink-0" strokeWidth={2} />
          <span className="flex-1 text-gold-deep font-semibold text-[14.5px]">Admin Dashboard</span>
          <ChevronRight className="w-4 h-4 text-mute" strokeWidth={2} />
        </button>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3.5 py-4 border-b border-line text-left"
        >
          <LogOut className="w-[18px] h-[18px] text-red-600 shrink-0" strokeWidth={2} />
          <span className="flex-1 text-red-600 font-semibold text-[14.5px]">Log Out</span>
          <ChevronRight className="w-4 h-4 text-mute" strokeWidth={2} />
        </button>
      </div>

      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-20 bg-navy px-3 pt-2.5 pb-[calc(0.625rem+env(safe-area-inset-bottom))]">
        <div className="max-w-md mx-auto flex items-center justify-around">
          {navItems.map(function (item) {
            const Icon = item.icon;
            const active = item.key === 'profile';
            return (
              <button key={item.key} onClick={function () { navigate(item.path); }} className="relative flex flex-col items-center gap-1 px-3 py-1">
                <div className="relative">
                  <Icon className={'w-[18px] h-[18px] ' + (active ? 'text-gold' : 'text-white/50')} strokeWidth={2.2} />
                  {item.key === 'messages' && unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <span className={'text-[9.5px] font-semibold ' + (active ? 'text-gold' : 'text-white/50')}>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

