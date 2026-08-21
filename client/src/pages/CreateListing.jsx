import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ImagePlus, X, Home as HomeIcon, MessageCircle, PlusCircle, User } from 'lucide-react';
import { apiRequest } from '../lib/api';
import MonoLogo from '../components/MonoLogo';
import PageHeader from '../components/PageHeader';
import { useUnreadCount } from '../hooks/useUnreadCount';

const CATEGORIES = ['Phones', 'Laptops', 'Tablets', 'Accessories', 'Audio'];
const CONDITIONS = ['New', 'Like New', 'Good', 'Fair'];
const API_URL = 'http://localhost:5000';

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

  function handlePhotoChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  function removePhoto() {
    setPhotoFile(null);
    setPhotoPreview(null);
  }

  const isValid = title.trim() && price.trim() && description.trim();
  const isBusy = uploadingPhoto || loading;

  async function handlePublish(e) {
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

        const uploadRes = await fetch(API_URL + '/api/upload', {
          method: 'POST',
          headers: { Authorization: 'Bearer ' + token },
          body: formData,
        });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.error || 'Photo upload failed.');
        imageUrl = uploadData.imageUrl;
        setUploadingPhoto(false);
      }

      await apiRequest('/api/listings', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + token },
        body: JSON.stringify({ title, description, price: Number(price), category, condition, imageUrl }),
      });

      setPublished(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setUploadingPhoto(false);
    }
  }

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
          onClick={function () { navigate('/home'); }}
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

      <PageHeader onBack={function () { navigate('/home'); }} />

      <form onSubmit={handlePublish} className="max-w-lg mx-auto px-6 pt-6 pb-10">
        <h1 className="font-display text-[1.6rem] font-semibold text-navy leading-tight mb-1.5">
          List a gadget
        </h1>
        <p className="text-slate text-[14px] leading-relaxed mb-8">
          Add a few details and a photo &mdash; your listing goes live instantly for verified students to see.
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6">
            <p className="text-red-600 text-[13px] font-medium">{error}</p>
          </div>
        )}

        {/* Photo upload — full width, more inviting */}
        <div className="mb-8">
          {photoPreview ? (
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-line">
              <img src={photoPreview} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={removePhoto}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-navy/80 flex items-center justify-center"
              >
                <X className="w-4 h-4 text-white" strokeWidth={2.5} />
              </button>
              <span className="absolute bottom-3 left-3 text-[11px] font-semibold bg-white/90 text-navy px-2.5 py-1 rounded-full">
                Tap the X to change photo
              </span>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center gap-2.5 aspect-[4/3] rounded-2xl border-2 border-dashed border-line hover:border-gold-deep bg-[#FAF7F1] transition-colors cursor-pointer">
              <div className="w-12 h-12 rounded-full bg-[#F9EFE0] flex items-center justify-center">
                <ImagePlus className="w-5 h-5 text-gold-deep" strokeWidth={2} />
              </div>
              <span className="text-[14px] font-semibold text-navy">Add a photo</span>
              <span className="text-[12px] text-mute">A clear photo helps your listing sell faster</span>
              <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
            </label>
          )}
        </div>

        <div className="h-px bg-line mb-7" />

        <div className="space-y-6">
          <div>
            <label className="block text-[11px] font-semibold tracking-[0.15em] uppercase text-mute mb-2">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={function (e) { setTitle(e.target.value); }}
              placeholder="e.g. MacBook Air M1, 256GB"
              className="w-full bg-transparent border-b-2 border-line focus:border-gold-deep outline-none py-2.5 text-navy placeholder-mute transition-colors"
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-[11px] font-semibold tracking-[0.15em] uppercase text-mute mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={function (e) { setCategory(e.target.value); }}
                className="w-full bg-transparent border-b-2 border-line focus:border-gold-deep outline-none py-2.5 text-navy appearance-none"
              >
                {CATEGORIES.map(function (cat) { return <option key={cat} value={cat}>{cat}</option>; })}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-[11px] font-semibold tracking-[0.15em] uppercase text-mute mb-2">
                Price (GHS)
              </label>
              <input
                type="number"
                value={price}
                onChange={function (e) { setPrice(e.target.value); }}
                placeholder="0.00"
                className="w-full bg-transparent border-b-2 border-line focus:border-gold-deep outline-none py-2.5 text-navy placeholder-mute transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold tracking-[0.15em] uppercase text-mute mb-3">
              Condition
            </label>
            <div className="flex flex-wrap gap-2">
              {CONDITIONS.map(function (c) {
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={function () { setCondition(c); }}
                    className={'px-4 py-2 rounded-full text-[12.5px] font-semibold border transition-colors ' + (condition === c ? 'bg-navy text-gold border-navy' : 'bg-white text-navy border-line')}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold tracking-[0.15em] uppercase text-mute mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={function (e) { setDescription(e.target.value); }}
              placeholder="Condition details, reason for selling, meet-up location..."
              rows={4}
              className="w-full bg-[#FAF7F1] rounded-xl px-4 py-3.5 text-navy placeholder-mute outline-none border-2 border-transparent focus:border-gold-deep transition-colors resize-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={!isValid || isBusy}
          className={'w-full font-bold tracking-[0.1em] text-sm py-4 rounded-full transition mt-9 ' + (isValid && !isBusy ? 'bg-navy text-gold active:scale-[0.98] hover:bg-navy-light' : 'bg-line text-mute cursor-not-allowed')}
        >
          PUBLISH LISTING
        </button>
      </form>

      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-20 bg-navy px-3 pt-2.5 pb-[calc(0.625rem+env(safe-area-inset-bottom))]">
        <div className="max-w-md mx-auto flex items-center justify-around">
          {navItems.map(function (item) {
            const Icon = item.icon;
            const active = item.key === 'sell';
            return (
              <button key={item.key} onClick={function () { navigate(item.path); }} className="relative flex flex-col items-center gap-1 px-3 py-1">
                <div className="relative">
                  <Icon className={'w-[18px] h-[18px] ' + (active ? 'text-gold' : 'text-white/50')} strokeWidth={2.2} />
                  {item.key === 'messages' && unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <span className={'text-[9.5px] font-semibold ' + (active ? 'text-gold' : 'text-white/50')}>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
