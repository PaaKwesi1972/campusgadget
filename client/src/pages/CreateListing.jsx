import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ImagePlus, X, Home as HomeIcon, MessageCircle, PlusCircle, User } from 'lucide-react';
import { apiRequest } from '../lib/api';
import MonoLogo from '../components/MonoLogo';
import { useUnreadCount } from '../hooks/useUnreadCount';

const CATEGORIES = ['Phones', 'Laptops', 'Tablets', 'Accessories', 'Audio'];
const CONDITIONS = ['New', 'Like New', 'Good', 'Fair'];
import { API_URL } from '../lib/api';

export default function CreateListing() {
  const navigate = useNavigate();
  const unreadCount = useUnreadCount();
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Laptops');
  const [condition, setCondition] = useState('Good');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [published, setPublished] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [error, setError] = useState('');

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  const isValid = title.trim() && price.trim() && description.trim();
  const isBusy = uploadingPhoto || loading;

  const handlePublish = async (e) => {
    e.preventDefault();
    if (!isValid) return;

    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    setError('');
    setLoading(true);

    try {
      let imageUrl = null;

      if (photoFile) {
        setUploadingPhoto(true);
        const formData = new FormData();
        formData.append('image', photoFile);

        const uploadRes = await fetch(`${API_URL}/api/upload`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.error || 'Photo upload failed.');
        imageUrl = uploadData.imageUrl;
        setUploadingPhoto(false);
      }

      await apiRequest('/api/listings', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title,
          description,
          price: Number(price),
          category,
          condition,
          imageUrl,
        }),
      });

      setPublished(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setUploadingPhoto(false);
    }
  };

  const navItems = [
    { key: 'home', label: 'Home', icon: HomeIcon, path: '/home' },
    { key: 'messages', label: 'Messages', icon: MessageCircle, path: '/messages' },
    { key: 'sell', label: 'Sell', icon: PlusCircle, path: '/sell' },
    { key: 'profile', label: 'Profile', icon: User, path: '/profile' },
  ];

  if (published) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center font-body">
        <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-6">
          <CheckCircle2 className="w-9 h-9 text-green-600" strokeWidth={2} />
        </div>
        <h1 className="font-display text-[1.6rem] font-semibold text-navy mb-3">
          Listing published
        </h1>
        <p className="text-slate text-[14.5px] leading-relaxed mb-8 max-w-xs">
          "{title}" is now live for other verified students to see.
        </p>
        <button
          onClick={() => navigate('/home')}
          className="w-full max-w-xs bg-navy text-gold font-bold tracking-[0.1em] text-sm py-4 rounded-full active:scale-[0.98] hover:bg-navy-light transition"
        >
          BACK TO HOME
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-body pb-16 lg:pb-0">
      {isBusy && (
        <div className="fixed inset-0 bg-white/95 flex flex-col items-center justify-center z-50">
          <MonoLogo className="w-28 h-28 animate-[pulseLogo_1.2s_ease-in-out_infinite]" />
          <p className="text-[18px] font-bold mt-5">
            <span className="text-navy">Campus</span>
            <span className="text-gold-deep">Gadget</span>
          </p>
          <p className="text-mute text-[13px] font-medium mt-2 tracking-wide">
            {uploadingPhoto ? 'Uploading photo...' : 'Publishing listing...'}
          </p>
        </div>
      )}

      <div className="bg-navy px-6 pt-8 pb-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/home')} className="text-white/80 hover:text-white transition">
            <X className="w-5 h-5" strokeWidth={2.2} />
          </button>
          <p className="text-white font-semibold text-[15px]">List a Gadget</p>
        </div>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map(({ key, label, icon: Icon, path }) => (
            <button
              key={key}
              onClick={() => navigate(path)}
              className="relative flex items-center gap-2 px-4 py-2.5 rounded-full text-[13.5px] font-semibold text-white/70 hover:bg-white/10 hover:text-white transition-colors"
            >
              <div className="relative">
                <Icon className="w-4 h-4" strokeWidth={2.2} />
                {key === 'messages' && unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[14px] h-3.5 px-1 rounded-full bg-red-500 text-white text-[8px] font-bold flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </div>
              {label}
            </button>
          ))}
        </nav>
      </div>

      <form onSubmit={handlePublish} className="max-w-lg mx-auto px-6 py-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6">
            <p className="text-red-600 text-[13px] font-medium">{error}</p>
          </div>
        )}

        <p className="text-[11px] font-semibold tracking-[0.15em] uppercase text-mute mb-2">
          Photo
        </p>
        <div className="mb-6">
          {photoPreview ? (
            <div className="relative aspect-square w-32 rounded-xl overflow-hidden bg-line">
              <img src={photoPreview} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={removePhoto}
                className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-navy/80 flex items-center justify-center"
              >
                <X className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
              </button>
            </div>
          ) : (
            <label className="w-32 aspect-square rounded-xl border-2 border-dashed border-line flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:border-gold-deep transition-colors">
              <ImagePlus className="w-5 h-5 text-gold-deep" strokeWidth={2} />
              <span className="text-[10.5px] font-semibold text-slate text-center px-2">Add photo</span>
              <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
            </label>
          )}
        </div>

        <label className="block text-[11px] font-semibold tracking-[0.15em] uppercase text-mute mb-2">
          Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. MacBook Air M1, 256GB"
          className="w-full bg-transparent border-b-2 border-line focus:border-gold-deep outline-none py-2.5 text-navy placeholder-mute transition-colors mb-6"
        />

        <label className="block text-[11px] font-semibold tracking-[0.15em] uppercase text-mute mb-2">
          Category
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full bg-transparent border-b-2 border-line focus:border-gold-deep outline-none py-2.5 text-navy mb-6 appearance-none"
        >
          {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
        </select>

        <label className="block text-[11px] font-semibold tracking-[0.15em] uppercase text-mute mb-2.5">
          Condition
        </label>
        <div className="flex gap-2 mb-6">
          {CONDITIONS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCondition(c)}
              className={`px-3.5 py-2 rounded-full text-[12.5px] font-semibold border transition-colors ${
                condition === c ? 'bg-navy text-gold border-navy' : 'bg-white text-navy border-line'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <label className="block text-[11px] font-semibold tracking-[0.15em] uppercase text-mute mb-2">
          Price (GHS)
        </label>
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="0.00"
          className="w-full bg-transparent border-b-2 border-line focus:border-gold-deep outline-none py-2.5 text-navy placeholder-mute transition-colors mb-6"
        />

        <label className="block text-[11px] font-semibold tracking-[0.15em] uppercase text-mute mb-2">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Condition details, reason for selling, meet-up location..."
          rows={3}
          className="w-full bg-transparent border-b-2 border-line focus:border-gold-deep outline-none py-2.5 text-navy placeholder-mute transition-colors mb-8 resize-none"
        />

        <button
          type="submit"
          disabled={!isValid || isBusy}
          className={`w-full font-bold tracking-[0.1em] text-sm py-4 rounded-full transition ${
            isValid && !isBusy ? 'bg-navy text-gold active:scale-[0.98] hover:bg-navy-light' : 'bg-line text-mute cursor-not-allowed'
          }`}
        >
          PUBLISH LISTING
        </button>
      </form>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-20 bg-navy px-3 pt-2.5 pb-[calc(0.625rem+env(safe-area-inset-bottom))]">
        <div className="max-w-md mx-auto flex items-center justify-around">
          {navItems.map(({ key, label, icon: Icon, path }) => (
            <button key={key} onClick={() => navigate(path)} className="relative flex flex-col items-center gap-1 px-3 py-1">
              <div className="relative">
                <Icon className={`w-[18px] h-[18px] ${key === 'sell' ? 'text-gold' : 'text-white/50'}`} strokeWidth={2.2} />
                {key === 'messages' && unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </div>
              <span className={`text-[9.5px] font-semibold ${key === 'sell' ? 'text-gold' : 'text-white/50'}`}>
                {label}
              </span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

