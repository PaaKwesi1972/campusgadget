import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowUp, Flag, ShieldCheck, X } from 'lucide-react';
import { apiRequest } from '../lib/api';
import PageLoader from '../components/PageLoader';
import DashboardSidebar, { DashboardFooter } from '../components/DashboardSidebar';

function TypingIndicator() {
  return <div className="flex justify-start"><div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md bg-[#eeeae2] px-4 py-3.5"><span className="h-2 w-2 animate-[typingBounce_1.2s_ease-in-out_infinite] rounded-full bg-[#9a958c]" /><span className="h-2 w-2 animate-[typingBounce_1.2s_ease-in-out_infinite] rounded-full bg-[#9a958c] [animation-delay:150ms]" /><span className="h-2 w-2 animate-[typingBounce_1.2s_ease-in-out_infinite] rounded-full bg-[#9a958c] [animation-delay:300ms]" /></div></div>;
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
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [reportError, setReportError] = useState('');
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    async function openConversation() {
      const token = localStorage.getItem('token');
      if (!token) { navigate('/login'); return; }
      try {
        const endpoint = conversationId ? '/api/messages/thread/' + conversationId : '/api/messages/listing/' + listingId;
        const data = await apiRequest(endpoint, { headers: { Authorization: 'Bearer ' + token } });
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

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, showTyping]);

  async function handleSend(event) {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || !conversation) return;
    try {
      const data = await apiRequest('/api/messages/' + conversation.id, {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + localStorage.getItem('token') },
        body: JSON.stringify({ text: trimmed }),
      });
      setMessages((prev) => prev.concat([data.message]));
      setInput('');
      setShowTyping(true);
      setTimeout(() => setShowTyping(false), 2000);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleSubmitReport(event) {
    event.preventDefault();
    if (!reportReason.trim() || !conversation) return;
    const otherUserId = conversation.buyer_id === currentUser.id ? conversation.seller_id : conversation.buyer_id;
    setReportSubmitting(true);
    setReportError('');
    try {
      await apiRequest('/api/reports', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + localStorage.getItem('token') },
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

  if (loading) return <PageLoader />;
  if (error || !conversation) return <div className="flex min-h-screen flex-col items-center justify-center bg-[#fbfaf7] px-6 text-center font-body text-[#10143f]"><p className="font-black">{error || 'Conversation not found'}</p><button onClick={() => navigate('/messages')} className="mt-5 rounded-full bg-[#10143f] px-5 py-3 text-[12px] font-black text-[#d7a23a]">Back to messages</button></div>;

  const otherName = conversation.other_user_name || conversation.seller_name || 'Campus seller';

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#fbfaf7] font-body text-[#10143f] lg:pl-64">
      <DashboardSidebar active="messages" />
      <div className="flex min-h-screen flex-col">
        <header className="border-b border-[#e5e1d8] bg-[#fbfaf7]"><div className="mx-auto flex h-[72px] w-full max-w-[900px] items-center justify-between gap-4 px-5 sm:px-8"><div className="flex min-w-0 items-center gap-3"><button onClick={() => navigate(-1)} className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[#e5e1d8] bg-white"><ArrowLeft className="h-4 w-4" /></button><div className="min-w-0"><p className="truncate text-[14px] font-black">{conversation.listing_title}</p><p className="mt-1 truncate text-[11px] text-[#a77b2e]">Conversation with {otherName}</p></div></div><button onClick={() => setReportOpen(true)} className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[#e5e1d8] bg-white text-[#9b665a]" aria-label="Report user"><Flag className="h-4 w-4" /></button></div></header>

        <main className="mx-auto flex min-h-[calc(100vh-72px)] w-full max-w-[900px] flex-1 flex-col px-5 sm:px-8"><div className="my-5 flex items-center gap-3 border border-[#e5e1d8] bg-white px-4 py-3"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#f1e8d2] text-[12px] font-black text-[#a77b2e]">{otherName.charAt(0).toUpperCase()}</div><div className="min-w-0 flex-1"><p className="truncate text-[12px] font-black">Buying or selling: {conversation.listing_title}</p><p className="mt-1 text-[11px] text-[#817c72]">Keep the conversation respectful and arrange meet-ups in public.</p></div><ShieldCheck className="h-4 w-4 shrink-0 text-[#a77b2e]" /></div>

          <div className="flex-1 space-y-3 overflow-y-auto pb-5 pr-1">{messages.length === 0 && !showTyping ? <div className="flex min-h-[260px] flex-col items-center justify-center px-6 text-center"><div className="mb-4 grid h-12 w-12 place-items-center rounded-full bg-[#f1e8d2] text-[#a77b2e]">{otherName.charAt(0).toUpperCase()}</div><p className="font-black">Start the conversation</p><p className="mt-2 max-w-xs text-[13px] leading-6 text-[#77736c]">Ask about the condition, price, what is included, or where you can meet.</p></div> : messages.map((message) => { const isMe = message.sender_id === currentUser.id; return <div key={message.id} className={'flex ' + (isMe ? 'justify-end' : 'justify-start')}><div className={'max-w-[84%] px-4 py-3 text-[13.5px] leading-6 shadow-sm sm:max-w-[70%] ' + (isMe ? 'rounded-2xl rounded-br-md bg-[#10143f] text-white' : 'rounded-2xl rounded-bl-md border border-[#e5e1d8] bg-white text-[#10143f]')}>{message.text}</div></div>; })}{showTyping && <TypingIndicator />}<div ref={bottomRef} /></div>

          <form onSubmit={handleSend} className="sticky bottom-0 -mx-5 flex items-center gap-2 border-t border-[#e5e1d8] bg-[#fbfaf7] px-5 py-4 sm:-mx-8 sm:px-8"><input type="text" value={input} onChange={(event) => setInput(event.target.value)} placeholder="Write a message…" className="min-w-0 flex-1 rounded-full border border-[#e5e1d8] bg-white px-4 py-3 text-[14px] outline-none placeholder:text-[#aaa59c] focus:border-[#10143f]" /><button type="submit" disabled={!input.trim()} className={'grid h-11 w-11 shrink-0 place-items-center rounded-full transition ' + (input.trim() ? 'bg-[#d7a23a] text-[#10143f] hover:bg-[#c89036]' : 'bg-[#e5e1d8] text-[#aaa59c]')} aria-label="Send message"><ArrowUp className="h-4 w-4" /></button></form>
          <DashboardFooter />
        </main>
      </div>

      {reportOpen && <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#10143f]/45 p-0 sm:items-center sm:p-5"><div className="w-full max-w-md rounded-t-[24px] bg-[#fbfaf7] p-6 sm:rounded-[24px]"><div className="mb-5 flex items-center justify-between"><div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#c89036]">Safety</p><p className="mt-1 text-[18px] font-black">Report this user</p></div><button onClick={() => { setReportOpen(false); setReportSubmitted(false); setReportError(''); }} className="grid h-9 w-9 place-items-center rounded-full bg-white"><X className="h-4 w-4" /></button></div>{reportSubmitted ? <div><p className="text-[13px] leading-6 text-[#77736c]">Thanks for letting us know. Our admin team will review this report.</p><button onClick={() => { setReportOpen(false); setReportSubmitted(false); }} className="mt-6 w-full bg-[#10143f] py-3.5 text-[12px] font-black text-[#d7a23a]">Done</button></div> : <form onSubmit={handleSubmitReport}><p className="mb-3 text-[13px] leading-6 text-[#77736c]">Tell us what happened. Please include useful details for the review.</p>{reportError && <p className="mb-3 text-[12px] text-[#b45645]">{reportError}</p>}<textarea value={reportReason} onChange={(event) => setReportReason(event.target.value)} placeholder="e.g. Seller never showed up to the meet-up…" rows={4} className="w-full resize-none border border-[#e5e1d8] bg-white px-4 py-3 text-[13px] outline-none focus:border-[#10143f]" /><button type="submit" disabled={!reportReason.trim() || reportSubmitting} className={'mt-4 w-full py-3.5 text-[12px] font-black ' + (reportReason.trim() && !reportSubmitting ? 'bg-[#b45645] text-white' : 'bg-[#e5e1d8] text-[#aaa59c]')}>{reportSubmitting ? 'Submitting…' : 'Submit report'}</button></form>}</div></div>}
    </div>
  );
}
