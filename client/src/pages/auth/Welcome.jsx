import { useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import MonoLogo from '../../components/MonoLogo';

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 font-body">
      <div className="w-full max-w-sm flex flex-col items-center text-center">
       <MonoLogo className="w-20 h-20 sm:w-24 sm:h-24" />
        <p className="text-[11px] tracking-[0.3em] font-bold mt-4 mb-10">
  <span className="text-navy">CAMPUS</span>
  <span className="text-gold-deep">GADGET</span>
</p>

        <h1 className="font-display text-[2rem] font-semibold text-navy leading-tight mb-3">
          Buy, sell, and trade <span className="text-gold-deep">gadgets on campus.</span>
        </h1>
        <p className="font-body text-slate text-[15px] leading-relaxed mb-9">
          A marketplace built only for verified University of Ghana students. No strangers, no scams  just campus.
        </p>

        <button
          onClick={() => navigate('/signup')}
          className="w-full bg-navy text-gold font-semibold text-sm tracking-wide py-4 rounded-full active:scale-[0.98] hover:bg-navy-light transition mb-3"
        >
          CREATE ACCOUNT
        </button>

        <button
          onClick={() => navigate('/login')}
          className="w-full bg-white text-navy font-semibold text-sm tracking-wide py-4 rounded-full border border-line active:scale-[0.98] hover:bg-navy/[0.03] transition"
        >
          I ALREADY HAVE AN ACCOUNT
        </button>
<div className="flex items-center justify-center gap-2 mt-8 text-mute text-[13px]">
  <ShieldCheck className="w-4 h-4" strokeWidth={2} />
  A marketplace built for your campus community
</div>
<button
  onClick={() => navigate('/vendor-signup')}
  className="text-center text-mute text-[12.5px] mt-4 underline decoration-line decoration-2 underline-offset-2"
>
  Own an off-campus business? Register as a vendor
</button>




        
      </div>
    </div>
  );
}

