import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, ImagePlus, X } from 'lucide-react';
import { apiRequest, API_URL } from '../lib/api';
import PageLoader from '../components/PageLoader';
import PageHeader from '../components/PageHeader';

const CATEGORIES = ['Phones', 'Laptops', 'Tablets', 'Accessories', 'Audio'];
const CONDITIONS = ['New', 'Like New', 'Good', 'Fair'];
const STATUSES = ['active', 'reserved', 'sold'];

export default function EditListing() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Laptops');
  const [condition, setCondition] = useState('Good');
  const [status, setStatus] = useState('active');

  const [currentImageUrl, setCurrentImageUrl] = useState(null);
  const [newPhotoFile, setNewPhotoFile] = useState(null);
  const [newPhotoPreview, setNewPhotoPreview] = useState(null);

  useEffect(function () {
    async function fetchListing() {
      try {
        const data = await apiRequest('/api/listings/' + id);
        const listing = data.listing;
        setTitle(listing.title);
        setDescription(listing.description || '');
        setPrice(String(listing.price));
        setCategory(listing.category || 'Laptops');
        setCondition(listing.condition || 'Good');
        setStatus(listing.status || 'active');
        setCurrentImageUrl(listing.image_url);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchListing();
  }, [id]);

  function handlePhotoChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setNewPhotoFile(file);
    setNewPhotoPreview(URL.createObjectURL(file));
  }

  function removeNewPhoto() {
    setNewPhotoFile(null);
    setNewPhotoPreview(null);
  }

  async function handleSave(e) {
    e.preventDefault();
    const token = localStorage.getItem('token');
    setSaving(true);
    setError('');

    try {
      let imageUrl;

      if (newPhotoFile) {
        setUploadingPhoto(true);
        const formData = new FormData();
        formData.append('image', newPhotoFile);

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

      await apiRequest('/api/listings/' + id, {
        method: 'PUT',
        headers: { Authorization: 'Bearer ' + token },
        body: JSON.stringify({
          title, description, price: Number(price), category, condition, status,
          imageUrl: imageUrl, // undefined if no new photo was picked, keeping the existing one
        }),
      });

      if (imageUrl) {
        setCurrentImageUrl(imageUrl);
        setNewPhotoFile(null);
        setNewPhotoPreview(null);
      }

      setSaved(true);
      setTimeout(function () { setSaved(false); }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
      setUploadingPhoto(false);
    }
  }

  if (loading) return <PageLoader />;

  const displayImage = newPhotoPreview || currentImageUrl;
  const isBusy = saving || uploadingPhoto;

  return (
    <div className="min-h-screen bg-white font-body">
      <PageHeader onBack={function () { navigate('/my-listings'); }} />

      <form onSubmit={handleSave} className="max-w-lg mx-auto px-6 pt-6 pb-10">
        <h1 className="font-display text-[1.5rem] font-semibold text-navy mb-6">Edit Listing</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6">
            <p className="text-red-600 text-[13px] font-medium">{error}</p>
          </div>
        )}

        {saved && (
          <div className="flex items-center gap-2.5 bg-green-50 rounded-xl px-4 py-3.5 mb-6">
            <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" strokeWidth={2} />
            <p className="text-green-700 text-[13px] font-semibold">Saved successfully.</p>
          </div>
        )}

        <label className="block text-[11px] font-semibold tracking-[0.15em] uppercase text-mute mb-2">Photo</label>
        <div className="mb-6">
          {displayImage ? (
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-line">
              <img src={displayImage} alt="" className="w-full h-full object-cover" />
              <label className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-colors flex items-center justify-center cursor-pointer group">
                <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-white text-navy text-[12.5px] font-semibold px-4 py-2 rounded-full">
                  Change photo
                </span>
                <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
              </label>
              {newPhotoPreview && (
                <button
                  type="button"
                  onClick={removeNewPhoto}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-navy/80 flex items-center justify-center"
                >
                  <X className="w-4 h-4 text-white" strokeWidth={2.5} />
                </button>
              )}
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center gap-2.5 aspect-[4/3] rounded-2xl border-2 border-dashed border-line hover:border-gold-deep bg-[#FAF7F1] transition-colors cursor-pointer">
              <div className="w-12 h-12 rounded-full bg-[#F9EFE0] flex items-center justify-center">
                <ImagePlus className="w-5 h-5 text-gold-deep" strokeWidth={2} />
              </div>
              <span className="text-[14px] font-semibold text-navy">Add a photo</span>
              <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
            </label>
          )}
        </div>
        {newPhotoPreview && (
          <p className="text-gold-deep text-[12px] font-semibold -mt-4 mb-6">New photo selected &mdash; save to apply it.</p>
        )}

        <label className="block text-[11px] font-semibold tracking-[0.15em] uppercase text-mute mb-2">Title</label>
        <input
          type="text"
          value={title}
          onChange={function (e) { setTitle(e.target.value); }}
          className="w-full bg-transparent border-b-2 border-line focus:border-gold-deep outline-none py-2.5 text-navy transition-colors mb-6"
        />

        <label className="block text-[11px] font-semibold tracking-[0.15em] uppercase text-mute mb-2">Category</label>
        <select
          value={category}
          onChange={function (e) { setCategory(e.target.value); }}
          className="w-full bg-transparent border-b-2 border-line focus:border-gold-deep outline-none py-2.5 text-navy mb-6 appearance-none"
        >
          {CATEGORIES.map(function (c) { return <option key={c} value={c}>{c}</option>; })}
        </select>

        <label className="block text-[11px] font-semibold tracking-[0.15em] uppercase text-mute mb-2.5">Condition</label>
        <div className="flex gap-2 mb-6">
          {CONDITIONS.map(function (c) {
            return (
              <button
                key={c}
                type="button"
                onClick={function () { setCondition(c); }}
                className={'px-3.5 py-2 rounded-full text-[12.5px] font-semibold border transition-colors ' + (condition === c ? 'bg-navy text-gold border-navy' : 'bg-white text-navy border-line')}
              >
                {c}
              </button>
            );
          })}
        </div>

        <label className="block text-[11px] font-semibold tracking-[0.15em] uppercase text-mute mb-2">Price (GHS)</label>
        <input
          type="number"
          value={price}
          onChange={function (e) { setPrice(e.target.value); }}
          className="w-full bg-transparent border-b-2 border-line focus:border-gold-deep outline-none py-2.5 text-navy transition-colors mb-6"
        />

        <label className="block text-[11px] font-semibold tracking-[0.15em] uppercase text-mute mb-2.5">Status</label>
        <div className="flex gap-2 mb-6">
          {STATUSES.map(function (s) {
            return (
              <button
                key={s}
                type="button"
                onClick={function () { setStatus(s); }}
                className={'px-3.5 py-2 rounded-full text-[12.5px] font-semibold border capitalize transition-colors ' + (status === s ? 'bg-navy text-gold border-navy' : 'bg-white text-navy border-line')}
              >
                {s}
              </button>
            );
          })}
        </div>

        <label className="block text-[11px] font-semibold tracking-[0.15em] uppercase text-mute mb-2">Description</label>
        <textarea
          value={description}
          onChange={function (e) { setDescription(e.target.value); }}
          rows={3}
          className="w-full bg-transparent border-b-2 border-line focus:border-gold-deep outline-none py-2.5 text-navy transition-colors mb-8 resize-none"
        />

        <button
          type="submit"
          disabled={isBusy}
          className="w-full bg-navy text-gold font-bold tracking-[0.1em] text-sm py-4 rounded-full active:scale-[0.98] hover:bg-navy-light transition disabled:opacity-50"
        >
          {uploadingPhoto ? 'UPLOADING PHOTO...' : saving ? 'SAVING...' : 'SAVE CHANGES'}
        </button>
      </form>
    </div>
  );
}

