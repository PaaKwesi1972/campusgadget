import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, Clock, CheckCircle2, FileCheck } from 'lucide-react';
import { apiRequest } from '../lib/api';
import PageLoader from '../components/PageLoader';
import PageHeader from '../components/PageHeader';

import { API_URL } from '../lib/api';

export default function VendorRegistration() {
  const navigate = useNavigate();
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [description, setDescription] = useState('');
  const [documentFile, setDocumentFile] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isValid = businessName.trim() && email.trim() && phone.trim() && description.trim() && documentFile;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setDocumentFile(file);
  };

  const handleSubmit = async (e) => {
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
      const formData = new FormData();
      formData.append('document', documentFile);

      const uploadRes = await fetch(`${API_URL}/api/upload/document`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error || 'Document upload failed.');

      await apiRequest('/api/vendors', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          businessName,
          contactEmail: email,
          phone,
          description,
          documentUrl: uploadData.documentUrl,
        }),
      });

      setSubmitted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <PageLoader />;

  if (submitted) {
    return (
      <div className="min-h-screen bg-white flex flex-col font-body">
        <PageHeader onBack={() => navigate('/profile')} />

        <div className="flex-1 flex flex-col items-center justify-center px-6 max-w-sm mx-auto w-full text-center">
          <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-6">
            <CheckCircle2 className="w-9 h-9 text-green-600" strokeWidth={2} />
          </div>
          <h1 className="font-display text-[1.6rem] font-semibold text-navy leading-tight mb-3">
            Application submitted
          </h1>
          <p className="text-slate text-[14.5px] leading-relaxed mb-8">
            We're reviewing <span className="text-navy font-semibold">{businessName}</span>. This usually takes 1–2 business days. We'll email you once approved.
          </p>

          <button
            onClick={() => navigate('/profile')}
            className="w-full bg-navy text-gold font-bold tracking-[0.1em] text-sm py-4 rounded-full active:scale-[0.98] hover:bg-navy-light transition"
          >
            BACK TO PROFILE
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col font-body">
      <PageHeader onBack={() => navigate('/profile')} />

      <div className="flex-1 px-6 pt-6 pb-10 max-w-sm mx-auto w-full">
        <h1 className="font-display text-[1.7rem] font-semibold text-navy leading-tight mb-3">
          Sell as a vendor
        </h1>
        <p className="text-slate text-[14px] leading-relaxed mb-8">
          For off-campus businesses. An admin reviews every application before your listings go live.
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6">
            <p className="text-red-600 text-[13px] font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[11px] font-semibold tracking-[0.15em] uppercase text-mute mb-2">
              Business Name
            </label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="e.g. Accra Tech Traders"
              className="w-full bg-transparent border-b-2 border-line focus:border-gold-deep outline-none py-2.5 text-navy placeholder-mute transition-colors"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold tracking-[0.15em] uppercase text-mute mb-2">
              Contact Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="business@example.com"
              className="w-full bg-transparent border-b-2 border-line focus:border-gold-deep outline-none py-2.5 text-navy placeholder-mute transition-colors"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold tracking-[0.15em] uppercase text-mute mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+233 24 000 0000"
              className="w-full bg-transparent border-b-2 border-line focus:border-gold-deep outline-none py-2.5 text-navy placeholder-mute transition-colors"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold tracking-[0.15em] uppercase text-mute mb-2">
              Business Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What kind of gadgets do you sell?"
              rows={2}
              className="w-full bg-transparent border-b-2 border-line focus:border-gold-deep outline-none py-2.5 text-navy placeholder-mute transition-colors resize-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold tracking-[0.15em] uppercase text-mute mb-2.5">
              Business ID / Registration Doc
            </label>
            <label className="flex items-center gap-3 border-2 border-dashed border-line hover:border-gold-deep rounded-xl px-4 py-3.5 cursor-pointer transition-colors">
              {documentFile ? (
                <>
                  <FileCheck className="w-4 h-4 text-gold-deep shrink-0" strokeWidth={2} />
                  <span className="text-[13px] font-medium text-navy truncate">{documentFile.name}</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4 text-gold-deep shrink-0" strokeWidth={2} />
                  <span className="text-[13px] font-semibold text-slate">Upload document (PDF or image)</span>
                </>
              )}
              <input type="file" accept="image/*,.pdf" onChange={handleFileChange} className="hidden" />
            </label>
          </div>

          <div className="flex items-start gap-2.5 bg-[#F9EFE0] rounded-2xl px-4 py-3.5">
            <Clock className="w-4 h-4 mt-0.5 shrink-0 text-gold-deep" strokeWidth={2} />
            <p className="text-gold-deep text-[12.5px] leading-relaxed">
              Review typically takes 1–2 business days. We'll email you once approved.
            </p>
          </div>

          <button
            type="submit"
            disabled={!isValid}
            className={`w-full font-bold tracking-[0.1em] text-sm py-4 rounded-full transition ${
              isValid ? 'bg-navy text-gold active:scale-[0.98] hover:bg-navy-light' : 'bg-line text-mute cursor-not-allowed'
            }`}
          >
            SUBMIT FOR REVIEW
          </button>
        </form>
      </div>
    </div>
  );
}