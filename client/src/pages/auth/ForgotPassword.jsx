import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, CheckCircle2 } from 'lucide-react';
import PageHeader from '../../components/PageHeader';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const isValidEmail = /^[^\s@]+@st\.ug\.edu\.gh$/.test(email);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isValidEmail) setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-white flex flex-col font-body">
        <PageHeader onBack={() => navigate('/login')} />

        <div className="flex-1 flex flex-col items-center justify-center px-6 max-w-sm mx-auto w-full text-center">
          <div className="w-16 h-16 rounded-full bg-[#F9EFE0] flex items-center justify-center mb-6">
            <CheckCircle2 className="w-8 h-8 text-gold-deep" strokeWidth={2} />
          </div>
          <h1 className="font-display text-[1.7rem] font-semibold text-navy leading-tight mb-3">
            Check your email
          </h1>
          <p className="text-slate text-[14.5px] leading-relaxed mb-8">
            We sent a reset link to <span className="text-navy font-semibold">{email}</span>. It'll expire in 15 minutes.
          </p>

          <button
            onClick={() => navigate('/login')}
            className="w-full bg-navy text-gold font-bold tracking-[0.1em] text-sm py-4 rounded-full active:scale-[0.98] hover:bg-navy-light transition"
          >
            BACK TO LOG IN
          </button>

          <button
            onClick={() => setSubmitted(false)}
            className="text-mute text-[13.5px] mt-5 underline decoration-line decoration-2 underline-offset-2"
          >
            Wrong email? Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col font-body">
      <PageHeader onBack={() => navigate('/login')} />

      <div className="flex-1 flex flex-col px-6 pt-6 pb-8 max-w-sm mx-auto w-full">
        <h1 className="font-display text-[1.9rem] font-semibold text-navy leading-tight mb-3">
          Reset your password
        </h1>
        <p className="text-slate text-[14.5px] mb-9 leading-relaxed">
          Enter the university email on your account and we'll send you a link to reset your password.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1">
          <label className="block text-[11px] font-semibold tracking-[0.15em] uppercase text-mute mb-2">
            University Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@st.ug.edu.gh"
            className={`w-full bg-transparent border-b-2 outline-none py-2.5 text-navy placeholder-mute transition-colors ${
              email && !isValidEmail ? 'border-red-400' : 'border-line focus:border-gold-deep'
            }`}
          />
          {email && !isValidEmail && (
            <p className="text-red-500 text-[12px] mt-1.5">Use your st.ug.edu.gh email address</p>
          )}

          <div className="flex-1" />

          <button
            type="submit"
            disabled={!isValidEmail}
            className={`w-full font-bold tracking-[0.1em] text-sm py-4 rounded-full transition ${
              isValidEmail
                ? 'bg-navy text-gold active:scale-[0.98] hover:bg-navy-light'
                : 'bg-line text-mute cursor-not-allowed'
            }`}
          >
            SEND RESET LINK
          </button>

          <div className="flex items-start gap-2.5 bg-[#F9EFE0] rounded-2xl px-4 py-3.5 mt-5">
            <Mail className="w-4 h-4 mt-0.5 shrink-0 text-gold-deep" strokeWidth={2} />
            <p className="text-gold-deep text-[12.5px] leading-relaxed">
              The reset link only works if this email is linked to a verified student account.
            </p>
          </div>

          <p className="text-center text-mute text-[13.5px] mt-5">
            Remembered it?{' '}
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-navy font-semibold underline decoration-gold decoration-2 underline-offset-2"
            >
              Log in
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}