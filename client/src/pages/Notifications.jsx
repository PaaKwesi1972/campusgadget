import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, MessageCircle, Star, ArrowUpRight, CheckCheck, Sparkles, ShieldCheck } from 'lucide-react';
import { apiRequest } from '../lib/api';
import PageLoader from '../components/PageLoader';

function timeAgo(dateStr) {
  if (!dateStr) return 'Recently';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function isUnread(notification) {
  return notification.read === false || notification.is_read === false || notification.unread === true;
}

export default function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    async function fetchNotifications() {
      const token = localStorage.getItem('token');
      if (!token) { navigate('/login'); return; }
      try {
        const data = await apiRequest('/api/notifications', { headers: { Authorization: `Bearer ${token}` } });
        setNotifications(data.notifications || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchNotifications();
  }, [navigate]);

  function handleNotificationClick(notification) {
    if (notification.type === 'message') navigate(`/messages/${notification.related_id}`);
    else if (notification.type === 'review' && notification.related_id) navigate(`/listing/${notification.related_id}/review`);
  }

  if (loading) return <PageLoader />;

  const unreadCount = notifications.filter(isUnread).length;
  const visibleNotifications = filter === 'unread' ? notifications.filter(isUnread) : notifications;
  const today = visibleNotifications.filter((notification) => Date.now() - new Date(notification.created_at).getTime() < 86400000);
  const older = visibleNotifications.filter((notification) => Date.now() - new Date(notification.created_at).getTime() >= 86400000);
  const NotificationRow = ({ notification }) => {
    const unread = isUnread(notification);
    const isReview = notification.type === 'review';
    const Icon = isReview ? Star : MessageCircle;
    return <button onClick={() => handleNotificationClick(notification)} className={'group flex w-full items-start gap-4 border-b border-[#eeeae3] px-5 py-5 text-left transition last:border-b-0 sm:px-6 ' + (unread ? 'bg-[#fffdf8]' : 'bg-white hover:bg-[#fcfaf5]')}><span className={'relative grid h-11 w-11 shrink-0 place-items-center rounded-2xl ' + (isReview ? 'bg-[#f7efdF] text-[#c89036]' : 'bg-[#eef0fb] text-[#10143f]')}>{unread && <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-white bg-[#d7a23a]" />}<Icon className="h-4 w-4" fill={isReview ? 'currentColor' : 'none'} /></span><span className="min-w-0 flex-1"><span className={'block text-[13px] leading-5 ' + (unread ? 'font-black text-[#10143f]' : 'font-bold text-[#353852]')}>{notification.title}</span>{notification.body && <span className="mt-1 block line-clamp-2 text-[12px] leading-5 text-[#817c72]">{notification.body}</span>}<span className="mt-2 block text-[10px] font-bold uppercase tracking-[0.1em] text-[#aaa59c]">{timeAgo(notification.created_at)}</span></span><ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-[#c9c3b8] transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#c89036]" /></button>;
  };

  return <div className="min-h-[calc(100vh-72px)] bg-[#fbfaf7] px-5 py-7 font-body text-[#10143f] sm:px-8 lg:px-10 lg:py-10"><div className="mx-auto max-w-[1120px]"><section className="mb-8 flex flex-col gap-5 border-b border-[#e5e1d8] pb-8 md:flex-row md:items-end md:justify-between"><div><p className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-[#c89036]"><Bell className="h-3.5 w-3.5" /> Your updates</p><div className="flex items-center gap-3"><h1 className="font-body text-[2.25rem] font-black tracking-[-0.05em] sm:text-[3rem]">Notifications</h1>{unreadCount > 0 && <span className="rounded-full bg-[#10143f] px-2.5 py-1 text-[10px] font-black text-[#d7a23a]">{unreadCount} new</span>}</div><p className="mt-2 max-w-[540px] text-[13px] leading-6 text-[#77736c]">Stay up to date with messages, reviews, and activity around your listings.</p></div><button onClick={() => navigate('/messages')} className="hidden items-center gap-2 self-start rounded-full border border-[#e5e1d8] bg-white px-4 py-2.5 text-[11px] font-black md:flex"><MessageCircle className="h-4 w-4 text-[#c89036]" /> Open messages <ArrowUpRight className="h-3.5 w-3.5" /></button></section><section className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_260px]"><div><div className="mb-4 flex items-center justify-between"><div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#aaa59c]">Activity feed</p><p className="mt-1 text-[13px] font-bold">{visibleNotifications.length} update{visibleNotifications.length === 1 ? '' : 's'}</p></div><div className="flex rounded-full border border-[#e5e1d8] bg-white p-1"><button onClick={() => setFilter('all')} className={'rounded-full px-3 py-1.5 text-[10px] font-black ' + (filter === 'all' ? 'bg-[#10143f] text-[#d7a23a]' : 'text-[#817c72]')}>All</button><button onClick={() => setFilter('unread')} className={'rounded-full px-3 py-1.5 text-[10px] font-black ' + (filter === 'unread' ? 'bg-[#10143f] text-[#d7a23a]' : 'text-[#817c72]')}>Unread</button></div></div>{error && <div className="rounded-2xl border border-[#f2c9bf] bg-[#fff5f2] px-5 py-4 text-[13px] text-[#c34f3b]">{error}</div>}{!error && visibleNotifications.length === 0 && <div className="rounded-[24px] border border-dashed border-[#d9d2c6] bg-white px-6 py-20 text-center"><div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-[#f7efdF]"><CheckCheck className="h-5 w-5 text-[#c89036]" /></div><p className="text-[14px] font-black">{filter === 'unread' ? 'You are all caught up' : 'No notifications yet'}</p><p className="mx-auto mt-2 max-w-[330px] text-[13px] leading-6 text-[#817c72]">{filter === 'unread' ? 'There are no unread updates waiting for you.' : 'Messages and reviews will appear here as they come in.'}</p></div>}{!error && today.length > 0 && <div className="mb-6 overflow-hidden rounded-[24px] border border-[#e5e1d8] bg-white shadow-[0_12px_30px_rgba(16,20,63,0.04)]"><div className="border-b border-[#eeeae3] px-5 py-3 sm:px-6"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#c89036]">Today</p></div>{today.map((notification) => <NotificationRow key={notification.id} notification={notification} />)}</div>}{!error && older.length > 0 && <div className="overflow-hidden rounded-[24px] border border-[#e5e1d8] bg-white"><div className="border-b border-[#eeeae3] px-5 py-3 sm:px-6"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#aaa59c]">Earlier</p></div>{older.map((notification) => <NotificationRow key={notification.id} notification={notification} />)}</div>}</div><aside className="hidden h-fit rounded-[24px] bg-[#10143f] p-6 text-white lg:block"><Sparkles className="h-5 w-5 text-[#d7a23a]" /><h2 className="mt-4 text-[21px] font-black leading-tight tracking-[-0.04em]">Never miss a good handoff.</h2><p className="mt-4 text-[12px] leading-6 text-white/65">Reply promptly, confirm the details, and keep conversations inside Campus Gadget.</p><div className="mt-7 flex gap-2 border-t border-white/15 pt-4"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#d7a23a]" /><p className="text-[11px] leading-5 text-white/55">Notifications help keep your marketplace activity organized.</p></div></aside></section></div></div>;
}
