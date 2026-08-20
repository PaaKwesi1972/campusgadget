import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home as HomeIcon, MessageCircle, PlusCircle, User } from 'lucide-react';
import { apiRequest } from '../lib/api';
import { useUnreadCount } from '../hooks/useUnreadCount';
import PageLoader from '../components/PageLoader';

export default function Messages() {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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
        setConversations(data.conversations);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchConversations();
  }, [navigate]);

  const navItems = [
    { key: 'home', label: 'Home', icon: HomeIcon, path: '/home' },
    { key: 'messages', label: 'Messages', icon: MessageCircle, path: '/messages' },
    { key: 'sell', label: 'Sell', icon: PlusCircle, path: '/sell' },
    { key: 'profile', label: 'Profile', icon: User, path: '/profile' },
  ];

  if (loading) return <PageLoader />;

  return (
    <div className="min-h-screen bg-white font-body pb-24">
      <header className="pt-7 pb-4 px-6 max-w-2xl mx-auto">
        <p className="text-[10px] tracking-[0.2em] font-bold mb-1.5">
          <span className="text-navy">CAMPUS</span>
          <span className="text-gold-deep">GADGET</span>
        </p>
        <h1 className="font-display text-[1.6rem] font-semibold text-navy">Messages</h1>
      </header>

      <div className="max-w-2xl mx-auto px-4">
        {error && <p className="text-center text-red-500 text-[14px] py-10">{error}</p>}

        {!error && conversations.length === 0 && (
          <div className="text-center py-16 px-6">
            <p className="text-navy font-semibold mb-2">No messages yet</p>
            <p className="text-mute text-[13.5px]">
              When you message a seller or someone messages you, it'll show up here.
            </p>
          </div>
        )}

        {conversations.map((convo) => {
          const needsReply = convo.last_sender_id && convo.last_sender_id !== currentUser.id;
          return (
            <button
              key={convo.id}
              onClick={() => navigate(`/messages/thread/${convo.id}`)}
              className="w-full flex items-center gap-3.5 px-2 py-3.5 border-b border-line text-left"
            >
              <div className="relative w-12 h-12 rounded-full bg-line shrink-0 flex items-center justify-center font-bold text-navy text-[14px]">
                {convo.other_user_name?.charAt(0)}
                {needsReply && (
                  <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-gold border-2 border-white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-[14.5px] ${needsReply ? 'font-bold text-navy' : 'font-semibold text-navy'}`}>
                  {convo.other_user_name}
                </p>
                <p className="text-slate text-[11.5px] mb-0.5">{convo.listing_title}</p>
                {convo.last_message_text && (
                  <p className={`text-[13px] truncate ${needsReply ? 'text-navy font-medium' : 'text-mute'}`}>
                    {convo.last_message_text}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-20 bg-navy px-3 pt-2.5 pb-[calc(0.625rem+env(safe-area-inset-bottom))]">
        <div className="max-w-md mx-auto flex items-center justify-around">
          {navItems.map(({ key, label, icon: Icon, path }) => (
            <button key={key} onClick={() => navigate(path)} className="relative flex flex-col items-center gap-1 px-3 py-1">
              <div className="relative">
                <Icon className={`w-[18px] h-[18px] ${key === 'messages' ? 'text-gold' : 'text-white/50'}`} strokeWidth={2.2} />
                {key === 'messages' && unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </div>
              <span className={`text-[9.5px] font-semibold ${key === 'messages' ? 'text-gold' : 'text-white/50'}`}>
                {label}
              </span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

