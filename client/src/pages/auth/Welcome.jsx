import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowUpRight,
  ShieldCheck,
  Sparkles,
  Store,
  Users,
  CheckCircle2,
} from 'lucide-react';
import MonoLogo from '../../components/MonoLogo';

const gadgetImages = [
  {
    name: 'Apple AirPods Pro Box',
    src: 'https://files.manuscdn.com/search-media/310519663165754063/fthmqY6RW567WHPoTi1R0l/CeQHaNBbuoVdD3QUGRSeXm.jpg',
    alt: 'Apple AirPods Pro retail box displayed clearly',
  },
  {
    name: 'Dark AirPods Pro',
    src: 'https://files.manuscdn.com/search-media/310519663165754063/fthmqY6RW567WHPoTi1R0l/HDXAK8TVJP4UWVTboA8xsM.jpg',
    alt: 'Dark AirPods Pro displayed clearly without hands',
  },
  {
    name: 'PlayStation 5',
    src: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=2400&q=95',
    alt: 'PlayStation 5 console displayed clearly',
  },
  {
    name: 'MacBook',
    src: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663165754063/KhjzdWlSmOVryVff.png',
    alt: 'High-resolution MacBook displayed with its packaging',
  },
  {
    name: 'Wireless Mouse',
    src: 'https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=2400&q=95',
    alt: 'Wireless mouse displayed clearly without hands',
  },
  {
    name: 'Two iPhones',
    src: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663165754063/iRQCXuixCRHewFou.webp',
    alt: 'Orange and blue iPhones displayed clearly from a wider view',
  },
  {
    name: 'PS5 Controllers',
    src: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663165754063/njFWWfgKlfEOTTlo.jpg',
    alt: 'PS5 controllers displayed clearly without hands',
  },
];

const universityImages = [
  {
    name: 'University of Ghana Main Building',
    src: 'https://files.manuscdn.com/search-media/310519663165754063/fthmqY6RW567WHPoTi1R0l/T52FcyRGtTFgHoAz2sCWmV.jpg',
    alt: 'University of Ghana main building and clock tower',
  },
  {
    name: 'Balme Library',
    src: 'https://files.manuscdn.com/search-media/310519663165754063/fthmqY6RW567WHPoTi1R0l/L4KkzKARqUEnGrSHRW8ovn.jpeg',
    alt: 'Balme Library at the University of Ghana',
  },
  {
    name: 'University of Ghana Great Hall',
    src: 'https://files.manuscdn.com/search-media/310519663165754063/fthmqY6RW567WHPoTi1R0l/bgt64LE2yr3nMVNC4Ts5ba.jpeg',
    alt: 'University of Ghana Great Hall',
  },
];

function RotatingImage({ images, type } ) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setIsFading(true);

      window.setTimeout(() => {
        setCurrentIndex((previousIndex) => {
          return (previousIndex + 1) % images.length;
        });

        setIsFading(false);
      }, 400);
    }, type === 'gadget' ? 4200 : 5200);

    return () => window.clearInterval(interval);
  }, [images.length, type]);

  const currentImage = images[currentIndex];

  const handleImageError = () => {
    setIsFading(true);

    window.setTimeout(() => {
      setCurrentIndex((previousIndex) => {
        return (previousIndex + 1) % images.length;
      });

      setIsFading(false);
    }, 300);
  };

  return (
    <img
      key={`${type}-${currentIndex}`}
      src={currentImage.src}
      alt={currentImage.alt}
      onError={handleImageError}
      className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-500 ${
        isFading ? 'opacity-0' : 'opacity-100'
      }`}
      loading={currentIndex === 0 ? 'eager' : 'lazy'}
      decoding="async"
    />
  );
}

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen overflow-hidden bg-[#fbfaf7] font-body text-[#10143f]">
      <header className="relative z-10 flex items-center justify-between px-5 py-5 sm:px-10 lg:px-16">
        <div className="flex items-center gap-2.5">
          <div className="grid h-10 w-10 place-items-center rounded-xl border border-[#e5e1d8] bg-white">
            <MonoLogo className="h-6 w-6" color="#10143f" />
          </div>

          <div>
            <p className="text-[12px] font-black uppercase tracking-[0.18em]">
              Campus<span className="text-[#c89036]">Gadget</span>
            </p>

            <p className="mt-0.5 text-[9px] text-[#817c72]">
              Student marketplace
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/login')}
          className="flex items-center gap-2 rounded-full border border-[#e5e1d8] bg-white px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.1em] transition hover:border-[#c89036]"
        >
          Log in
          <ArrowUpRight className="h-3.5 w-3.5 text-[#c89036]" />
        </button>
      </header>

      <main className="mx-auto grid min-h-[calc(100vh-88px)] max-w-[1440px] items-center gap-10 px-5 pb-10 pt-5 sm:px-10 lg:grid-cols-[1.02fr_0.98fr] lg:gap-16 lg:px-16 lg:pb-16">
        <section className="relative">
          <div className="absolute -left-28 -top-24 h-72 w-72 rounded-full border-[30px] border-[#f3e8d1]/70" />

          <div className="relative max-w-[650px]">
            <div className="mb-7 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#c89036]">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#f7efdf]">
                <Sparkles className="h-3.5 w-3.5" />
              </span>

              University of Ghana · student market
            </div>

            <h1 className="text-[3.35rem] font-black leading-[0.94] tracking-[-0.075em] sm:text-[5rem] lg:text-[5.8rem]">
              Useful tech
                

              should stay
                

              <span className="text-[#c89036]">on campus.</span>
            </h1>

            <p className="mt-7 max-w-[480px] text-[14px] leading-7 text-[#77736c] sm:text-[15px]">
              Buy, sell, and trade gadgets with verified University of Ghana
              students. A simpler way to find what you need and pass on what
              you no longer use.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => navigate('/signup')}
                className="group flex items-center justify-center gap-2 rounded-full bg-[#10143f] px-6 py-4 text-[11px] font-black uppercase tracking-[0.12em] text-[#d7a23a] transition hover:bg-[#c89036] hover:text-[#10143f]"
              >
                Create free account
                <ArrowUpRight className="h-4 w-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </button>

              <button
                onClick={() => navigate('/vendor-signup')}
                className="flex items-center justify-center gap-2 rounded-full border border-[#e5e1d8] bg-white px-6 py-4 text-[11px] font-black uppercase tracking-[0.12em] text-[#10143f] transition hover:border-[#c89036]"
              >
                <Store className="h-4 w-4 text-[#c89036]" />
                Register as vendor
              </button>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-3 border-t border-[#e5e1d8] pt-5">
              <div className="flex items-center gap-2 text-[11px] font-bold text-[#77736c]">
                <ShieldCheck className="h-4 w-4 text-[#c89036]" />
                Verified students
              </div>

              <div className="flex items-center gap-2 text-[11px] font-bold text-[#77736c]">
                <CheckCircle2 className="h-4 w-4 text-[#c89036]" />
                Safer handoffs
              </div>

              <div className="flex items-center gap-2 text-[11px] font-bold text-[#77736c]">
                <Users className="h-4 w-4 text-[#c89036]" />
                Built for UG
              </div>
            </div>
          </div>
        </section>

        <section className="relative mx-auto w-full max-w-[560px] lg:max-w-none">
          <div className="absolute -right-14 -top-16 h-40 w-40 rounded-full bg-[#f7efdf]" />

          <div className="relative grid grid-cols-2 gap-3 sm:gap-4">
            <div className="relative col-span-2 aspect-[1.55] overflow-hidden rounded-[28px] bg-[#e8e2d8] shadow-[0_18px_45px_rgba(16,20,63,0.09)] sm:aspect-[1.7]">
              <RotatingImage images={gadgetImages} type="gadget" />

              <div className="absolute inset-0 bg-gradient-to-t from-[#10143f]/75 via-transparent to-transparent" />

              <div className="absolute bottom-5 left-5">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#d7a23a]">
                  Clear gadgets for sale
                </p>

                <p className="mt-1 text-[20px] font-black text-white">
                  Find your next useful thing.
                </p>
              </div>
            </div>

            <div className="relative aspect-square overflow-hidden rounded-[24px] bg-[#d7c6ae]">
              <RotatingImage images={universityImages} type="campus" />

              <div className="absolute inset-0 bg-gradient-to-t from-[#10143f]/70 via-transparent to-transparent" />

              <div className="absolute inset-x-3 bottom-3 rounded-xl bg-white/90 px-3 py-2">
                <p className="text-[10px] font-black text-[#10143f]">
                  University of Ghana
                </p>

                <p className="mt-0.5 text-[9px] text-[#817c72]">
                  Explore campus life
                </p>
              </div>
            </div>

            <div className="flex aspect-square flex-col justify-between rounded-[24px] bg-[#10143f] p-5 text-white shadow-[0_18px_45px_rgba(16,20,63,0.09)]">
              <div className="flex items-center justify-between">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/10">
                  <ShieldCheck className="h-4 w-4 text-[#d7a23a]" />
                </span>

                <span className="text-[9px] font-black uppercase tracking-[0.14em] text-[#d7a23a]">
                  Trust first
                </span>
              </div>

              <div>
                <p className="text-[22px] font-black leading-tight tracking-[-0.04em]">
                  No strangers.
                    

                  Just campus.
                </p>

                <p className="mt-3 text-[11px] leading-5 text-white/55">
                  Verified university emails keep the community close.
                </p>
              </div>
            </div>
          </div>

          <div className="absolute -bottom-5 -right-3 hidden rounded-2xl border border-[#e5e1d8] bg-white px-4 py-3 shadow-[0_12px_28px_rgba(16,20,63,0.08)] sm:block">
            <p className="flex items-center gap-2 text-[11px] font-black">
              <span className="h-2 w-2 rounded-full bg-[#30924a]" />
              Campus community
            </p>

            <p className="mt-1 text-[10px] text-[#817c72]">
              Buy · sell · connect
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
