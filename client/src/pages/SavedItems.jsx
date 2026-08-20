import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { apiRequest } from '../lib/api';
import PageLoader from '../components/PageLoader';
import PageHeader from '../components/PageHeader';

export default function SavedItems() {
  const navigate = useNavigate();
  const [savedListings, setSavedListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(function () {
    async function fetchSaved() {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      try {
        const data = await apiRequest('/api/saved', {
          headers: { Authorization: 'Bearer ' + token },
        });
        setSavedListings(data.savedListings);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchSaved();
  }, [navigate]);

  if (loading) return <PageLoader />;

  return (
    <div className="min-h-screen bg-white font-body">
      <PageHeader onBack={function () { navigate('/profile'); }} />

      <div className="max-w-lg mx-auto px-6 pt-6 pb-10">
        <h1 className="font-display text-[1.5rem] font-semibold text-navy mb-6">Saved Items</h1>

        {error && <p className="text-center text-red-500 text-[14px] py-10">{error}</p>}

        {!error && savedListings.length === 0 ? (
          <div className="flex flex-col items-center text-center py-16">
            <Heart className="w-8 h-8 text-line mb-3" strokeWidth={1.5} />
            <p className="text-slate text-[13.5px]">
              Tap the heart on any listing to save it here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3.5">
            {savedListings.map(function (item) {
              return (
                <button
                  key={item.id}
                  onClick={function () { navigate('/listing/' + item.id); }}
                  className="text-left"
                >
                  <div className="aspect-square rounded-xl overflow-hidden bg-line mb-2">
                    <img
                      src={item.image_url || 'https://picsum.photos/seed/listing' + item.id + '/400/400'}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-[13px] font-semibold text-navy leading-snug line-clamp-1">{item.title}</p>
                  <p className="text-[13.5px] font-bold text-navy mt-0.5">
                    GHS {Number(item.price).toLocaleString()}
                  </p>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}