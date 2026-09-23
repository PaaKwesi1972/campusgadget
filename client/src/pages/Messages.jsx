import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ArrowUpRight, Home as HomeIcon, MessageCircle,
  PlusCircle, Search, User, X, ShieldCheck,
} from 'lucide-react';
import { apiRequest } from '../lib/api';
import { useUnreadCount } from '../hooks/useUnreadCount';
import PageLoader from '../components/PageLoader';

function initials(name) {
  return (name || '?').split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase();
}

function relativeTime(dateString) {
  if (!dateString) return '';
  const minutes = Math.floor((Date.now() - new Date(dateString).getTime()) / 60000);
  if (minutes < 1) return 'now';
  if (minutes < 60) return minutes + 'm';
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return hours + 'h';
  const days = Math.floor(hours / 24);
  if (days < 7) return days + 'd';
  return new Date(dateString).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export default function Messages() {
  const navigate = useNavigate();
  const unreadCount = useUnreadCount();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    async function fetchConversations() {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      try {
        const data = await apiRequest('/api/messages', { headers: { Authorization: `Bearer ${token}` } });
        setConversations(data.conversations);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchConversations();
  }, [navigate]);

  const filteredConversations = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return conversations.filter((conversation) => {
      const needsReply = conversation.last_sender_id && conversation.last_sender_id !== currentUser.id;
      const matchesUnread = !showUnreadOnly || needsReply;
      const matchesQuery = !normalized || [conversation.other_user_name, conversation.listing_title, conversation.last_message_text].some((value) => value?.toLowerCase().includes(normalized));
      return matchesUnread && matchesQuery;
    });
  }, [conversations, currentUser.id, query, showUnreadOnly]);

  const navItems = [
    { key: 'home', label: 'Home', icon: HomeIcon, path: '/home' },
    { key: 'messages', label: 'Messages', icon: MessageCircle, path: '/messages' },
    { key: 'sell', label: 'Sell', icon: PlusCircle, path: '/sell' },
    { key: 'profile', label: 'Profile', icon: User, path: '/profile' },
  ];

  if (loading) return <PageLoader />;

  return (
    <div className="min-h-screen bg-[#fbfaf7] pb-24 font-body text-[#10143f] lg:pb-10">
      <header className="border-b border-[#e5e1d8] bg-[#fbfaf7]">
        <div className="mx-auto flex h-[72px] max-w-[1080px] items-center justify-between px-5 sm:px-8 lg:px-12">
          <button onClick={() => navigate('/home')} className="flex items-center gap-3"><ArrowLeft className="h-5 w-5" /><span className="hidden text-[12px] font-semibold sm:inline">Back to browse</span></button>
          <button onClick={() => navigate('/home')} className="text-[11px] font-black uppercase tracking-[0.2em]">Campus<span className="text-[#c89036]">Gadget</span></button>
          <button onClick={() => navigate('/profile')} className="grid h-10 w-10 place-items-center rounded-full bg-[#10143f] text-[11px] font-black text-[#d7a23a]">CG</button>
        </div>
      </header>

      <main className="mx-auto max-w-[1080px] px-5 py-9 sm:px-8 sm:py-12 lg:px-12 lg:py-16">
        <div className="mb-9 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between"><div><p className="mb-3 text-[10px] font-black uppercase tracking-[0.22em] text-[#c89036]">Your inbox</p><h1 className="font-display text-[3rem] leading-none tracking-[-0.065em] sm:text-[4rem]">Messages</h1><p className="mt-4 max-w-md text-[14px] leading-7 text-[#77736c]">Keep conversations about listings in one place, from the first question to the handoff.</p></div><div className="flex items-center gap-2 text-[12px] text-[#77736c]"><ShieldCheck className="h-4 w-4 text-[#a77b2e]" /> Campus conversations stay close</div></div>

        <div className="mb-7 flex flex-col gap-3 border-y border-[#e5e1d8] py-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-2"><button onClick={() => setShowUnreadOnly(false)} className={'rounded-full px-4 py-2 text-[11px] font-black ' + (!showUnreadOnly ? 'bg-[#10143f] text-[#d7a23a]' : 'bg-white text-[#77736c]')}>All conversations</button><button onClick={() => setShowUnreadOnly(true)} className={'rounded-full px-4 py-2 text-[11px] font-black ' + (showUnreadOnly ? 'bg-[#10143f] text-[#d7a23a]' : 'bg-white text-[#77736c]')}>Needs reply {unreadCount > 0 && <span className="ml-1">· {unreadCount}</span>}</button></div><div className="flex items-center gap-2 rounded-full border border-[#e5e1d8] bg-white px-4 py-2.5 sm:w-[280px]"><Search className="h-4 w-4 shrink-0 text-[#9a958c]" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search messages" className="w-full bg-transparent text-[12px] outline-none placeholder:text-[#aaa59c]" />{query && <button onClick={() => setQuery('')}><X className="h-3.5 w-3.5 text-[#77736c]" /></button>}</div></div>

        {error && <div className="border-l-2 border-[#c34f3b] bg-[#fff2ef] px-4 py-3 text-[13px] text-[#a43b2d]">{error}</div>}
        {!error && conversations.length === 0 && <div className="border-y border-[#e5e1d8] py-20 text-center"><MessageCircle className="mx-auto mb-5 h-6 w-6 text-[#c89036]" /><p className="font-black">No conversations yet</p><p className="mx-auto mt-2 max-w-xs text-[13px] leading-6 text-[#77736c]">When you message a seller or someone messages you, the conversation will appear here.</p><button onClick={() => navigate('/home')} className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#10143f] px-5 py-3 text-[12px] font-black text-[#d7a23a]">Browse listings <ArrowUpRight className="h-4 w-4" /></button></div>}
        {!error && conversations.length > 0 && filteredConversations.length === 0 && <div className="border-y border-[#e5e1d8] py-16 text-center"><p className="font-black">No matching conversations</p><p className="mt-2 text-[13px] text-[#77736c]">Try another name, listing, or filter.</p></div>}
        {!error && filteredConversations.length > 0 && <div className="overflow-hidden border-y border-[#e5e1d8] bg-white">{filteredConversations.map((conversation) => {
          const needsReply = conversation.last_sender_id && conversation.last_sender_id !== currentUser.id;
          return <button key={conversation.id} onClick={() => navigate(`/messages/thread/${conversation.id}`)} className="group flex w-full items-center gap-4 border-b border-[#eeeae2] px-4 py-5 text-left transition last:border-b-0 hover:bg-[#fdf9f1] sm:px-6"><div className={'relative grid h-12 w-12 shrink-0 place-items-center rounded-full text-[13px] font-black ' + (needsReply ? 'bg-[#f1e8d2] text-[#a77b2e]' : 'bg-[#ece9e2] text-[#77736c]')}>{initials(conversation.other_user_name)}{needsReply && <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-white bg-[#c89036]" />}</div><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-3"><p className={'truncate text-[14px] ' + (needsReply ? 'font-black' : 'font-bold')}>{conversation.other_user_name}</p><span className="shrink-0 text-[10px] text-[#aaa59c]">{relativeTime(conversation.last_message_at || conversation.updated_at)}</span></div><p className="mt-1 truncate text-[11px] font-semibold text-[#c89036]">{conversation.listing_title}</p><p className={'mt-1 truncate text-[13px] ' + (needsReply ? 'font-semibold text-[#10143f]' : 'text-[#817c72]')}>{conversation.last_message_text || 'Open conversation'}</p></div><ArrowUpRight className="h-4 w-4 shrink-0 text-[#c9c3b8] transition group-hover:text-[#c89036]" /></button>;
        })}</div>}

        <footer className="mt-12 border-t border-[#e5e1d8] pt-5 text-[11px] text-[#aaa59c]">© {new Date().getFullYear()} CampusGadget · Messages for verified students.</footer>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-[#25284b] bg-[#10143f] px-3 pb-[calc(0.6rem+env(safe-area-inset-bottom))] pt-2 lg:hidden"><div className="mx-auto flex max-w-md items-center justify-around">{navItems.map(({ key, label, icon: Icon, path }) => <button key={key} onClick={() => navigate(path)} className={'relative flex flex-col items-center gap-1 px-3 py-1 ' + (key === 'messages' ? 'text-[#d7a23a]' : 'text-white/50')}><div className="relative"><Icon className="h-[18px] w-[18px]" />{key === 'messages' && unreadCount > 0 && <span className="absolute -right-2 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-[#e36b52] px-1 text-[9px] font-black text-white">{unreadCount}</span>}</div><span className="text-[9px] font-bold">{label}</span></button>)}</div></nav>
    </div>
  );
}

