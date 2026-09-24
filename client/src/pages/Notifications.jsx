import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, Bell, MessageCircle, Star } from 'lucide-react';
import { apiRequest } from '../lib/api';
import PageLoader from '../components/PageLoader';
import DashboardSidebar, { DashboardFooter } from '../components/DashboardSidebar';

function timeAgo(dateString) {
  const diff = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return minutes + ' min ago';
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return hours + 'h ago';
  const days = Math.floor(hours / 24);
  if (days < 7) return days + 'd ago';
  return new Date(dateString).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export default function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchNotifications() {
      const token = localStorage.getItem('token');
      if (!token) { navigate('/login'); return; }
      try {
        const data = await apiRequest('/api/notifications', { headers: { Authorization: `Bearer ${token}` } });
        setNotifications(data.notifications);
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

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#fbfaf7] pb-24 font-body text-[#10143f] lg:pb-10 lg:pl-64">
      <DashboardSidebar active="notifications" />
      <header className="border-b border-[#e5e1d8] bg-[#fbfaf7]"><div className="mx-auto flex h-[72px] max-w-[920px] items-center justify-between px-5 sm:px-8 lg:px-12"><button onClick={() => navigate(-1)} className="flex items-center gap-3"><ArrowLeft className="h-5 w-5" /><span className="hidden text-[12px] font-semibold sm:inline">Back</span></button><p className="text-[11px] font-black uppercase tracking-[0.2em]">Campus<span className="text-[#c89036]">Gadget</span></p><div className="grid h-10 w-10 place-items-center rounded-full bg-[#f1e8d2] text-[#a77b2e]"><Bell className="h-4 w-4" /></div></div></header>

      <main className="mx-auto max-w-[920px] px-5 py-9 sm:px-8 sm:py-12 lg:px-12 lg:py-16"><div className="mb-9 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="mb-3 text-[10px] font-black uppercase tracking-[0.22em] text-[#c89036]">Activity center</p><h1 className="font-display text-[3rem] leading-none tracking-[-0.065em] sm:text-[4rem]">Notifications</h1><p className="mt-4 max-w-md text-[14px] leading-7 text-[#77736c]">A quiet record of messages, reviews, and the things happening around your listings.</p></div><span className="flex items-center gap-2 text-[11px] text-[#817c72]"><span className="h-2 w-2 rounded-full bg-[#c89036]" /> Your campus activity</span></div>

        {error && <div className="border-l-2 border-[#c34f3b] bg-[#fff2ef] px-4 py-3 text-[13px] text-[#a43b2d]">{error}</div>}
        {!error && notifications.length === 0 && <div className="border-y border-[#e5e1d8] py-20 text-center"><div className="mx-auto mb-5 grid h-12 w-12 place-items-center rounded-full bg-[#f1e8d2] text-[#a77b2e]"><Bell className="h-5 w-5" /></div><p className="font-black">Nothing new here</p><p className="mx-auto mt-2 max-w-xs text-[13px] leading-6 text-[#77736c]">You will see messages and reviews here as they come in.</p><button onClick={() => navigate('/home')} className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#10143f] px-5 py-3 text-[12px] font-black text-[#d7a23a]">Browse listings <ArrowUpRight className="h-4 w-4" /></button></div>}
        {!error && notifications.length > 0 && <div className="border-y border-[#e5e1d8] bg-white">{notifications.map((notification) => { const isReview = notification.type === 'review'; const Icon = isReview ? Star : MessageCircle; const clickable = notification.type === 'message' || (isReview && notification.related_id); return <button key={notification.id} onClick={() => handleNotificationClick(notification)} disabled={!clickable} className={'group flex w-full items-start gap-4 border-b border-[#eeeae2] px-4 py-5 text-left last:border-b-0 sm:px-6 ' + (clickable ? 'transition hover:bg-[#fdf9f1]' : 'cursor-default')}><span className={'grid h-11 w-11 shrink-0 place-items-center rounded-full ' + (isReview ? 'bg-[#f1e8d2] text-[#a77b2e]' : 'bg-[#ececf3] text-[#3e467e]')}><Icon className="h-4 w-4" fill={isReview ? 'currentColor' : 'none'} /></span><span className="min-w-0 flex-1"><span className="flex items-start justify-between gap-3"><span className="text-[13px] font-black leading-5">{notification.title}</span><span className="shrink-0 text-[10px] text-[#aaa59c]">{timeAgo(notification.created_at)}</span></span>{notification.body && <span className="mt-1 block max-w-2xl text-[13px] leading-6 text-[#77736c]">{notification.body}</span>}<span className="mt-2 block text-[10px] font-black uppercase tracking-[0.12em] text-[#c89036]">{isReview ? 'Review activity' : 'Message activity'}</span></span>{clickable && <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-[#c9c3b8] transition group-hover:text-[#c89036]" />}</button>; })}</div>}
        <DashboardFooter />
      </main>
    </div>
  );
}
