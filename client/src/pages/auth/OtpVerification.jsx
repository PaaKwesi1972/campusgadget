import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../../lib/api';
import PageHeader from '../../components/PageHeader';

export default function OtpVerification() {
  const navigate = useNavigate();
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [secondsLeft, setSecondsLeft] = useState(300);
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef([]);

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [secondsLeft]);

  const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const seconds = String(secondsLeft % 60).padStart(2, '0');
  const expired = secondsLeft <= 0;

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    setError('');
    const next = [...digits];
    next[index] = value.slice(-1);
    setDigits(next);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    setResending(true);
    setError('');
    try {
      await apiRequest('/api/auth/resend-otp', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      setSecondsLeft(300);
      setDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError(err.message);
    } finally {
      setResending(false);
    }
  };

  const handleVerify = async () => {
    const code = digits.join('');
    if (code.length !== 6 || expired) return;

    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    setError('');
    setVerifying(true);
    try {
      await apiRequest('/api/auth/verify-otp', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ code }),
      });
      navigate('/home');
    } catch (err) {
      setError(err.message);
      setDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setVerifying(false);
    }
  };

  const isComplete = digits.every((d) => d !== '');

  return (
    <div className="min-h-screen bg-white flex flex-col font-body">
      <PageHeader onBack={() => navigate('/signup')} />

      <div className="flex-1 flex flex-col px-6 pt-6 pb-8 max-w-sm mx-auto w-full">
        <h1 className="font-display text-[1.9rem] font-semibold text-navy leading-tight mb-3">
          Check your inbox
        </h1>
        <p className="text-slate text-[14.5px] mb-10 leading-relaxed">
          Enter the 6-digit code we sent to{' '}
          <span className="text-navy font-semibold">{currentUser.email || 'your email'}</span>
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5">
            <p className="text-red-600 text-[13px] font-medium">{error}</p>
          </div>
        )}

        <div className="flex gap-2.5 justify-between mb-5">
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={(el) => (inputRefs.current[i] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              disabled={expired || verifying}
              className={`w-full aspect-square text-center text-xl font-bold rounded-xl border-2 outline-none transition-colors text-navy disabled:opacity-40 ${
                digit ? 'border-gold-deep' : 'border-line focus:border-gold-deep'
              }`}
            />
          ))}
        </div>

        <p className={`text-[13px] mb-8 ${expired ? 'text-red-600 font-semibold' : 'text-slate'}`}>
          {expired ? 'Code expired' : `Code expires in ${minutes}:${seconds}`}
        </p>

        <div className="flex-1" />

        <button
          onClick={handleVerify}
          disabled={!isComplete || expired || verifying}
          className={`w-full font-bold tracking-[0.1em] text-sm py-4 rounded-full transition ${
            isComplete && !expired && !verifying
              ? 'bg-navy text-gold active:scale-[0.98] hover:bg-navy-light'
              : 'bg-line text-mute cursor-not-allowed'
          }`}
        >
          {verifying ? 'VERIFYING...' : 'VERIFY & CONTINUE'}
        </button>

        <p className="text-center text-mute text-[13.5px] mt-5">
          Didn't get a code?{' '}
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="text-navy font-semibold underline decoration-gold decoration-2 underline-offset-2 disabled:opacity-50"
          >
            {resending ? 'Sending...' : 'Resend'}
          </button>
        </p>
      </div>
    </div>
  );
}