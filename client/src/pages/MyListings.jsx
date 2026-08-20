import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import { apiRequest } from '../lib/api';
import PageLoader from '../components/PageLoader';
import PageHeader from '../components/PageHeader';

export default function MyListings() {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(function () {
    fetchMyListings();
  }, []);

  async function fetchMyListings() {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    try {
      const data = await apiRequest('/api/listings');
      setListings(data.listings.filter(function (item) { return item.seller_id === currentUser.id; }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    const token = localStorage.getItem('token');
    setDeletingId(id);
    try {
      await apiRequest('/api/listings/' + id, {
        method: 'DELETE',
        headers: { Authorization: 'Bearer ' + token },
      });
      setListings(function (prev) { return prev.filter(function (item) { return item.id !== id; }); });
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) return <PageLoader />;

  return (
    <div className="min-h-screen bg-white font-body">
      <PageHeader onBack={function () { navigate('/profile'); }} />

      <div className="max-w-lg mx-auto px-6 pt-6 pb-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-[1.5rem] font-semibold text-navy">My Listings</h1>
          <button
            onClick={function () { navigate('/sell'); }}
            className="flex items-center gap-1.5 bg-navy text-gold text-[12.5px] font-bold px-3.5 py-2 rounded-full"
          >
            <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
            New
          </button>
        </div>

        {error && <p className="text-center text-red-500 text-[14px] py-10">{error}</p>}

        {!error && listings.length === 0 ? (
          <p className="text-slate text-[13.5px] text-center py-16">
            You haven't listed anything yet.
          </p>
        ) : (
          <div className="space-y-3.5">
            {listings.map(function (item) {
              return (
                <div key={item.id} className="flex items-center gap-3.5 border border-line rounded-2xl p-3">
                  <button
                    onClick={function () { navigate('/listing/' + item.id + '/edit'); }}
                    className="flex items-center gap-3.5 flex-1 min-w-0 text-left"
                  >
                    <img
                      src={item.image_url || 'https://picsum.photos/seed/listing' + item.id + '/200/200'}
                      alt={item.title}
                      className="w-16 h-16 rounded-xl object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-navy text-[13.5px] truncate">{item.title}</p>
                      <p className="font-bold text-navy text-[14px] mt-0.5">
                        GHS {Number(item.price).toLocaleString()}
                      </p>
                      <span className="inline-block text-[10px] font-semibold uppercase tracking-wide bg-[#F9EFE0] text-gold-deep px-2 py-0.5 rounded-full mt-1">
                        {item.status}
                      </span>
                    </div>
                  </button>
                  <button
                    onClick={function () { handleDelete(item.id); }}
                    disabled={deletingId === item.id}
                    className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center shrink-0 disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" strokeWidth={2} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}