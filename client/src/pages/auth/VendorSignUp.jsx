import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../../lib/api';
import PageHeader from '../../components/PageHeader';

export default function VendorSignUp() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await apiRequest('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ fullName, email, password, userType: 'vendor' }),
      });

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      navigate('/vendor-registration');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-body">
      <PageHeader onBack={() => navigate('/welcome')} />

      <div className="flex-1 px-6 pt-6 pb-8 max-w-sm mx-auto w-full">
        <h1 className="font-display text-[1.9rem] font-semibold text-navy leading-tight mb-3">
          Register your business
        </h1>
        <p className="text-slate text-[14.5px] mb-9 leading-relaxed">
          For off-campus vendors. Create an account first, then submit your business details for admin review.
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6">
            <p className="text-red-600 text-[13px] font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[11px] font-semibold tracking-[0.15em] uppercase text-mute mb-2">
              Business Contact Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Kwame Owusu"
              required
              className="w-full bg-transparent border-b-2 border-line focus:border-gold-deep outline-none py-2.5 text-navy placeholder-mute transition-colors"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold tracking-[0.15em] uppercase text-mute mb-2">
              Business Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@yourbusiness.com"
              required
              className="w-full bg-transparent border-b-2 border-line focus:border-gold-deep outline-none py-2.5 text-navy placeholder-mute transition-colors"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold tracking-[0.15em] uppercase text-mute mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="w-full bg-transparent border-b-2 border-line focus:border-gold-deep outline-none py-2.5 text-navy placeholder-mute transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-navy text-gold font-bold tracking-[0.1em] text-sm py-4 rounded-full active:scale-[0.98] hover:bg-navy-light transition mt-4 disabled:opacity-50"
          >
            {loading ? 'CREATING ACCOUNT...' : 'CONTINUE TO BUSINESS DETAILS'}
          </button>

          <p className="text-center text-mute text-[13.5px]">
            Already have an account?{' '}
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