import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ArrowUpRight, Check, RotateCcw, SlidersHorizontal,
} from 'lucide-react';
import DashboardSidebar, { DashboardFooter } from '../components/DashboardSidebar';

const CATEGORIES = [
  { name: 'Phones', note: 'Everyday carry' },
  { name: 'Laptops', note: 'Study and work' },
  { name: 'Tablets', note: 'Notes and media' },
  { name: 'Accessories', note: 'Small essentials' },
  { name: 'Audio', note: 'Sound on the go' },
];
const CONDITIONS = ['New', 'Like New', 'Good', 'Fair'];
const MAX_PRICE = 5000;

export default function Filters() {
  const navigate = useNavigate();
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedConditions, setSelectedConditions] = useState([]);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(MAX_PRICE);

  function toggleCategory(category) {
    setSelectedCategories((prev) => prev.includes(category) ? prev.filter((item) => item !== category) : prev.concat(category));
  }

  function toggleCondition(condition) {
    setSelectedConditions((prev) => prev.includes(condition) ? prev.filter((item) => item !== condition) : prev.concat(condition));
  }

  function updateMinPrice(value) {
    const next = Math.max(0, Math.min(Number(value) || 0, maxPrice));
    setMinPrice(next);
  }

  function updateMaxPrice(value) {
    const next = Math.min(MAX_PRICE, Math.max(Number(value) || 0, minPrice));
    setMaxPrice(next);
  }

  function handleReset() {
    setSelectedCategories([]);
    setSelectedConditions([]);
    setMinPrice(0);
    setMaxPrice(MAX_PRICE);
  }

  function handleApply() {
    navigate('/home', { state: { filters: { categories: selectedCategories, conditions: selectedConditions, minPrice, maxPrice } } });
  }

  const activeFilterCount = selectedCategories.length + selectedConditions.length + (minPrice > 0 ? 1 : 0) + (maxPrice < MAX_PRICE ? 1 : 0);
  const rangeWidth = useMemo(() => Math.max(4, ((maxPrice - minPrice) / MAX_PRICE) * 100), [minPrice, maxPrice]);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#fbfaf7] pb-24 font-body text-[#10143f] lg:pb-10 lg:pl-64">
      <DashboardSidebar active="home" />
      <header className="border-b border-[#e5e1d8] bg-[#fbfaf7]"><div className="mx-auto flex h-[72px] max-w-[1040px] items-center justify-between px-5 sm:px-8 lg:px-12"><button onClick={() => navigate(-1)} className="flex items-center gap-3"><ArrowLeft className="h-5 w-5" /><span className="hidden text-[12px] font-semibold sm:inline">Back to browse</span></button><p className="text-[11px] font-black uppercase tracking-[0.2em]">Campus<span className="text-[#c89036]">Gadget</span></p><button onClick={handleReset} className="flex items-center gap-2 text-[11px] font-black text-[#a77b2e]"><RotateCcw className="h-3.5 w-3.5" /> Reset</button></div></header>

      <main className="mx-auto max-w-[1040px] px-5 py-9 sm:px-8 sm:py-12 lg:px-12 lg:py-16">
        <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-[#c89036]"><SlidersHorizontal className="h-3.5 w-3.5" /> Refine your browse</p><h1 className="font-display text-[3rem] leading-none tracking-[-0.065em] sm:text-[4rem]">Find the right fit.</h1><p className="mt-4 max-w-md text-[14px] leading-7 text-[#77736c]">Narrow the exchange down to the kind of gadget, condition, and price you actually want.</p></div><div className="self-start rounded-full border border-[#e5e1d8] bg-white px-4 py-2 text-[11px] font-black text-[#77736c] sm:self-auto">{activeFilterCount === 0 ? 'No filters selected' : activeFilterCount + ' filter' + (activeFilterCount === 1 ? '' : 's') + ' selected'}</div></div>

        <div className="grid gap-10 lg:grid-cols-[1fr_0.82fr] lg:gap-16">
          <div className="space-y-10">
            <section><div className="mb-4 flex items-end justify-between"><div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#9a958c]">01 · Category</p><h2 className="mt-1 text-[18px] font-black">What are you looking for?</h2></div><span className="text-[11px] text-[#aaa59c]">Choose any</span></div><div className="grid gap-2 sm:grid-cols-2">{CATEGORIES.map((category) => { const selected = selectedCategories.includes(category.name); return <button key={category.name} onClick={() => toggleCategory(category.name)} className={'flex items-center justify-between border p-4 text-left transition ' + (selected ? 'border-[#10143f] bg-[#10143f] text-white' : 'border-[#e5e1d8] bg-white hover:border-[#c89036]')}><span><span className={'block text-[13px] font-black ' + (selected ? 'text-[#d7a23a]' : 'text-[#10143f]')}>{category.name}</span><span className={'mt-1 block text-[11px] ' + (selected ? 'text-white/60' : 'text-[#817c72]')}>{category.note}</span></span><span className={'grid h-6 w-6 place-items-center rounded-full border ' + (selected ? 'border-[#d7a23a] bg-[#d7a23a] text-[#10143f]' : 'border-[#d9d4ca] text-transparent')}><Check className="h-3.5 w-3.5" /></span></button>; })}</div></section>

            <section><div className="mb-4 flex items-end justify-between"><div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#9a958c]">02 · Condition</p><h2 className="mt-1 text-[18px] font-black">How should it feel?</h2></div><span className="text-[11px] text-[#aaa59c]">Choose any</span></div><div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{CONDITIONS.map((condition) => { const selected = selectedConditions.includes(condition); return <button key={condition} onClick={() => toggleCondition(condition)} className={'flex items-center justify-between border px-3 py-3.5 text-left text-[12px] font-black transition ' + (selected ? 'border-[#10143f] bg-[#10143f] text-[#d7a23a]' : 'border-[#e5e1d8] bg-white text-[#77736c] hover:border-[#c89036]')}>{condition}{selected && <Check className="h-3.5 w-3.5" />}</button>; })}</div></section>
          </div>

          <aside className="h-fit border border-[#e5e1d8] bg-white p-5 sm:p-7 lg:sticky lg:top-28"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#9a958c]">03 · Budget</p><h2 className="mt-1 text-[18px] font-black">Set your price range</h2><p className="mt-2 text-[12px] leading-6 text-[#817c72]">Prices are in Ghana cedis. Leave the range wide to see everything.</p><div className="mt-7 grid grid-cols-[1fr_auto_1fr] items-end gap-3"><label className="block"><span className="mb-2 block text-[10px] font-black uppercase tracking-[0.14em] text-[#9a958c]">From</span><div className="flex items-center border-b border-[#c9c3b8] py-2"><span className="mr-1 text-[12px] text-[#aaa59c]">GHS</span><input type="number" min="0" max={maxPrice} value={minPrice} onChange={(event) => updateMinPrice(event.target.value)} className="w-full bg-transparent text-[14px] font-black outline-none" /></div></label><span className="pb-2 text-[11px] text-[#aaa59c]">to</span><label className="block"><span className="mb-2 block text-[10px] font-black uppercase tracking-[0.14em] text-[#9a958c]">Up to</span><div className="flex items-center border-b border-[#c9c3b8] py-2"><span className="mr-1 text-[12px] text-[#aaa59c]">GHS</span><input type="number" min={minPrice} max={MAX_PRICE} value={maxPrice} onChange={(event) => updateMaxPrice(event.target.value)} className="w-full bg-transparent text-[14px] font-black outline-none" /></div></label></div><div className="relative mt-8 h-1 rounded-full bg-[#e5e1d8]"><div className="absolute h-1 rounded-full bg-[#c89036]" style={{ left: (minPrice / MAX_PRICE) * 100 + '%', width: rangeWidth + '%' }} /><input aria-label="Minimum price" type="range" min="0" max={MAX_PRICE} step="50" value={minPrice} onChange={(event) => updateMinPrice(event.target.value)} className="pointer-events-none absolute -top-2 h-5 w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#10143f] [&::-webkit-slider-thumb]:bg-[#d7a23a]" /><input aria-label="Maximum price" type="range" min="0" max={MAX_PRICE} step="50" value={maxPrice} onChange={(event) => updateMaxPrice(event.target.value)} className="pointer-events-none absolute -top-2 h-5 w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#10143f] [&::-webkit-slider-thumb]:bg-[#d7a23a]" /></div><div className="mt-3 flex justify-between text-[10px] text-[#aaa59c]"><span>GHS 0</span><span>GHS 5,000+</span></div><div className="mt-8 border-t border-[#e5e1d8] pt-5"><p className="text-[11px] leading-6 text-[#817c72]">Your choices will be applied to the listings on the Home page. You can change them anytime.</p><button onClick={handleApply} className="mt-5 flex w-full items-center justify-center gap-2 bg-[#10143f] py-4 text-[12px] font-black text-[#d7a23a] transition hover:bg-[#c89036] hover:text-[#10143f]">Show matching listings <ArrowUpRight className="h-4 w-4" /></button></div></aside>
        </div>
        <DashboardFooter />
      </main>
    </div>
  );
}

