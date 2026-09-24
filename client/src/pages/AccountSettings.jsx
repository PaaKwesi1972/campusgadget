import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Lock, Mail, ChevronDown, Eye, EyeOff, CheckCircle2, UserRound, ShieldCheck } from 'lucide-react';

function FieldLabel({ children }) {
  return <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.18em] text-[#aaa59c]">{children}</label>;
}

export default function AccountSettings() {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const [name, setName] = useState(currentUser.full_name || '');
  const [notifications, setNotifications] = useState(true);
  const [saved, setSaved] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSaved, setPasswordSaved] = useState(false);

  function handleSave(event) {
    event.preventDefault();
    if (name.trim()) {
      localStorage.setItem('user', JSON.stringify({ ...currentUser, full_name: name.trim() }));
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const passwordsMatch = newPassword && newPassword === confirmPassword;
  const newPasswordValid = newPassword.length >= 8;
  const canSubmitPassword = currentPassword && newPasswordValid && passwordsMatch;

  function handlePasswordSubmit(event) {
    event.preventDefault();
    setPasswordError('');
    if (!currentPassword) return setPasswordError('Enter your current password.');
    if (!newPasswordValid) return setPasswordError('New password must be at least 8 characters.');
    if (!passwordsMatch) return setPasswordError('New passwords do not match.');
    setPasswordSaved(true);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => { setPasswordSaved(false); setPasswordOpen(false); }, 1800);
  }

  return <div className="min-h-[calc(100vh-72px)] bg-[#fbfaf7] px-5 py-7 font-body text-[#10143f] sm:px-8 lg:px-10 lg:py-10"><div className="mx-auto max-w-[1120px]">
    <section className="mb-8 border-b border-[#e5e1d8] pb-8"><p className="mb-2 text-[10px] font-black uppercase tracking-[0.22em] text-[#c89036]">Account workspace</p><h1 className="font-body text-[2.25rem] font-black tracking-[-0.05em] sm:text-[3rem]">Settings</h1><p className="mt-2 text-[13px] leading-6 text-[#77736c]">Keep your profile details and account preferences up to date.</p></section>
    <section className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_300px]"><div className="space-y-6"><form onSubmit={handleSave} className="rounded-[26px] border border-[#e5e1d8] bg-white p-5 shadow-[0_12px_30px_rgba(16,20,63,0.04)] sm:p-7"><div className="mb-6 flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#f7efdF] text-[#c89036]"><UserRound className="h-4 w-4" /></span><div><h2 className="text-[15px] font-black">Profile details</h2><p className="mt-1 text-[11px] text-[#817c72]">This is how you appear around the marketplace.</p></div></div><FieldLabel>Full name</FieldLabel><input type="text" value={name} onChange={(event) => setName(event.target.value)} className="w-full rounded-xl border border-[#e5e1d8] bg-[#fcfaf5] px-4 py-3 text-[13px] outline-none transition focus:border-[#c89036] focus:bg-white" /><div className="mt-5"><FieldLabel>Email address</FieldLabel><div className="flex items-center gap-3 rounded-xl border border-[#e5e1d8] bg-[#f7f5f0] px-4 py-3"><Mail className="h-4 w-4 text-[#9a958c]" /><p className="text-[13px] text-[#817c72]">{currentUser.email || 'No email available'}</p><span className="ml-auto rounded-full bg-[#eef8ef] px-2 py-1 text-[9px] font-black text-[#30924a]">Verified</span></div><p className="mt-2 text-[11px] text-[#aaa59c]">Your verified university email cannot be changed here.</p></div><button type="submit" className="mt-7 rounded-full bg-[#10143f] px-5 py-3.5 text-[11px] font-black uppercase tracking-[0.12em] text-[#d7a23a] transition hover:bg-[#c89036] hover:text-[#10143f]">{saved ? 'Saved ✓' : 'Save changes'}</button></form>
      <div className="overflow-hidden rounded-[26px] border border-[#e5e1d8] bg-white"><button type="button" onClick={() => setPasswordOpen((open) => !open)} className="flex w-full items-center gap-3 px-5 py-5 text-left sm:px-7"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#f7efdF] text-[#c89036]"><Lock className="h-4 w-4" /></span><span className="flex-1"><span className="block text-[13px] font-black">Change password</span><span className="mt-1 block text-[11px] text-[#817c72]">Use at least 8 characters for a stronger password.</span></span><ChevronDown className={'h-4 w-4 text-[#c89036] transition ' + (passwordOpen ? 'rotate-180' : '')} /></button>{passwordOpen && <div className="border-t border-[#eeeae3] px-5 pb-6 pt-5 sm:px-7">{passwordSaved ? <div className="flex items-center gap-2 rounded-xl bg-[#eef8ef] px-4 py-3 text-[12px] font-bold text-[#30924a]"><CheckCircle2 className="h-4 w-4" /> Password updated successfully.</div> : <form onSubmit={handlePasswordSubmit} className="space-y-4"><div><FieldLabel>Current password</FieldLabel><div className="relative"><input type={showCurrent ? 'text' : 'password'} value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} placeholder="••••••••" className="w-full rounded-xl border border-[#e5e1d8] bg-[#fcfaf5] px-4 py-3 pr-10 text-[13px] outline-none focus:border-[#c89036]" /><button type="button" onClick={() => setShowCurrent((show) => !show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#817c72]">{showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></div><div><FieldLabel>New password</FieldLabel><div className="relative"><input type={showNew ? 'text' : 'password'} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} placeholder="At least 8 characters" className="w-full rounded-xl border border-[#e5e1d8] bg-[#fcfaf5] px-4 py-3 pr-10 text-[13px] outline-none focus:border-[#c89036]" /><button type="button" onClick={() => setShowNew((show) => !show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#817c72]">{showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></div><div><FieldLabel>Confirm new password</FieldLabel><input type={showNew ? 'text' : 'password'} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Re-enter new password" className={'w-full rounded-xl border bg-[#fcfaf5] px-4 py-3 text-[13px] outline-none focus:border-[#c89036] ' + (confirmPassword && !passwordsMatch ? 'border-[#e36b52]' : 'border-[#e5e1d8]')} /></div>{passwordError && <p className="text-[12px] text-[#c34f3b]">{passwordError}</p>}<button type="submit" disabled={!canSubmitPassword} className={'w-full rounded-full py-3.5 text-[11px] font-black uppercase tracking-[0.12em] ' + (canSubmitPassword ? 'bg-[#10143f] text-[#d7a23a]' : 'cursor-not-allowed bg-[#e5e1d8] text-[#aaa59c]')}>Update password</button></form>}</div>}</div>
      <div className="flex items-center gap-3 rounded-[22px] border border-[#e5e1d8] bg-white px-5 py-4 sm:px-7"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#f7efdF] text-[#c89036]"><Bell className="h-4 w-4" /></span><span className="flex-1"><span className="block text-[13px] font-black">Push notifications</span><span className="mt-1 block text-[11px] text-[#817c72]">Get updates about messages and listings.</span></span><button type="button" onClick={() => setNotifications((value) => !value)} className={'relative h-6 w-11 rounded-full transition ' + (notifications ? 'bg-[#10143f]' : 'bg-[#d9d2c6]')}><span className={'absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ' + (notifications ? 'left-[22px]' : 'left-0.5')} /></button></div></div><aside className="hidden h-fit rounded-[26px] bg-[#10143f] p-6 text-white lg:block"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#d7a23a]">Privacy & trust</p><h2 className="mt-4 text-[23px] font-black leading-tight tracking-[-0.04em]">Your account stays yours.</h2><p className="mt-4 text-[12px] leading-6 text-white/65">We use your verified campus identity to make buying and selling safer for the community.</p><div className="mt-7 flex gap-2 border-t border-white/15 pt-4"><ShieldCheck className="mt-0.5 h-4 w-4 text-[#d7a23a]" /><p className="text-[11px] leading-5 text-white/55">Need to update anything else? Contact support.</p></div></aside></section>
  </div></div>;
}
