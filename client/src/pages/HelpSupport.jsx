import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Mail, MessageCircle } from 'lucide-react';
import PageHeader from '../components/PageHeader';

const FAQS = [
  { q: 'How does student verification work?', a: 'When you sign up, you enter your University of Ghana email address. We send a 6-digit one-time code to that email, entering it confirms you are a real, currently enrolled student before you can list or message anyone.' },
  { q: 'Is it safe to meet a buyer or seller in person?', a: 'CampusGadget only verifies identity through university email, it does not supervise in-person meet-ups. Always meet in busy, public campus locations during daylight hours, and consider bringing a friend for higher-value items.' },
  { q: 'What happens if a seller does not show up?', a: 'You can report the user directly from your conversation with them. Our admin team reviews every report and can suspend accounts that repeatedly fail to honor agreed deals.' },
  { q: 'How do I become a vendor instead of a student seller?', a: 'From the Welcome screen, choose to register as an off-campus vendor. Off-campus businesses go through a separate review process, including a business registration document, before their listings go live.' },
  { q: 'Can I edit or delete a listing after posting it?', a: 'Yes, go to Profile, then My Listings, tap the listing, and you will find options to edit its details or remove it entirely.' },
  { q: 'Why was my listing flagged or removed?', a: 'Listings can be flagged by other students for reasons like suspected counterfeit items or unrealistic pricing. An admin reviews every flag before any listing is removed, you will be notified either way.' },
];

export default function HelpSupport() {
  const navigate = useNavigate();
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div className="min-h-screen bg-white font-body">
      <PageHeader onBack={() => navigate('/profile')} />

      <div className="max-w-lg mx-auto px-6 pt-6 pb-10">
        <h1 className="font-display text-[1.5rem] font-semibold text-navy mb-1.5">Help and Support</h1>
        <p className="text-slate text-[13.5px] mb-7">Common questions from students using CampusGadget.</p>

        <div className="mb-8">
          {FAQS.map((item, i) => (
            <div key={i} className="border-b border-line">
              <button onClick={() => setOpenIndex(openIndex === i ? null : i)} className="w-full flex items-center justify-between gap-4 py-4 text-left">
                <span className="font-semibold text-navy text-[14px]">{item.q}</span>
                <ChevronDown className={`w-4 h-4 text-mute shrink-0 transition-transform ${openIndex === i ? 'rotate-180' : ''}`} strokeWidth={2.2} />
              </button>
              {openIndex === i && (
                <p className="text-slate text-[13.5px] leading-relaxed pb-4 pr-6">{item.a}</p>
              )}
            </div>
          ))}
        </div>

        <div className="bg-[#F9EFE0] rounded-2xl p-5">
          <p className="font-semibold text-navy text-[14px] mb-1">Still need help?</p>
          <p className="text-slate text-[13px] leading-relaxed mb-4">Our support team typically replies within 24 hours.</p>
          <div className="flex flex-col gap-2.5">
            <a href="mailto:support@campusgadget.ug.edu.gh" className="flex items-center gap-2.5 bg-white rounded-xl px-4 py-3">
              <Mail className="w-4 h-4 text-gold-deep shrink-0" strokeWidth={2} />
              <span className="text-navy text-[13.5px] font-medium">support@campusgadget.ug.edu.gh</span>
            </a>
            <button onClick={() => navigate('/messages')} className="flex items-center gap-2.5 bg-white rounded-xl px-4 py-3">
              <MessageCircle className="w-4 h-4 text-gold-deep shrink-0" strokeWidth={2} />
              <span className="text-navy text-[13.5px] font-medium">Message support directly</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}