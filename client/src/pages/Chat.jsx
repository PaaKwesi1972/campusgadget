import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowUp, Flag, X, BadgeCheck, ShieldCheck, MoreHorizontal, Send, MessageCircle } from 'lucide-react';
import { apiRequest } from '../lib/api';
import PageLoader from '../components/PageLoader';

function TypingIndicator() {
  return <div className="flex justify-start"><div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md bg-[#eeeae3] px-4 py-3.5"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#aaa59c]" /><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#aaa59c] [animation-delay:150ms]" /><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#aaa59c] [animation-delay:300ms]" /></div></div>;
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
  const inputRef = useRef(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [reportError, setReportError] = useState('');
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(function () {
    async function openConversation() {
      const token = localStorage.getItem('token');
      if (!token) { navigate('/login'); return; }
      try {
        const endpoint = conversationId ? '/api/messages/thread/' + conversationId : '/api/messages/listing/' + listingId;
        const data = await apiRequest(endpoint, { headers: { Authorization: 'Bearer ' + token } });
        setConversation(data.conversation);
        setMessages(data.messages || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    openConversation();
  }, [listingId, conversationId, navigate]);

  useEffect(function () {
    if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages, showTyping]);

  async function handleSend(event) {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || !conversation) return;
    const token = localStorage.getItem('token');
    try {
      const data = await apiRequest('/api/messages/' + conversation.id, { method: 'POST', headers: { Authorization: 'Bearer ' + token }, body: JSON.stringify({ text: trimmed }) });
      setMessages((prev) => prev.concat([data.message]));
      setInput('');
      setShowTyping(true);
      setTimeout(() => setShowTyping(false), 2000);
      inputRef.current?.focus();
    } catch (err) {
      setError(err.message);
    }
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend(event);
    }
  }

  async function handleSubmitReport(event) {
    event.preventDefault();
    if (!reportReason.trim() || !conversation) return;
    const otherUserId = conversation.buyer_id === currentUser.id ? conversation.seller_id : conversation.buyer_id;
    const token = localStorage.getItem('token');
    setReportSubmitting(true);
    setReportError('');
    try {
      await apiRequest('/api/reports', { method: 'POST', headers: { Authorization: 'Bearer ' + token }, body: JSON.stringify({ reportedUserId: otherUserId, reason: reportReason.trim() }) });
      setReportSubmitted(true);
      setReportReason('');
    } catch (err) {
      setReportError(err.message);
    } finally {
      setReportSubmitting(false);
    }
  }

  if (loading) return <PageLoader />;
  if (error || !conversation) return <div className="flex min-h-[calc(100vh-72px)] items-center justify-center bg-[#fbfaf7] px-6 text-center font-body"><div><p className="text-[15px] font-black text-[#10143f]">{error || 'Conversation not found'}</p><button onClick={() => navigate('/messages')} className="mt-5 rounded-full bg-[#10143f] px-5 py-3 text-[11px] font-black uppercase tracking-[0.1em] text-[#d7a23a]">Back to messages</button></div></div>;

  const otherName = conversation.other_user_name || conversation.seller_name || 'Campus Gadget user';
  const initials = otherName.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase();

  return <div className="min-h-[calc(100vh-72px)] bg-[#fbfaf7] px-4 py-5 font-body text-[#10143f] sm:px-8 lg:px-10 lg:py-8"><div className="mx-auto flex min-h-[calc(100vh-145px)] max-w-[900px] flex-col overflow-hidden rounded-[26px] border border-[#e5e1d8] bg-white shadow-[0_16px_45px_rgba(16,20,63,0.06)]"><header className="flex items-center gap-3 border-b border-[#eeeae3] px-4 py-4 sm:px-6"><button onClick={() => navigate('/messages')} className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[#e5e1d8] bg-[#fcfaf5] text-[#10143f]" aria-label="Back to messages"><ArrowLeft className="h-4 w-4" /></button><div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[#f7efdF] text-[12px] font-black text-[#10143f]">{initials}</div><div className="min-w-0 flex-1"><div className="flex items-center gap-1.5"><p className="truncate text-[13px] font-black">{otherName}</p><BadgeCheck className="h-3.5 w-3.5 shrink-0 text-[#c89036]" /></div><p className="mt-1 truncate text-[10px] font-black uppercase tracking-[0.12em] text-[#aaa59c]">{conversation.listing_title || 'Marketplace conversation'}</p></div><button onClick={() => setReportOpen(true)} className="grid h-9 w-9 place-items-center rounded-full text-[#9a958c] transition hover:bg-[#fff5f2] hover:text-[#c34f3b]" aria-label="More options"><MoreHorizontal className="h-5 w-5" /></button></header><div className="flex items-center gap-2 border-b border-[#eeeae3] bg-[#fcfaf5] px-5 py-3 text-[11px] text-[#77736c] sm:px-6"><ShieldCheck className="h-4 w-4 text-[#c89036]" /><span>Keep the price, condition, and meeting place clear before you agree.</span></div><main className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-8"><div className="mx-auto flex max-w-[680px] flex-col gap-3">{messages.length === 0 && !showTyping ? <div className="my-auto flex min-h-[300px] flex-col items-center justify-center text-center"><div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-[#f7efdF]"><MessageCircle className="h-6 w-6 text-[#c89036]" /></div><p className="text-[15px] font-black">Start the conversation</p><p className="mt-2 max-w-[300px] text-[12px] leading-6 text-[#817c72]">Ask about “{conversation.listing_title}”, its condition, price, or where to meet.</p></div> : messages.map((msg) => { const isMe = msg.sender_id === currentUser.id; return <div key={msg.id} className={'flex ' + (isMe ? 'justify-end' : 'justify-start')}><div className={'max-w-[82%] px-4 py-3 text-[13px] leading-6 shadow-sm ' + (isMe ? 'rounded-[20px] rounded-br-md bg-[#10143f] text-white' : 'rounded-[20px] rounded-bl-md bg-[#f1eee8] text-[#10143f]')}>{msg.text}</div></div>; })}{showTyping && <TypingIndicator />}<div ref={bottomRef} /></div></main><form onSubmit={handleSend} className="border-t border-[#eeeae3] bg-white p-3 sm:p-4"><div className="mx-auto flex max-w-[680px] items-end gap-2 rounded-[20px] border border-[#e5e1d8] bg-[#fcfaf5] p-2 transition focus-within:border-[#c89036] focus-within:bg-white"><textarea ref={inputRef} value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={handleKeyDown} rows={1} placeholder="Write a message…" className="max-h-28 min-h-[42px] flex-1 resize-none bg-transparent px-3 py-2.5 text-[13px] leading-5 outline-none placeholder:text-[#aaa59c]" /><button type="submit" disabled={!input.trim()} className={'grid h-10 w-10 shrink-0 place-items-center rounded-2xl transition ' + (input.trim() ? 'bg-[#d7a23a] text-[#10143f] hover:bg-[#c89036]' : 'bg-[#e5e1d8] text-[#aaa59c]')} aria-label="Send message">{input.trim() ? <Send className="h-4 w-4" /> : <ArrowUp className="h-4 w-4" />}</button></div><p className="mx-auto mt-2 max-w-[680px] px-3 text-[10px] text-[#aaa59c]">Press Enter to send · Shift + Enter for a new line</p></form></div>{reportOpen && <div className="fixed inset-0 z-40 flex items-end bg-black/35 sm:items-center sm:justify-center"><div className="w-full rounded-t-[26px] bg-white p-6 sm:max-w-[420px] sm:rounded-[26px]"><div className="mb-5 flex items-center justify-between"><div><p className="text-[16px] font-black">Report this user</p><p className="mt-1 text-[11px] text-[#817c72]">Our admin team reviews every report.</p></div><button onClick={() => { setReportOpen(false); setReportSubmitted(false); setReportError(''); }}><X className="h-5 w-5 text-[#817c72]" /></button></div>{reportSubmitted ? <div><div className="rounded-xl bg-[#eef8ef] px-4 py-3 text-[12px] font-bold text-[#30924a]">Thanks for letting us know. We will review this report.</div><button onClick={() => { setReportOpen(false); setReportSubmitted(false); }} className="mt-4 w-full rounded-full bg-[#10143f] py-3.5 text-[11px] font-black uppercase tracking-[0.1em] text-[#d7a23a]">Done</button></div> : <form onSubmit={handleSubmitReport}><textarea value={reportReason} onChange={(event) => setReportReason(event.target.value)} placeholder="Tell us what happened…" rows={4} className="w-full resize-none rounded-xl border border-[#e5e1d8] bg-[#fcfaf5] px-4 py-3 text-[13px] outline-none focus:border-[#c89036]" />{reportError && <p className="mt-2 text-[12px] text-[#c34f3b]">{reportError}</p>}<button type="submit" disabled={!reportReason.trim() || reportSubmitting} className={'mt-4 w-full rounded-full py-3.5 text-[11px] font-black uppercase tracking-[0.1em] ' + (reportReason.trim() && !reportSubmitting ? 'bg-[#c34f3b] text-white' : 'cursor-not-allowed bg-[#e5e1d8] text-[#aaa59c]')}>{reportSubmitting ? 'Submitting…' : 'Submit report'}</button></form>}</div></div>}</div>;
}
