import MonoLogo from './MonoLogo';

export default function PageLoader() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center font-body">
      <MonoLogo className="w-20 h-20 animate-[pulseLogo_1.2s_ease-in-out_infinite]" />
      <p className="text-[16px] font-bold mt-4">
        <span className="text-navy">Campus</span>
        <span className="text-gold-deep">Gadget</span>
      </p>
    </div>
  );
}
