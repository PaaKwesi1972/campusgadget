import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, Trash2, ShieldOff, Store, Flag, Users, ArrowLeft, FileText, AlertTriangle, ExternalLink } from 'lucide-react';
import { apiRequest } from '../../lib/api';
import PageLoader from '../../components/PageLoader';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('vendors');
  const [stats, setStats] = useState({ pendingVendors: 0, flaggedListings: 0, activeUsers: 0 });
  const [vendors, setVendors] = useState([]);
  const [flaggedListings, setFlaggedListings] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');

  async function fetchAll() {
    try {
      const headers = { Authorization: 'Bearer ' + token };
      const [statsData, vendorsData, listingsData, reportsData] = await Promise.all([
        apiRequest('/api/admin/stats', { headers }),
        apiRequest('/api/admin/vendors/pending', { headers }),
        apiRequest('/api/admin/listings/flagged', { headers }),
        apiRequest('/api/admin/reports', { headers }),
      ]);
      setStats(statsData.stats);
      setVendors(vendorsData.vendors || []);
      setFlaggedListings(listingsData.listings || []);
      setReports(reportsData.reports || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(function () {
    if (!token) { navigate('/login'); return; }
    fetchAll();
  }, []);

  async function runAction(endpoint, options, update) {
    try {
      await apiRequest(endpoint, { ...options, headers: { Authorization: 'Bearer ' + token } });
      update();
    } catch (err) {
      setError(err.message);
    }
  }

  function approveVendor(id) { runAction('/api/admin/vendors/' + id + '/approve', { method: 'POST' }, () => { setVendors((prev) => prev.filter((vendor) => vendor.id !== id)); setStats((prev) => ({ ...prev, pendingVendors: Math.max(0, prev.pendingVendors - 1) })); }); }
  function declineVendor(id) { runAction('/api/admin/vendors/' + id + '/decline', { method: 'POST' }, () => { setVendors((prev) => prev.filter((vendor) => vendor.id !== id)); setStats((prev) => ({ ...prev, pendingVendors: Math.max(0, prev.pendingVendors - 1) })); }); }
  function removeListing(id) { runAction('/api/admin/listings/' + id, { method: 'DELETE' }, () => { setFlaggedListings((prev) => prev.filter((listing) => listing.id !== id)); setStats((prev) => ({ ...prev, flaggedListings: Math.max(0, prev.flaggedListings - 1) })); }); }
  function dismissFlag(id) { runAction('/api/admin/listings/' + id + '/dismiss-flag', { method: 'POST' }, () => { setFlaggedListings((prev) => prev.filter((listing) => listing.id !== id)); setStats((prev) => ({ ...prev, flaggedListings: Math.max(0, prev.flaggedListings - 1) })); }); }
  function resolveReport(id) { runAction('/api/admin/reports/' + id + '/resolve', { method: 'POST' }, () => setReports((prev) => prev.filter((report) => report.id !== id))); }
  function suspendUser(id) { runAction('/api/admin/reports/' + id + '/suspend', { method: 'POST' }, () => setReports((prev) => prev.filter((report) => report.id !== id))); }

  const tabs = [
    { key: 'vendors', label: 'Vendors', icon: Store, count: vendors.length },
    { key: 'listings', label: 'Listings', icon: Flag, count: flaggedListings.length },
    { key: 'reports', label: 'Reports', icon: AlertTriangle, count: reports.length },
  ];

  if (loading) return <PageLoader />;
  if (error === 'Admin access required.') return <div className="flex min-h-[calc(100vh-72px)] items-center justify-center bg-[#fbfaf7] px-6 text-center font-body"><div><p className="text-[16px] font-black text-[#10143f]">Admin access required</p><p className="mt-2 text-[13px] text-[#817c72]">This account does not have admin permissions.</p><button onClick={() => navigate('/profile')} className="mt-6 rounded-full bg-[#10143f] px-5 py-3 text-[11px] font-black uppercase tracking-[0.1em] text-[#d7a23a]">Back to profile</button></div></div>;

  return <div className="min-h-[calc(100vh-72px)] bg-[#fbfaf7] px-5 py-7 font-body text-[#10143f] sm:px-8 lg:px-10 lg:py-10"><div className="mx-auto max-w-[1180px]"><section className="mb-8 flex flex-col gap-5 border-b border-[#e5e1d8] pb-8 md:flex-row md:items-end md:justify-between"><div><button onClick={() => navigate('/profile')} className="mb-5 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.14em] text-[#817c72] hover:text-[#10143f]"><ArrowLeft className="h-3.5 w-3.5" /> Back to profile</button><p className="mb-2 text-[10px] font-black uppercase tracking-[0.22em] text-[#c89036]">Trust & moderation</p><h1 className="font-body text-[2.25rem] font-black tracking-[-0.05em] sm:text-[3rem]">Admin dashboard</h1><p className="mt-2 max-w-[560px] text-[13px] leading-6 text-[#77736c]">Keep the Campus Gadget marketplace safe, useful, and trustworthy.</p></div><div className="flex items-center gap-2 rounded-full border border-[#e5e1d8] bg-white px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.1em] text-[#30924a]"><span className="h-2 w-2 rounded-full bg-[#30924a]" /> Admin mode</div></section>
    <section className="mb-7 grid gap-3 sm:grid-cols-3"><StatCard icon={Store} value={stats.pendingVendors} label="Pending vendors" tone="gold" /><StatCard icon={Flag} value={stats.flaggedListings} label="Flagged listings" tone="red" /><StatCard icon={Users} value={stats.activeUsers} label="Active users" tone="navy" /></section>
    {error && error !== 'Admin access required.' && <div className="mb-5 rounded-2xl border border-[#f2c9bf] bg-[#fff5f2] px-5 py-4 text-[13px] text-[#c34f3b]">{error}</div>}
    <section className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_280px]"><div><div className="mb-4 flex gap-2 overflow-x-auto rounded-2xl border border-[#e5e1d8] bg-white p-2">{tabs.map(({ key, label, icon: Icon, count }) => <button key={key} onClick={() => setTab(key)} className={'flex min-w-[110px] flex-1 items-center justify-center gap-2 rounded-xl px-3 py-3 text-[11px] font-black transition ' + (tab === key ? 'bg-[#10143f] text-[#d7a23a]' : 'text-[#817c72] hover:bg-[#fcfaf5]')}><Icon className="h-4 w-4" />{label}{count > 0 && <span className={'rounded-full px-1.5 py-0.5 text-[9px] ' + (tab === key ? 'bg-white/15' : 'bg-[#f7efdF] text-[#c89036]')}>{count}</span>}</button>)}</div><div className="space-y-4">{tab === 'vendors' && vendors.length === 0 && <EmptyState icon={Store} text="No pending vendor applications." />}{tab === 'vendors' && vendors.map((vendor) => <VendorCard key={vendor.id} vendor={vendor} approve={() => approveVendor(vendor.id)} decline={() => declineVendor(vendor.id)} />)}{tab === 'listings' && flaggedListings.length === 0 && <EmptyState icon={Flag} text="No flagged listings." />}{tab === 'listings' && flaggedListings.map((listing) => <ListingCard key={listing.id} listing={listing} remove={() => removeListing(listing.id)} dismiss={() => dismissFlag(listing.id)} />)}{tab === 'reports' && reports.length === 0 && <EmptyState icon={AlertTriangle} text="No open reports." />}{tab === 'reports' && reports.map((report) => <ReportCard key={report.id} report={report} suspend={() => suspendUser(report.id)} resolve={() => resolveReport(report.id)} />)}</div></div><aside className="hidden h-fit rounded-[26px] bg-[#10143f] p-6 text-white lg:block"><ShieldOff className="h-5 w-5 text-[#d7a23a]" /><h2 className="mt-4 text-[22px] font-black leading-tight tracking-[-0.04em]">Moderate with context.</h2><p className="mt-4 text-[12px] leading-6 text-white/65">Review the details, protect students, and keep decisions consistent across the marketplace.</p><div className="mt-7 space-y-3 border-t border-white/15 pt-5"><p className="flex items-center gap-2 text-[11px] font-bold text-white/80"><CheckCircle2 className="h-4 w-4 text-[#d7a23a]" /> Approve trusted activity</p><p className="flex items-center gap-2 text-[11px] font-bold text-white/80"><AlertTriangle className="h-4 w-4 text-[#d7a23a]" /> Investigate reports</p><p className="flex items-center gap-2 text-[11px] font-bold text-white/80"><ShieldOff className="h-4 w-4 text-[#d7a23a]" /> Protect the community</p></div></aside></section>
  </div></div>;
}

function StatCard({ icon: Icon, value, label, tone }) {
  const colors = tone === 'red' ? 'bg-[#fff5f2] text-[#c34f3b]' : tone === 'navy' ? 'bg-[#eef0fb] text-[#10143f]' : 'bg-[#f7efdF] text-[#c89036]';
  return <div className="flex items-center gap-3 rounded-2xl border border-[#e5e1d8] bg-white p-4"><span className={'grid h-10 w-10 place-items-center rounded-xl ' + colors}><Icon className="h-4 w-4" /></span><div><p className="text-[21px] font-black">{value}</p><p className="mt-1 text-[10px] font-black uppercase tracking-[0.1em] text-[#aaa59c]">{label}</p></div></div>;
}
function Card({ children }) { return <div className="rounded-[22px] border border-[#e5e1d8] bg-white p-5 shadow-[0_10px_25px_rgba(16,20,63,0.03)]">{children}</div>; }
function Avatar({ text }) { return <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#f7efdF] text-[12px] font-black text-[#10143f]">{text}</div>; }
function Actions({ children }) { return <div className="mt-5 flex flex-col gap-2 sm:flex-row">{children}</div>; }
function ActionButton({ onClick, primary, danger, icon: Icon, children }) { const style = primary ? 'bg-[#10143f] text-[#d7a23a]' : danger ? 'bg-[#c34f3b] text-white' : 'border border-[#e5e1d8] bg-white text-[#817c72]'; return <button onClick={onClick} className={'flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-3 text-[10px] font-black uppercase tracking-[0.08em] transition hover:opacity-85 ' + style}><Icon className="h-3.5 w-3.5" />{children}</button>; }
function VendorCard({ vendor, approve, decline }) { const initials = vendor.business_name.split(' ').map((word) => word[0]).slice(0, 2).join(''); return <Card><div className="flex items-start gap-3"><Avatar text={initials} /><div className="min-w-0 flex-1"><p className="truncate text-[14px] font-black">{vendor.business_name}</p><p className="mt-1 truncate text-[11px] text-[#817c72]">{vendor.contact_email} · {vendor.phone}</p></div><span className="rounded-full bg-[#f7efdF] px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.1em] text-[#c89036]">Review</span></div><p className="mt-5 text-[12px] leading-6 text-[#55576a]">{vendor.description}</p>{vendor.document_url && <a href={vendor.document_url} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-black text-[#c89036]">View registration document <ExternalLink className="h-3 w-3" /></a>}<Actions><ActionButton onClick={approve} primary icon={CheckCircle2}>Approve</ActionButton><ActionButton onClick={decline} icon={XCircle}>Decline</ActionButton></Actions></Card>; }
function ListingCard({ listing, remove, dismiss }) { return <Card><div className="flex items-start justify-between gap-3"><div><p className="text-[14px] font-black">{listing.title}</p><p className="mt-1 text-[11px] text-[#817c72]">Seller: {listing.seller_name}</p></div><span className="rounded-full bg-[#fff5f2] px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.1em] text-[#c34f3b]">Flagged</span></div><div className="mt-4 flex items-center gap-2 rounded-xl bg-[#fcfaf5] px-3 py-2.5 text-[11px] text-[#817c72]"><Flag className="h-3.5 w-3.5 text-[#c34f3b]" /> Review this listing before action.</div><Actions><ActionButton onClick={remove} danger icon={Trash2}>Remove listing</ActionButton><ActionButton onClick={dismiss} icon={XCircle}>Dismiss flag</ActionButton></Actions></Card>; }
function ReportCard({ report, suspend, resolve }) { return <Card><div className="flex items-start justify-between gap-3"><div><p className="text-[14px] font-black">Report against {report.reported_name}</p><p className="mt-1 text-[11px] text-[#817c72]">Filed by {report.reporter_name}</p></div><span className="rounded-full bg-[#fff5f2] px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.1em] text-[#c34f3b]">Open</span></div><p className="mt-5 rounded-xl bg-[#fcfaf5] px-4 py-3 text-[12px] leading-6 text-[#55576a]">“{report.reason}”</p><Actions><ActionButton onClick={suspend} danger icon={ShieldOff}>Suspend user</ActionButton><ActionButton onClick={resolve} primary icon={CheckCircle2}>Mark resolved</ActionButton></Actions></Card>; }
function EmptyState({ icon: Icon, text }) { return <div className="rounded-[24px] border border-dashed border-[#d9d2c6] bg-white px-6 py-20 text-center"><div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-[#f7efdF]"><Icon className="h-5 w-5 text-[#c89036]" /></div><p className="text-[14px] font-black">All clear</p><p className="mt-2 text-[13px] text-[#817c72]">{text}</p></div>; }
