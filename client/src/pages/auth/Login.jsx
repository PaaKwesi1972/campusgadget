import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../../lib/api';
import PageHeader from '../../components/PageHeader';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      navigate('/home');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-body">
      <PageHeader onBack={() => navigate('/welcome')} />

      <div className="flex-1 flex flex-col px-6 pt-6 pb-8 max-w-sm mx-auto w-full">
        <h1 className="font-display text-[1.9rem] font-semibold text-navy leading-tight mb-3">
          Welcome back
        </h1>
        <p className="text-slate text-[14.5px] mb-10 leading-relaxed">
          Log in to continue buying and selling on your campus.
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6">
            <p className="text-red-600 text-[13px] font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col flex-1">
          <label className="block text-[11px] font-semibold tracking-[0.15em] uppercase text-mute mb-2">
            University Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@st.ug.edu.gh"
            required
            className="w-full bg-transparent border-b-2 border-line focus:border-gold-deep outline-none py-2.5 text-navy placeholder-mute transition-colors mb-6"
          />

          <label className="block text-[11px] font-semibold tracking-[0.15em] uppercase text-mute mb-2">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="w-full bg-transparent border-b-2 border-line focus:border-gold-deep outline-none py-2.5 text-navy placeholder-mute transition-colors"
          />

          <button
            type="button"
            onClick={() => navigate('/forgot-password')}
            className="self-end text-gold-deep text-[13px] font-semibold mt-3"
          >
            Forgot password?
          </button>

          <div className="flex-1" />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-navy text-gold font-bold tracking-[0.1em] text-sm py-4 rounded-full active:scale-[0.98] hover:bg-navy-light transition disabled:opacity-50"
          >
            {loading ? 'LOGGING IN...' : 'LOG IN'}
          </button>

          <p className="text-center text-mute text-[13.5px] mt-6">
            New to CampusGadget?{' '}
            <button
              type="button"
              onClick={() => navigate('/signup')}
              className="text-navy font-semibold underline decoration-gold decoration-2 underline-offset-2"
            >
              Create account
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
