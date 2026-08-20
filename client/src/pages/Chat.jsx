import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowUp, Home as HomeIcon, MessageCircle, PlusCircle, User, Flag, X } from 'lucide-react';
import { apiRequest } from '../lib/api';
import { useUnreadCount } from '../hooks/useUnreadCount';
import PageLoader from '../components/PageLoader';

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-[#F0EEE9] rounded-2xl rounded-bl-md px-4 py-3.5 flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-mute inline-block animate-[typingBounce_1.2s_ease-in-out_infinite]" style={{ animationDelay: '0ms' }} />
        <span className="w-2 h-2 rounded-full bg-mute inline-block animate-[typingBounce_1.2s_ease-in-out_infinite]" style={{ animationDelay: '150ms' }} />
        <span className="w-2 h-2 rounded-full bg-mute inline-block animate-[typingBounce_1.2s_ease-in-out_infinite]" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
}

export default function Chat() {
  const { listingId, conversationId } = useParams();
  const navigate = useNavigate();
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showTyping, setShowTyping] = useState(false);
  const bottomRef = useRef(null);
  const unreadCount = useUnreadCount();

  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [reportError, setReportError] = useState('');

  useEffect(function () {
    async function openConversation() {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      try {
        const endpoint = conversationId
          ? '/api/messages/thread/' + conversationId
          : '/api/messages/listing/' + listingId;

        const data = await apiRequest(endpoint, {
          headers: { Authorization: 'Bearer ' + token },
        });
        setConversation(data.conversation);
        setMessages(data.messages);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    openConversation();
  }, [listingId, conversationId, navigate]);

  useEffect(function () {
    bottomRef.current && bottomRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages, showTyping]);

  async function handleSend(e) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || !conversation) return;

    const token = localStorage.getItem('token');
    try {
      const data = await apiRequest('/api/messages/' + conversation.id, {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + token },
        body: JSON.stringify({ text: trimmed }),
      });
      setMessages(function (prev) { return prev.concat([data.message]); });
      setInput('');

      setShowTyping(true);
      setTimeout(function () { setShowTyping(false); }, 2000);
    } catch (err) {
      setError(err.message);
    }
  }

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  async function handleSubmitReport(e) {
    e.preventDefault();
    if (!reportReason.trim() || !conversation) return;

    const otherUserId = conversation.buyer_id === currentUser.id ? conversation.seller_id : conversation.buyer_id;

    const token = localStorage.getItem('token');
    setReportSubmitting(true);
    setReportError('');
    try {
      await apiRequest('/api/reports', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + token },
        body: JSON.stringify({ reportedUserId: otherUserId, reason: reportReason.trim() }),
      });
      setReportSubmitted(true);
      setReportReason('');
    } catch (err) {
      setReportError(err.message);
    } finally {
      setReportSubmitting(false);
    }
  }

  const navItems = [
    { key: 'home', label: 'Home', icon: HomeIcon, path: '/home' },
    { key: 'messages', label: 'Messages', icon: MessageCircle, path: '/messages' },
    { key: 'sell', label: 'Sell', icon: PlusCircle, path: '/sell' },
    { key: 'profile', label: 'Profile', icon: User, path: '/profile' },
  ];

  if (loading) return <PageLoader />;

  if (error || !conversation) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center font-body">
        <p className="text-navy font-semibold mb-2">{error || 'Conversation not found'}</p>
        <button onClick={function () { navigate('/messages'); }} className="text-gold-deep font-semibold text-sm underline">
          Back to Messages
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col font-body pb-16 lg:pb-0">
      <div className="bg-navy px-6 pt-8 pb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={function () { navigate(-1); }} className="text-white/80 hover:text-white transition shrink-0">
            <ArrowLeft className="w-5 h-5" strokeWidth={2.2} />
          </button>
          <div className="min-w-0">
            <p className="text-white font-semibold text-[14.5px] truncate">
              {conversation.listing_title}
            </p>
            <p className="text-gold text-[11px]">Conversation</p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={function () { setReportOpen(true); }}
            className="text-white/70 hover:text-white transition p-2"
            aria-label="Report user"
          >
            <Flag className="w-4 h-4" strokeWidth={2.2} />
          </button>

          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map(function (item) {
              const Icon = item.icon;
              return (
                <button
                  key={item.key}
                  onClick={function () { navigate(item.path); }}
                  className="relative flex items-center gap-2 px-4 py-2.5 rounded-full text-[13.5px] font-semibold text-white/70 hover:bg-white/10 hover:text-white transition-colors"
                >
                  <div className="relative">
                    <Icon className="w-4 h-4" strokeWidth={2.2} />
                    {item.key === 'messages' && unreadCount > 0 && (
                      <span className="absolute -top-1.5 -right-2 min-w-[14px] h-3.5 px-1 rounded-full bg-red-500 text-white text-[8px] font-bold flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-3 max-w-3xl w-full mx-auto lg:px-0">
        {messages.length === 0 && !showTyping ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-6">
            <p className="text-navy font-semibold text-[14.5px] mb-1.5">Start the conversation</p>
            <p className="text-slate text-[13px] leading-relaxed">
              Ask about "{conversation.listing_title}" &mdash; condition, price, or where to meet up.
            </p>
          </div>
        ) : (
          messages.map(function (msg) {
            const isMe = msg.sender_id === currentUser.id;
            return (
              <div key={msg.id} className={'flex ' + (isMe ? 'justify-end' : 'justify-start')}>
                <div
                  className={'max-w-[75%] px-4 py-2.5 rounded-2xl text-[14px] leading-relaxed ' + (isMe ? 'bg-navy text-white rounded-br-md' : 'bg-[#F0EEE9] text-navy rounded-bl-md')}
                >
                  {msg.text}
                </div>
              </div>
            );
          })
        )}
        {showTyping && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="border-t border-line px-4 py-3.5 flex items-center gap-2.5 max-w-3xl w-full mx-auto">
        <input
          type="text"
          value={input}
          onChange={function (e) { setInput(e.target.value); }}
          placeholder="Type a message..."
          className="flex-1 bg-[#F5F2EC] rounded-full px-4 py-2.5 outline-none text-[14px] text-navy placeholder-mute"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className={'w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition ' + (input.trim() ? 'bg-gold active:scale-95' : 'bg-line')}
        >
          <ArrowUp className="w-4 h-4 text-navy" strokeWidth={2.4} />
        </button>
      </form>

      {reportOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center sm:justify-center z-40">
          <div className="w-full sm:max-w-sm bg-white rounded-t-3xl sm:rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="font-bold text-navy text-[16px]">Report this user</p>
              <button onClick={function () { setReportOpen(false); setReportSubmitted(false); setReportError(''); }}>
                <X className="w-5 h-5 text-mute" strokeWidth={2.2} />
              </button>
            </div>

            {reportSubmitted ? (
              <div>
                <p className="text-slate text-[13.5px] leading-relaxed mb-5">
                  Thanks for letting us know. Our team will review this report.
                </p>
                <button
                  onClick={function () { setReportOpen(false); setReportSubmitted(false); }}
                  className="w-full bg-navy text-gold font-bold tracking-[0.1em] text-sm py-3.5 rounded-full"
                >
                  DONE
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitReport}>
                <p className="text-slate text-[13px] mb-3">
                  Tell us what happened. Our admin team reviews every report.
                </p>
                {reportError && (
                  <p className="text-red-500 text-[12.5px] mb-3">{reportError}</p>
                )}
                <textarea
                  value={reportReason}
                  onChange={function (e) { setReportReason(e.target.value); }}
                  placeholder="e.g. Seller never showed up to the meet-up..."
                  rows={3}
                  className="w-full bg-[#F5F2EC] rounded-xl px-4 py-3 text-[13.5px] text-navy placeholder-mute outline-none resize-none mb-4"
                />
                <button
                  type="submit"
                  disabled={!reportReason.trim() || reportSubmitting}
                  className={'w-full font-bold tracking-[0.1em] text-sm py-3.5 rounded-full transition ' + (reportReason.trim() && !reportSubmitting ? 'bg-red-600 text-white' : 'bg-line text-mute cursor-not-allowed')}
                >
                  {reportSubmitting ? 'SUBMITTING...' : 'SUBMIT REPORT'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-20 bg-navy px-3 pt-2.5 pb-[calc(0.625rem+env(safe-area-inset-bottom))]">
        <div className="max-w-md mx-auto flex items-center justify-around">
          {navItems.map(function (item) {
            const Icon = item.icon;
            return (
              <button key={item.key} onClick={function () { navigate(item.path); }} className="relative flex flex-col items-center gap-1 px-3 py-1">
                <div className="relative">
                  <Icon className={'w-[18px] h-[18px] ' + (item.key === 'messages' ? 'text-gold' : 'text-white/50')} strokeWidth={2.2} />
                  {item.key === 'messages' && unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <span className={'text-[9.5px] font-semibold ' + (item.key === 'messages' ? 'text-gold' : 'text-white/50')}>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

