import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, Trash2, ShieldOff } from 'lucide-react';
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
      const statsData = await apiRequest('/api/admin/stats', { headers: { Authorization: 'Bearer ' + token } });
      const vendorsData = await apiRequest('/api/admin/vendors/pending', { headers: { Authorization: 'Bearer ' + token } });
      const listingsData = await apiRequest('/api/admin/listings/flagged', { headers: { Authorization: 'Bearer ' + token } });
      const reportsData = await apiRequest('/api/admin/reports', { headers: { Authorization: 'Bearer ' + token } });
      setStats(statsData.stats);
      setVendors(vendorsData.vendors);
      setFlaggedListings(listingsData.listings);
      setReports(reportsData.reports);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(function () {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchAll();
  }, []);

  async function approveVendor(id) {
    try {
      await apiRequest('/api/admin/vendors/' + id + '/approve', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + token },
      });
      setVendors(function (prev) { return prev.filter(function (v) { return v.id !== id; }); });
      setStats(function (prev) { return { pendingVendors: prev.pendingVendors - 1, flaggedListings: prev.flaggedListings, activeUsers: prev.activeUsers }; });
    } catch (err) {
      setError(err.message);
    }
  }

  async function declineVendor(id) {
    try {
      await apiRequest('/api/admin/vendors/' + id + '/decline', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + token },
      });
      setVendors(function (prev) { return prev.filter(function (v) { return v.id !== id; }); });
      setStats(function (prev) { return { pendingVendors: prev.pendingVendors - 1, flaggedListings: prev.flaggedListings, activeUsers: prev.activeUsers }; });
    } catch (err) {
      setError(err.message);
    }
  }

  async function removeListing(id) {
    try {
      await apiRequest('/api/admin/listings/' + id, {
        method: 'DELETE',
        headers: { Authorization: 'Bearer ' + token },
      });
      setFlaggedListings(function (prev) { return prev.filter(function (l) { return l.id !== id; }); });
      setStats(function (prev) { return { pendingVendors: prev.pendingVendors, flaggedListings: prev.flaggedListings - 1, activeUsers: prev.activeUsers }; });
    } catch (err) {
      setError(err.message);
    }
  }

  async function dismissFlag(id) {
    try {
      await apiRequest('/api/admin/listings/' + id + '/dismiss-flag', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + token },
      });
      setFlaggedListings(function (prev) { return prev.filter(function (l) { return l.id !== id; }); });
      setStats(function (prev) { return { pendingVendors: prev.pendingVendors, flaggedListings: prev.flaggedListings - 1, activeUsers: prev.activeUsers }; });
    } catch (err) {
      setError(err.message);
    }
  }

  async function resolveReport(id) {
    try {
      await apiRequest('/api/admin/reports/' + id + '/resolve', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + token },
      });
      setReports(function (prev) { return prev.filter(function (r) { return r.id !== id; }); });
    } catch (err) {
      setError(err.message);
    }
  }

  async function suspendUser(id) {
    try {
      await apiRequest('/api/admin/reports/' + id + '/suspend', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + token },
      });
      setReports(function (prev) { return prev.filter(function (r) { return r.id !== id; }); });
    } catch (err) {
      setError(err.message);
    }
  }

  const TABS = [
    { key: 'vendors', label: 'Vendors' },
    { key: 'listings', label: 'Listings' },
    { key: 'reports', label: 'Reports' },
  ];

  if (loading) return <PageLoader />;

  if (error === 'Admin access required.') {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center font-body">
        <p className="text-navy font-semibold mb-2">Admin access required</p>
        <p className="text-slate text-[13.5px] mb-5">This account does not have admin permissions.</p>
        <button onClick={function () { navigate('/profile'); }} className="text-gold-deep font-semibold text-sm underline">
          Back to Profile
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-body">
      <div className="bg-navy px-6 pt-9 pb-6">
        <h1 className="text-white font-bold text-[21px] mb-4">Admin Dashboard</h1>
        <div className="flex gap-3">
          <StatChip value={stats.pendingVendors} label="Pending Vendors" />
          <StatChip value={stats.flaggedListings} label="Flagged Listings" />
          <StatChip value={stats.activeUsers} label="Active Users" />
        </div>
      </div>

      <div className="flex gap-1.5 bg-white border-b border-line px-5 py-2.5">
        {TABS.map(function (t) {
          return (
            <button
              key={t.key}
              onClick={function () { setTab(t.key); }}
              className={'flex-1 py-1.5 rounded-lg text-[13px] font-semibold transition-colors ' + (tab === t.key ? 'bg-[#F9EFE0] text-gold-deep' : 'text-slate')}
            >
              {t.label}
              {t.key === 'reports' && reports.length > 0 ? ' (' + reports.length + ')' : ''}
            </button>
          );
        })}
      </div>

      {error && error !== 'Admin access required.' && (
        <p className="text-center text-red-500 text-[13px] py-4">{error}</p>
      )}

      <div className="max-w-2xl mx-auto px-5 py-5 space-y-3.5">
        {tab === 'vendors' && vendors.length === 0 && (
          <EmptyState text="No pending vendor applications." />
        )}

        {tab === 'vendors' && vendors.map(function (v) {
          return (
            <Card key={v.id}>
              <div className="flex items-center gap-3 mb-3">
                <Avatar text={v.business_name.split(' ').map(function (w) { return w[0]; }).slice(0, 2).join('')} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-navy text-[14px] truncate">{v.business_name}</p>
                  <p className="text-slate text-[12px] truncate">{v.contact_email} &middot; {v.phone}</p>
                </div>
              </div>
              <p className="text-slate text-[12.5px] mb-3">{v.description}</p>
              {v.document_url ? (
                <a href={v.document_url} target="_blank" rel="noreferrer" className="text-gold-deep text-[12px] font-semibold underline mb-3 inline-block">
                  View registration document
                </a>
              ) : null}
              <div className="flex gap-2.5">
                <ActionButton onClick={function () { approveVendor(v.id); }} primary icon={CheckCircle2}>APPROVE</ActionButton>
                <ActionButton onClick={function () { declineVendor(v.id); }} icon={XCircle}>DECLINE</ActionButton>
              </div>
            </Card>
          );
        })}

        {tab === 'listings' && flaggedListings.length === 0 && (
          <EmptyState text="No flagged listings." />
        )}

        {tab === 'listings' && flaggedListings.map(function (l) {
          return (
            <Card key={l.id}>
              <p className="font-semibold text-navy text-[14px] mb-0.5">{l.title}</p>
              <p className="text-slate text-[12px] mb-3">Seller: {l.seller_name}</p>
              <div className="flex gap-2.5">
                <ActionButton onClick={function () { removeListing(l.id); }} danger icon={Trash2}>REMOVE LISTING</ActionButton>
                <ActionButton onClick={function () { dismissFlag(l.id); }} icon={XCircle}>DISMISS</ActionButton>
              </div>
            </Card>
          );
        })}

        {tab === 'reports' && reports.length === 0 && (
          <EmptyState text="No open reports." />
        )}

        {tab === 'reports' && reports.map(function (r) {
          return (
            <Card key={r.id}>
              <p className="font-semibold text-navy text-[14px] mb-0.5">Report against {r.reported_name}</p>
              <p className="text-slate text-[12px] mb-2">Filed by {r.reporter_name}</p>
              <p className="text-slate text-[13px] leading-relaxed mb-3">&ldquo;{r.reason}&rdquo;</p>
              <div className="flex gap-2.5">
                <ActionButton onClick={function () { suspendUser(r.id); }} danger icon={ShieldOff}>SUSPEND USER</ActionButton>
                <ActionButton onClick={function () { resolveReport(r.id); }} icon={CheckCircle2}>MARK RESOLVED</ActionButton>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function StatChip(props) {
  return (
    <div className="flex-1 bg-white/10 rounded-xl px-3.5 py-3">
      <p className="text-gold font-bold text-[19px]">{props.value}</p>
      <p className="text-white/60 text-[10px] leading-tight mt-0.5">{props.label}</p>
    </div>
  );
}

function Card(props) {
  return <div className="border border-line rounded-2xl px-4 py-4">{props.children}</div>;
}

function Avatar(props) {
  return (
    <div className="w-9 h-9 rounded-full bg-[#F9EFE0] flex items-center justify-center font-bold text-gold-deep text-[12px] shrink-0">
      {props.text}
    </div>
  );
}

function ActionButton(props) {
  const base = 'flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-full text-[11px] font-bold tracking-wide transition active:scale-[0.97]';
  let style = 'bg-white border border-line text-slate';
  if (props.primary) style = 'bg-navy text-gold';
  if (props.danger) style = 'bg-red-600 text-white';
  const Icon = props.icon;
  return (
    <button onClick={props.onClick} className={base + ' ' + style}>
      <Icon className="w-3.5 h-3.5" strokeWidth={2.2} />
      {props.children}
    </button>
  );
}

function EmptyState(props) {
  return <p className="text-slate text-[13.5px] text-center py-10">{props.text}</p>;
}