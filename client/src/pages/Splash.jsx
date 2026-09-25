import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MonoLogo from '../components/MonoLogo';

export default function Splash() {
  const navigate = useNavigate();
  const [showText, setShowText] = useState(false);

  useEffect(() => {
    const textTimer = setTimeout(() => setShowText(true), 400);
    const navTimer = setTimeout(() => navigate('/welcome', { replace: true }), 2200);
    return () => {
      clearTimeout(textTimer);
      clearTimeout(navTimer);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-paper flex flex-col items-center justify-center font-body">
      <div className="flex flex-col items-center gap-6">
        <MonoLogo className="w-32 h-32 sm:w-40 sm:h-40" />
        <p
          className={`text-[26px] sm:text-[30px] font-bold transition-opacity duration-500 ${
            showText ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <span className="text-navy">Campus</span>
          <span className="text-gold-deep">Gadget</span>
        </p>
      </div>
    </div>
  );
}

