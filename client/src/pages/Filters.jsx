import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';

const CATEGORIES = ['Phones', 'Laptops', 'Tablets', 'Accessories', 'Audio'];
const CONDITIONS = ['New', 'Like New', 'Good', 'Fair'];

export default function Filters() {
  const navigate = useNavigate();
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedConditions, setSelectedConditions] = useState([]);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(5000);

  function toggleCategory(cat) {
    setSelectedCategories(function (prev) {
      if (prev.includes(cat)) return prev.filter(function (c) { return c !== cat; });
      return prev.concat([cat]);
    });
  }

  function toggleCondition(cond) {
    setSelectedConditions(function (prev) {
      if (prev.includes(cond)) return prev.filter(function (c) { return c !== cond; });
      return prev.concat([cond]);
    });
  }

  function handleReset() {
    setSelectedCategories([]);
    setSelectedConditions([]);
    setMinPrice(0);
    setMaxPrice(5000);
  }

  function handleApply() {
    navigate('/home', {
      state: {
        filters: {
          categories: selectedCategories,
          conditions: selectedConditions,
          minPrice: minPrice,
          maxPrice: maxPrice,
        },
      },
    });
  }

  return (
    <div className="min-h-screen bg-black/40 flex items-end sm:items-center sm:justify-center font-body">
      <div className="w-full sm:max-w-md bg-white rounded-t-[1.75rem] sm:rounded-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-center pt-3">
          <div className="w-10 h-1 rounded-full bg-line" />
        </div>

        <div className="px-6 pt-5 pb-8">
          <div className="flex items-center justify-between mb-7">
            <h1 className="font-display text-[1.4rem] font-semibold text-navy">Filters</h1>
            <button onClick={handleReset} className="text-gold-deep text-[13px] font-semibold">
              Reset
            </button>
          </div>

          <p className="text-[11px] font-semibold tracking-[0.15em] uppercase text-mute mb-3">
            Price Range (GHS)
          </p>
          <div className="flex items-center gap-3 mb-2">
            <input
              type="number"
              value={minPrice}
              onChange={function (e) { setMinPrice(Number(e.target.value)); }}
              className="w-full bg-[#F5F2EC] rounded-lg px-3 py-2 text-navy text-[14px] outline-none focus:ring-2 focus:ring-gold-deep"
            />
            <span className="text-mute text-[13px]">to</span>
            <input
              type="number"
              value={maxPrice}
              onChange={function (e) { setMaxPrice(Number(e.target.value)); }}
              className="w-full bg-[#F5F2EC] rounded-lg px-3 py-2 text-navy text-[14px] outline-none focus:ring-2 focus:ring-gold-deep"
            />
          </div>
          <input
            type="range"
            min="0"
            max="5000"
            step="50"
            value={maxPrice}
            onChange={function (e) { setMaxPrice(Number(e.target.value)); }}
            className="w-full accent-gold-deep mb-7"
          />

          <p className="text-[11px] font-semibold tracking-[0.15em] uppercase text-mute mb-2.5">
            Condition
          </p>
          <div className="flex flex-wrap gap-2 mb-7">
            {CONDITIONS.map(function (cond) {
              return (
                <button
                  key={cond}
                  onClick={function () { toggleCondition(cond); }}
                  className={'px-3.5 py-2 rounded-full text-[12.5px] font-semibold border transition-colors ' + (selectedConditions.includes(cond) ? 'bg-navy text-gold border-navy' : 'bg-white text-navy border-line')}
                >
                  {cond}
                </button>
              );
            })}
          </div>

          <p className="text-[11px] font-semibold tracking-[0.15em] uppercase text-mute mb-3">
            Category
          </p>
          <div className="space-y-3 mb-8">
            {CATEGORIES.map(function (cat) {
              return (
                <label key={cat} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(cat)}
                    onChange={function () { toggleCategory(cat); }}
                    className="w-5 h-5 rounded accent-navy"
                  />
                  <span className="text-navy text-[14px]">{cat}</span>
                </label>
              );
            })}
          </div>

          <button
            onClick={handleApply}
            className="w-full bg-navy text-gold font-bold tracking-[0.1em] text-sm py-4 rounded-full active:scale-[0.98] hover:bg-navy-light transition"
          >
            SHOW RESULTS
          </button>
        </div>
      </div>

      <button
        onClick={function () { navigate(-1); }}
        className="hidden sm:flex fixed top-6 right-6 w-10 h-10 rounded-full bg-white items-center justify-center"
        aria-label="Close"
      >
        <X className="w-4 h-4 text-navy" strokeWidth={2.2} />
      </button>
    </div>
  );
}