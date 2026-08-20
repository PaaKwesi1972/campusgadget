import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Lock, Mail, ChevronDown, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import PageHeader from '../components/PageHeader';

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

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const passwordsMatch = newPassword && newPassword === confirmPassword;
  const newPasswordValid = newPassword.length >= 8;
  const canSubmitPassword = currentPassword && newPasswordValid && passwordsMatch;

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    setPasswordError('');

    if (!currentPassword) {
      setPasswordError('Enter your current password.');
      return;
    }
    if (!newPasswordValid) {
      setPasswordError('New password must be at least 8 characters.');
      return;
    }
    if (!passwordsMatch) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setPasswordSaved(true);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => {
      setPasswordSaved(false);
      setPasswordOpen(false);
    }, 1800);
  };

  return (
    <div className="min-h-screen bg-white font-body">
      <PageHeader onBack={() => navigate('/profile')} />

      <div className="max-w-md mx-auto px-6 pt-6 pb-10">
        <h1 className="font-display text-[1.5rem] font-semibold text-navy mb-6">Account Settings</h1>

        <form onSubmit={handleSave}>
          <label className="block text-[11px] font-semibold tracking-[0.15em] uppercase text-mute mb-2">
            Full Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-transparent border-b-2 border-line focus:border-gold-deep outline-none py-2.5 text-navy transition-colors mb-6"
          />

          <label className="block text-[11px] font-semibold tracking-[0.15em] uppercase text-mute mb-2">
            Email
          </label>
          <div className="flex items-center gap-2 py-2.5 border-b-2 border-line mb-1">
            <Mail className="w-4 h-4 text-mute shrink-0" strokeWidth={2} />
            <p className="text-mute text-[14.5px]">{currentUser.email}</p>
          </div>
          <p className="text-mute text-[11.5px] mb-6">Verified email can't be changed here.</p>

          <button
            type="submit"
            className="w-full bg-navy text-gold font-bold tracking-[0.1em] text-sm py-4 rounded-full active:scale-[0.98] hover:bg-navy-light transition mt-4"
          >
            {saved ? 'SAVED ✓' : 'SAVE CHANGES'}
          </button>
        </form>

        <div className="mt-8">
          <div className="border-b border-line">
            <button
              type="button"
              onClick={() => setPasswordOpen((o) => !o)}
              className="w-full flex items-center gap-3 py-3.5 text-left"
            >
              <Lock className="w-[18px] h-[18px] text-navy shrink-0" strokeWidth={2} />
              <span className="flex-1 text-navy font-semibold text-[14px]">Change Password</span>
              <ChevronDown
                className={`w-4 h-4 text-mute shrink-0 transition-transform ${passwordOpen ? 'rotate-180' : ''}`}
                strokeWidth={2.2}
              />
            </button>

            {passwordOpen && (
              <div className="pb-5">
                {passwordSaved ? (
                  <div className="flex items-center gap-2.5 bg-[#F9EFE0] rounded-xl px-4 py-3.5 mb-4">
                    <CheckCircle2 className="w-4 h-4 text-gold-deep shrink-0" strokeWidth={2} />
                    <p className="text-gold-deep text-[13px] font-semibold">Password updated successfully.</p>
                  </div>
                ) : (
                  <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-semibold tracking-[0.15em] uppercase text-mute mb-2">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showCurrent ? 'text' : 'password'}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-transparent border-b-2 border-line focus:border-gold-deep outline-none py-2.5 pr-8 text-navy placeholder-mute transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrent((s) => !s)}
                          className="absolute right-0 top-1/2 -translate-y-1/2 text-mute"
                        >
                          {showCurrent ? <EyeOff className="w-4 h-4" strokeWidth={2} /> : <Eye className="w-4 h-4" strokeWidth={2} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold tracking-[0.15em] uppercase text-mute mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showNew ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="At least 8 characters"
                          className="w-full bg-transparent border-b-2 border-line focus:border-gold-deep outline-none py-2.5 pr-8 text-navy placeholder-mute transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNew((s) => !s)}
                          className="absolute right-0 top-1/2 -translate-y-1/2 text-mute"
                        >
                          {showNew ? <EyeOff className="w-4 h-4" strokeWidth={2} /> : <Eye className="w-4 h-4" strokeWidth={2} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold tracking-[0.15em] uppercase text-mute mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type={showNew ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter new password"
                        className={`w-full bg-transparent border-b-2 outline-none py-2.5 text-navy placeholder-mute transition-colors ${
                          confirmPassword && !passwordsMatch ? 'border-red-400' : 'border-line focus:border-gold-deep'
                        }`}
                      />
                    </div>

                    {passwordError && (
                      <p className="text-red-500 text-[12px]">{passwordError}</p>
                    )}

                    <button
                      type="submit"
                      disabled={!canSubmitPassword}
                      className={`w-full font-bold tracking-[0.1em] text-[13px] py-3.5 rounded-full transition ${
                        canSubmitPassword
                          ? 'bg-navy text-gold active:scale-[0.98] hover:bg-navy-light'
                          : 'bg-line text-mute cursor-not-allowed'
                      }`}
                    >
                      UPDATE PASSWORD
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>

          <div className="w-full flex items-center gap-3 py-3.5 border-b border-line">
            <Bell className="w-[18px] h-[18px] text-navy shrink-0" strokeWidth={2} />
            <span className="flex-1 text-navy font-semibold text-[14px]">Push Notifications</span>
            <button
              type="button"
              onClick={() => setNotifications((n) => !n)}
              className={`w-11 h-6 rounded-full transition-colors relative ${notifications ? 'bg-navy' : 'bg-line'}`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${
                  notifications ? 'left-[22px]' : 'left-0.5'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}