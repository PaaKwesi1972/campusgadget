import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageCircle, Star } from 'lucide-react';
import { apiRequest } from '../lib/api';
import PageLoader from '../components/PageLoader';

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchNotifications() {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      try {
        const data = await apiRequest('/api/notifications', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotifications(data.notifications);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchNotifications();
  }, [navigate]);

  const handleNotificationClick = (notif) => {
    if (notif.type === 'message') {
      navigate(`/messages/${notif.related_id}`);
    } else if (notif.type === 'review' && notif.related_id) {
      navigate(`/listing/${notif.related_id}/review`);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="min-h-screen bg-white font-body">
      <div className="bg-navy px-6 pt-8 pb-5 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="text-white/80 hover:text-white transition">
          <ArrowLeft className="w-5 h-5" strokeWidth={2.2} />
        </button>
        <p className="text-white font-semibold text-[16px]">Notifications</p>
      </div>

      <div className="max-w-lg mx-auto">
        {error && <p className="text-center text-red-500 text-[14px] py-10">{error}</p>}

        {!error && notifications.length === 0 && (
          <div className="text-center py-16 px-6">
            <p className="text-navy font-semibold mb-2">No notifications yet</p>
            <p className="text-mute text-[13.5px]">
              You'll see messages and reviews here as they come in.
            </p>
          </div>
        )}

        {notifications.map((notif) => {
          const Icon = notif.type === 'review' ? Star : MessageCircle;
          return (
            <button
              key={notif.id}
              onClick={() => handleNotificationClick(notif)}
              className="w-full flex items-start gap-3.5 px-6 py-4 border-b border-line text-left"
            >
              <div className="w-9 h-9 rounded-full bg-[#F9EFE0] flex items-center justify-center shrink-0 mt-0.5">
                <Icon className="w-4 h-4 text-gold-deep" strokeWidth={2} fill={notif.type === 'review' ? 'currentColor' : 'none'} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-navy text-[13.5px] leading-snug">{notif.title}</p>
                {notif.body && (
                  <p className="text-slate text-[13px] mt-0.5 line-clamp-2">{notif.body}</p>
                )}
                <p className="text-mute text-[11px] mt-1">{timeAgo(notif.created_at)}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

