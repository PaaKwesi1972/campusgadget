import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ArrowUpRight, Check, CheckCircle2, ImagePlus,
  MapPin, ShieldCheck, Trash2, UploadCloud, X,
} from 'lucide-react';
import { apiRequest, API_URL } from '../lib/api';

const CATEGORIES = ['Phones', 'Laptops', 'Tablets', 'Accessories', 'Audio'];
const CONDITIONS = ['New', 'Like New', 'Good', 'Fair'];

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
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);

  function choosePhoto(file) {
    if (!file || !file.type.startsWith('image/')) return;
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  function handlePhotoChange(event) {
    choosePhoto(event.target.files[0]);
    event.target.value = '';
  }

  function handleDrop(event) {
    event.preventDefault();
    setDragActive(false);
    choosePhoto(event.dataTransfer.files[0]);
  }

  function removePhoto() {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
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
    return (
      <div className="min-h-screen bg-[#fbfaf7] px-5 py-8 font-body text-[#10143f] sm:px-8">
        <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-xl flex-col items-center justify-center text-center">
          <div className="mb-7 grid h-16 w-16 place-items-center rounded-full bg-[#f1e8d2] text-[#a77b2e]"><CheckCircle2 className="h-8 w-8" strokeWidth={1.8} /></div>
          <p className="mb-3 text-[10px] font-black uppercase tracking-[0.22em] text-[#c89036]">Listing live</p>
          <h1 className="font-display text-[2.4rem] leading-none tracking-[-0.06em] sm:text-[3rem]">Ready for its next owner.</h1>
          <p className="mt-5 max-w-sm text-[14px] leading-7 text-[#77736c]">“{title}” is now visible to verified students on campus.</p>
          <button onClick={() => navigate('/home')} className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#10143f] px-6 py-3 text-[12px] font-black text-[#d7a23a] transition hover:bg-[#c89036] hover:text-[#10143f]">Back to home <ArrowUpRight className="h-4 w-4" /></button>
        </div>
        <p className="mt-6 text-center text-[11px] text-[#aaa59c]">© {new Date().getFullYear()} CampusGadget</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fbfaf7] pb-24 font-body text-[#10143f] lg:pb-10">
      {isBusy && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#fbfaf7]/95 px-6 text-center backdrop-blur-sm">
          <div className="mb-5 h-1 w-24 overflow-hidden rounded-full bg-[#e5e1d8]"><div className="h-full w-1/2 animate-pulse bg-[#c89036]" /></div>
          <p className="text-[13px] font-black">{uploadingPhoto ? 'Uploading your photo' : 'Publishing your listing'}</p>
          <p className="mt-2 text-[12px] text-[#77736c]">This should only take a moment.</p>
        </div>
      )}

      <header className="border-b border-[#e5e1d8] bg-[#fbfaf7]">
        <div className="mx-auto flex h-[72px] max-w-[1180px] items-center justify-between px-5 sm:px-8 lg:px-12">
          <button onClick={() => navigate('/home')} className="flex items-center gap-3 text-[#10143f]"><ArrowLeft className="h-5 w-5" /><span className="hidden text-[12px] font-semibold sm:inline">Back to browse</span></button>
          <button onClick={() => navigate('/home')} className="text-[11px] font-black uppercase tracking-[0.2em]">Campus<span className="text-[#c89036]">Gadget</span></button>
        </div>
      </header>

      <main className="mx-auto max-w-[1180px] px-5 py-9 sm:px-8 sm:py-12 lg:px-12 lg:py-16">
        <div className="mb-10 max-w-2xl"><p className="mb-4 text-[10px] font-black uppercase tracking-[0.22em] text-[#c89036]">Create a listing</p><h1 className="font-display text-[3rem] leading-[0.95] tracking-[-0.065em] sm:text-[4rem]">Give your gadget<br className="hidden sm:block" /> another semester.</h1><p className="mt-5 max-w-lg text-[14px] leading-7 text-[#77736c]">Add the details a student needs to make a quick, confident decision. Your listing will be shown to verified people on campus.</p></div>

        <form onSubmit={handlePublish} className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <section>
            <div className="mb-4 flex items-end justify-between"><div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#9a958c]">01 · Photograph</p><h2 className="mt-1 text-[18px] font-black">Show it clearly</h2></div><span className="text-[11px] text-[#aaa59c]">Optional</span></div>
            {photoPreview ? (
              <div className="relative overflow-hidden rounded-[22px] bg-[#e9e5dc]">
                <img src={photoPreview} alt="Preview of your listing" className="aspect-[4/3] w-full object-cover" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black/60 to-transparent p-4 pt-14"><span className="text-[11px] font-semibold text-white/90">{photoFile?.name}</span><button type="button" onClick={removePhoto} className="grid h-9 w-9 place-items-center rounded-full bg-white text-[#10143f]" aria-label="Remove photo"><Trash2 className="h-4 w-4" /></button></div>
              </div>
            ) : (
              <label onDragOver={(event) => { event.preventDefault(); setDragActive(true); }} onDragLeave={() => setDragActive(false)} onDrop={handleDrop} className={'flex aspect-[4/3] cursor-pointer flex-col items-center justify-center rounded-[22px] border border-dashed px-6 text-center transition ' + (dragActive ? 'border-[#c89036] bg-[#f4eddf]' : 'border-[#c9c3b8] bg-white hover:border-[#c89036] hover:bg-[#fdf9f1]')}>
                <span className="mb-5 grid h-12 w-12 place-items-center rounded-full bg-[#f1e8d2] text-[#a77b2e]"><UploadCloud className="h-5 w-5" /></span><span className="text-[14px] font-black">Drop a photo here</span><span className="mt-2 text-[12px] text-[#817c72]">or choose one from your device</span><span className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#e5e1d8] px-4 py-2 text-[11px] font-black"><ImagePlus className="h-3.5 w-3.5" /> Choose photo</span><input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
              </label>
            )}
            <p className="mt-3 flex items-center gap-2 text-[11px] leading-relaxed text-[#817c72]"><ShieldCheck className="h-3.5 w-3.5 shrink-0 text-[#a77b2e]" /> Use a bright, clear photo. Do not include private documents.</p>
          </section>

          <section>
            <div className="mb-4"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#9a958c]">02 · Details</p><h2 className="mt-1 text-[18px] font-black">Tell people what they’re getting</h2></div>
            {error && <div className="mb-6 flex items-start justify-between gap-3 border-l-2 border-[#c34f3b] bg-[#fff2ef] px-4 py-3 text-[12px] text-[#a43b2d]"><span>{error}</span><button type="button" onClick={() => setError('')}><X className="h-4 w-4" /></button></div>}
            <div className="space-y-7">
              <label className="block"><span className="mb-2 block text-[10px] font-black uppercase tracking-[0.18em] text-[#9a958c]">Title</span><input type="text" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. MacBook Air M1, 256GB" className="w-full border-b border-[#c9c3b8] bg-transparent px-0 py-3 text-[16px] font-semibold outline-none transition placeholder:text-[#aaa59c] focus:border-[#10143f]" /></label>
              <div className="grid gap-7 sm:grid-cols-2"><label className="block"><span className="mb-2 block text-[10px] font-black uppercase tracking-[0.18em] text-[#9a958c]">Category</span><select value={category} onChange={(event) => setCategory(event.target.value)} className="w-full border-b border-[#c9c3b8] bg-transparent px-0 py-3 text-[14px] font-semibold outline-none focus:border-[#10143f]">{CATEGORIES.map((item) => <option key={item} value={item}>{item}</option>)}</select></label><label className="block"><span className="mb-2 block text-[10px] font-black uppercase tracking-[0.18em] text-[#9a958c]">Price · GHS</span><input type="number" min="0" value={price} onChange={(event) => setPrice(event.target.value)} placeholder="0.00" className="w-full border-b border-[#c9c3b8] bg-transparent px-0 py-3 text-[14px] font-semibold outline-none placeholder:text-[#aaa59c] focus:border-[#10143f]" /></label></div>
              <div><span className="mb-3 block text-[10px] font-black uppercase tracking-[0.18em] text-[#9a958c]">Condition</span><div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{CONDITIONS.map((item) => <button key={item} type="button" onClick={() => setCondition(item)} className={'flex items-center justify-between border px-3 py-3 text-left text-[12px] font-bold transition ' + (condition === item ? 'border-[#10143f] bg-[#10143f] text-[#d7a23a]' : 'border-[#e5e1d8] bg-white text-[#77736c] hover:border-[#c89036]')}>{item}{condition === item && <Check className="h-3.5 w-3.5" />}</button>)}</div></div>
              <label className="block"><span className="mb-2 block text-[10px] font-black uppercase tracking-[0.18em] text-[#9a958c]">Description</span><textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Mention the condition, what is included, and where you can meet." rows={5} className="w-full resize-none border border-[#e5e1d8] bg-white px-4 py-3.5 text-[13px] leading-6 outline-none placeholder:text-[#aaa59c] focus:border-[#10143f]" /></label>
              <div className="flex items-start gap-3 border-t border-[#e5e1d8] pt-5 text-[11px] leading-relaxed text-[#817c72]"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#a77b2e]" /><span>Keep meet-ups public and convenient, such as a library entrance or busy campus walkway.</span></div>
              <button type="submit" disabled={!isValid || isBusy} className={'flex w-full items-center justify-center gap-2 py-4 text-[12px] font-black transition active:scale-[0.99] ' + (isValid && !isBusy ? 'bg-[#10143f] text-[#d7a23a] hover:bg-[#c89036] hover:text-[#10143f]' : 'cursor-not-allowed bg-[#e5e1d8] text-[#aaa59c]')}>Publish listing <ArrowUpRight className="h-4 w-4" /></button>
              <p className="text-center text-[11px] text-[#aaa59c]">Your listing will be visible to verified students only.</p>
            </div>
          </section>
        </form>
        <footer className="mt-14 border-t border-[#e5e1d8] pt-5 text-[11px] text-[#aaa59c]">© {new Date().getFullYear()} CampusGadget · Made for students, by students.</footer>
      </main>
    </div>
  );
}
