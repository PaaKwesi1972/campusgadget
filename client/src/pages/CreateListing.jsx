import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ImagePlus, X, ArrowLeft, ShieldCheck, MapPin, Info } from 'lucide-react';
import { apiRequest, API_URL } from '../lib/api';

const CATEGORIES = ['Phones', 'Laptops', 'Tablets', 'Accessories', 'Audio'];
const CONDITIONS = ['New', 'Like New', 'Good', 'Fair'];

function FieldLabel({ children }) {
  return <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.18em] text-[#aaa59c]">{children}</label>;
}

export default function CreateListing() {
  const navigate = useNavigate();
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

  function handlePhotoChange(event) {
    const file = event.target.files[0];
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

  async function handlePublish(event) {
    event.preventDefault();
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

  if (published) {
    return <div className="min-h-[calc(100vh-72px)] bg-[#fbfaf7] px-5 py-10 font-body text-[#10143f] sm:px-8 lg:px-10"><div className="mx-auto flex min-h-[620px] max-w-[720px] items-center justify-center"><div className="w-full rounded-[28px] border border-[#e5e1d8] bg-white px-6 py-12 text-center shadow-[0_16px_45px_rgba(16,20,63,0.06)] sm:px-12"><div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-2xl bg-[#eef8ef]"><CheckCircle2 className="h-8 w-8 text-[#30924a]" /></div><p className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#c89036]">Live on the exchange</p><h1 className="font-body text-[2rem] font-black tracking-[-0.05em]">Listing published</h1><p className="mx-auto mt-3 max-w-[390px] text-[13px] leading-6 text-[#77736c]">“{title}” is now live for other verified students to see.</p><button onClick={() => navigate('/home')} className="mt-8 rounded-full bg-[#10143f] px-6 py-3.5 text-[11px] font-black uppercase tracking-[0.12em] text-[#d7a23a] transition hover:bg-[#c89036] hover:text-[#10143f]">Back to marketplace</button></div></div></div>;
  }

  return <div className="min-h-[calc(100vh-72px)] bg-[#fbfaf7] px-5 py-7 font-body text-[#10143f] sm:px-8 lg:px-10 lg:py-10">
    {isBusy && <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#fbfaf7]/95"><div className="h-10 w-10 animate-spin rounded-full border-4 border-[#e5e1d8] border-t-[#c89036]" /><p className="mt-5 text-[13px] font-black">{uploadingPhoto ? 'Uploading photo…' : 'Publishing listing…'}</p><p className="mt-1 text-[11px] text-[#817c72]">Please keep this window open.</p></div>}
    <div className="mx-auto max-w-[1120px]">
      <div className="mb-8 flex items-start gap-4 border-b border-[#e5e1d8] pb-7"><button onClick={() => navigate('/home')} className="mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[#e5e1d8] bg-white text-[#77736c] transition hover:border-[#c89036] hover:text-[#10143f]" aria-label="Back to home"><ArrowLeft className="h-4 w-4" /></button><div><p className="mb-2 text-[10px] font-black uppercase tracking-[0.22em] text-[#c89036]">Marketplace workspace</p><h1 className="font-body text-[2.25rem] font-black tracking-[-0.05em] sm:text-[3rem]">Sell an item</h1><p className="mt-2 max-w-[560px] text-[13px] leading-6 text-[#77736c]">Share a useful gadget with someone on campus. Clear details and a good photo help it move faster.</p></div></div>
      <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_300px]">
        <form onSubmit={handlePublish} className="rounded-[26px] border border-[#e5e1d8] bg-white p-5 shadow-[0_12px_30px_rgba(16,20,63,0.04)] sm:p-7">
          {error && <div className="mb-6 rounded-2xl border border-[#f2c9bf] bg-[#fff5f2] px-4 py-3 text-[13px] font-medium text-[#c34f3b]">{error}</div>}
          <div className="mb-8"><div className="mb-3 flex items-end justify-between"><div><FieldLabel>Product photo</FieldLabel><p className="text-[12px] text-[#817c72]">One clear photo is enough to get started.</p></div>{photoPreview && <button type="button" onClick={removePhoto} className="text-[11px] font-black text-[#c34f3b]">Remove</button>}</div>{photoPreview ? <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-[#e9e5dc]"><img src={photoPreview} alt="Selected listing" className="h-full w-full object-cover" /><button type="button" onClick={removePhoto} className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white/90 text-[#10143f]" aria-label="Remove photo"><X className="h-4 w-4" /></button></div> : <label className="flex aspect-[16/9] cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#d9d2c6] bg-[#fcfaf5] transition hover:border-[#c89036] hover:bg-[#faf6ed]"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#f7efdF]"><ImagePlus className="h-5 w-5 text-[#c89036]" /></span><span className="text-[13px] font-black">Add a photo</span><span className="text-[11px] text-[#817c72]">JPG or PNG · clear photos get more attention</span><input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" /></label>}</div>
          <div className="grid gap-6 sm:grid-cols-[minmax(0,1fr)_170px]"><div><FieldLabel>Title</FieldLabel><input type="text" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. MacBook Air M1, 256GB" className="w-full rounded-xl border border-[#e5e1d8] bg-[#fcfaf5] px-4 py-3 text-[13px] font-medium outline-none transition focus:border-[#c89036] focus:bg-white placeholder:text-[#aaa59c]" /></div><div><FieldLabel>Price · GHS</FieldLabel><input type="number" min="0" value={price} onChange={(event) => setPrice(event.target.value)} placeholder="0.00" className="w-full rounded-xl border border-[#e5e1d8] bg-[#fcfaf5] px-4 py-3 text-[13px] font-medium outline-none transition focus:border-[#c89036] focus:bg-white placeholder:text-[#aaa59c]" /></div></div>
          <div className="mt-6 grid gap-6 sm:grid-cols-2"><div><FieldLabel>Category</FieldLabel><select value={category} onChange={(event) => setCategory(event.target.value)} className="w-full appearance-none rounded-xl border border-[#e5e1d8] bg-[#fcfaf5] px-4 py-3 text-[13px] font-medium outline-none transition focus:border-[#c89036] focus:bg-white">{CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}</select></div><div><FieldLabel>Condition</FieldLabel><div className="flex flex-wrap gap-2">{CONDITIONS.map((item) => <button key={item} type="button" onClick={() => setCondition(item)} className={'rounded-full border px-3 py-2 text-[11px] font-bold transition ' + (condition === item ? 'border-[#10143f] bg-[#10143f] text-[#d7a23a]' : 'border-[#e5e1d8] bg-white text-[#77736c] hover:border-[#c89036]')}>{item}</button>)}</div></div></div>
          <div className="mt-6"><FieldLabel>Description</FieldLabel><textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Condition details, reason for selling, meet-up location…" rows={5} className="w-full resize-none rounded-xl border border-[#e5e1d8] bg-[#fcfaf5] px-4 py-3 text-[13px] leading-6 outline-none transition focus:border-[#c89036] focus:bg-white placeholder:text-[#aaa59c]" /></div>
          <div className="mt-7 flex items-start gap-2.5 rounded-xl bg-[#fcfaf5] px-4 py-3 text-[11px] leading-5 text-[#817c72]"><Info className="mt-0.5 h-4 w-4 shrink-0 text-[#c89036]" />Make sure your price and condition are accurate before publishing. You can edit the listing later.</div>
          <button type="submit" disabled={!isValid || isBusy} className={'mt-7 w-full rounded-full py-3.5 text-[11px] font-black uppercase tracking-[0.12em] transition ' + (isValid && !isBusy ? 'bg-[#10143f] text-[#d7a23a] hover:bg-[#c89036] hover:text-[#10143f] active:scale-[0.99]' : 'cursor-not-allowed bg-[#e5e1d8] text-[#aaa59c]')}>Publish listing</button>
        </form>
        <aside className="hidden h-fit rounded-[26px] bg-[#10143f] p-6 text-white lg:block"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#d7a23a]">A better handoff</p><h2 className="mt-4 font-body text-[23px] font-black leading-tight tracking-[-0.04em]">Sell with confidence on campus.</h2><div className="mt-7 space-y-5"><div className="flex gap-3"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#d7a23a]" /><div><p className="text-[12px] font-bold">Verified buyers</p><p className="mt-1 text-[11px] leading-5 text-white/55">Your listing is shown to the student community.</p></div></div><div className="flex gap-3"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#d7a23a]" /><div><p className="text-[12px] font-bold">Meet somewhere familiar</p><p className="mt-1 text-[11px] leading-5 text-white/55">Choose a public place close to campus.</p></div></div></div></aside>
      </div>
    </div>
  </div>;
}
