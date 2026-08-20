import { ArrowLeft } from 'lucide-react';

export default function PageHeader({ onBack }) {
  return (
    <div className="sticky top-0 z-30 bg-white px-6 pt-8 pb-4 flex items-center justify-between">
      <button onClick={onBack} className="text-navy/70 hover:text-navy transition">
        <ArrowLeft className="w-5 h-5" strokeWidth={2.2} />
      </button>
      <p className="text-[11px] tracking-[0.2em] font-bold">
        <span className="text-navy">CAMPUS</span>
        <span className="text-gold-deep">GADGET</span>
      </p>
    </div>
  );
}

