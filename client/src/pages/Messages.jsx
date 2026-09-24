import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MessageCircle, ArrowUpRight, BadgeCheck, Clock3, SlidersHorizontal } from 'lucide-react';
import { apiRequest } from '../lib/api';
import { useUnreadCount } from '../hooks/useUnreadCount';
import PageLoader from '../components/PageLoader';

function initials(name) {
  return (name || '?').split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase();
}

function formatTime(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export default function Messages() {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const unreadCount = useUnreadCount();
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    async function fetchConversations() {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      try {
        const data = await apiRequest('/api/messages', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setConversations(data.conversations || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchConversations();
  }, [navigate]);

  const query = searchQuery.trim().toLowerCase();
  const visibleConversations = conversations.filter((convo) => {
    if (!query) return true;
    return [convo.other_user_name, convo.listing_title, convo.last_message_text]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(query));
  });
  const unreadConversations = conversations.filter((convo) => convo.last_sender_id && convo.last_sender_id !== currentUser.id).length;

  if (loading) return <PageLoader />;

  return (
    <div className="min-h-[calc(100vh-72px)] bg-[#fbfaf7] px-5 py-7 font-body text-[#10143f] sm:px-8 lg:px-10 lg:py-10">
      <div className="mx-auto max-w-[1120px]">
        <section className="mb-8 flex flex-col gap-5 border-b border-[#e5e1d8] pb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 text-[10px] font-black uppercase tracking-[0.22em] text-[#c89036]">Your conversations</p>
            <div className="flex items-center gap-3">
              <h1 className="font-body text-[2.25rem] font-black tracking-[-0.045em] sm:text-[3rem]">Messages</h1>
              {unreadCount > 0 && <span className="rounded-full bg-[#10143f] px-2.5 py-1 text-[10px] font-black text-[#d7a23a]">{unreadCount} new</span>}
            </div>
            <p className="mt-2 max-w-[520px] text-[13px] leading-6 text-[#77736c]">Keep track of buyers, sellers, and the gadgets you are arranging to meet up for.</p>
          </div>
          <button onClick={() => navigate('/home')} className="hidden items-center gap-2 self-start rounded-full border border-[#e5e1d8] bg-white px-4 py-2.5 text-[11px] font-black text-[#10143f] transition hover:border-[#c89036] md:flex"><MessageCircle className="h-4 w-4 text-[#c89036]" /> Browse marketplace <ArrowUpRight className="h-3.5 w-3.5" /></button>
        </section>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_260px]">
          <div className="min-w-0">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#aaa59c]">Inbox</p><p className="mt-1 text-[13px] font-bold">{conversations.length} conversation{conversations.length === 1 ? '' : 's'}</p></div><div className="flex items-center gap-2"><div className="flex min-w-0 items-center gap-2 rounded-full border border-[#e5e1d8] bg-white px-4 py-2.5 sm:w-[260px]"><Search className="h-4 w-4 shrink-0 text-[#9a958c]" /><input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search messages" className="w-full bg-transparent text-[12px] font-medium outline-none placeholder:text-[#aaa59c]" /></div><button className="grid h-10 w-10 place-items-center rounded-full border border-[#e5e1d8] bg-white text-[#77736c]" aria-label="Message filters"><SlidersHorizontal className="h-4 w-4" /></button></div></div>

            {error && <div className="rounded-2xl border border-[#f2c9bf] bg-[#fff5f2] px-5 py-4 text-[13px] text-[#c34f3b]">{error}</div>}
            {!error && visibleConversations.length === 0 && <div className="rounded-[24px] border border-dashed border-[#d9d2c6] bg-white px-6 py-20 text-center"><div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-[#f7efdF]"><MessageCircle className="h-5 w-5 text-[#c89036]" /></div><p className="text-[14px] font-black">{query ? 'No matching conversations' : 'No messages yet'}</p><p className="mx-auto mt-2 max-w-[330px] text-[13px] leading-6 text-[#817c72]">{query ? 'Try searching by a seller, listing, or message.' : 'When you message a seller or someone messages you, the conversation will appear here.'}</p></div>}

            {!error && visibleConversations.length > 0 && <div className="overflow-hidden rounded-[24px] border border-[#e5e1d8] bg-white shadow-[0_12px_30px_rgba(16,20,63,0.04)]">{visibleConversations.map((convo) => {
              const needsReply = convo.last_sender_id && convo.last_sender_id !== currentUser.id;
              return <button key={convo.id} onClick={() => navigate(`/messages/thread/${convo.id}`)} className="group flex w-full items-center gap-4 border-b border-[#eeeae3] px-5 py-4 text-left transition last:border-b-0 hover:bg-[#fcfaf5] sm:px-6"><div className="relative grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#f4eee3] text-[12px] font-black text-[#10143f]"><span>{initials(convo.other_user_name)}</span>{needsReply && <span className="absolute -right-1 -top-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-[#d7a23a]" />}</div><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><p className={'truncate text-[14px] tracking-[-0.01em] ' + (needsReply ? 'font-black text-[#10143f]' : 'font-bold text-[#2d3150]')}>{convo.other_user_name || 'Campus Gadget user'}</p><BadgeCheck className="h-3.5 w-3.5 shrink-0 text-[#c89036]" /></div><p className="mt-1 truncate text-[11px] font-bold uppercase tracking-[0.08em] text-[#aaa59c]">{convo.listing_title || 'Marketplace conversation'}</p>{convo.last_message_text && <p className={'mt-1.5 truncate text-[13px] leading-5 ' + (needsReply ? 'font-semibold text-[#3b3b53]' : 'text-[#817c72]')}>{convo.last_message_text}</p>}</div><div className="flex shrink-0 flex-col items-end gap-2">{formatTime(convo.updated_at || convo.last_message_at) && <span className="flex items-center gap-1 text-[10px] font-semibold text-[#aaa59c]"><Clock3 className="h-3 w-3" />{formatTime(convo.updated_at || convo.last_message_at)}</span>}<ArrowUpRight className="h-4 w-4 text-[#c9c3b8] transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#c89036]" /></div></button>;
            })}</div>}
          </div>

          <aside className="hidden rounded-[24px] border border-[#e5e1d8] bg-[#10143f] p-6 text-white lg:block"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#d7a23a]">Safe handoffs</p><h2 className="mt-4 font-body text-[22px] font-black leading-tight tracking-[-0.04em]">Keep every deal close to campus.</h2><p className="mt-4 text-[12px] leading-6 text-white/65">Use messages to agree on the condition, price, and a public meeting point before you hand over anything.</p><div className="mt-7 border-t border-white/15 pt-4"><p className="text-[11px] font-bold text-white/80">Verified student community</p><p className="mt-1 text-[11px] leading-5 text-white/50">Your conversations stay tied to the marketplace.</p></div></aside>
        </section>
      </div>
    </div>
  );
}
