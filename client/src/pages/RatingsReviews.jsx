import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import { apiRequest } from '../lib/api';
import PageLoader from '../components/PageLoader';
import PageHeader from '../components/PageHeader';

export default function RatingsReviews() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [listing, setListing] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const listingData = await apiRequest(`/api/listings/${id}`);
        setListing(listingData.listing);

        const reviewsData = await apiRequest(`/api/reviews/seller/${listingData.listing.seller_id}`);
        setReviews(reviewsData.reviews);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    if (rating === 0 || !reviewText.trim()) return;

    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    setSubmitting(true);
    try {
      await apiRequest(`/api/reviews/listing/${id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ rating, text: reviewText.trim() }),
      });

      const reviewsData = await apiRequest(`/api/reviews/seller/${listing.seller_id}`);
      setReviews(reviewsData.reviews);

      setSubmitted(true);
      setRating(0);
      setReviewText('');
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <PageLoader />;

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center font-body">
        <p className="text-navy font-semibold mb-2">{error || 'Listing not found'}</p>
        <button onClick={() => navigate('/home')} className="text-gold-deep font-semibold text-sm underline">
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-body">
      <PageHeader onBack={() => navigate(-1)} />

      <div className="max-w-lg mx-auto px-6 pt-6 pb-16">
        <h1 className="font-display text-[1.5rem] font-semibold text-navy leading-snug mb-1.5">
          Rate this transaction
        </h1>
        <p className="text-slate text-[13.5px] leading-relaxed mb-6">
          How was your deal with {listing.seller_name} for the {listing.title}?
        </p>

        {submitted ? (
          <div className="bg-[#F9EFE0] rounded-2xl px-5 py-4 mb-8">
            <p className="text-gold-deep font-semibold text-[14px]">Thanks for your review!</p>
            <p className="text-gold-deep text-[12.5px] mt-1">It's now visible on {listing.seller_name}'s profile.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mb-10">
            {submitError && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
                <p className="text-red-600 text-[13px] font-medium">{submitError}</p>
              </div>
            )}

            <div className="flex gap-2 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      star <= (hoverRating || rating) ? 'fill-gold text-gold' : 'fill-line text-line'
                    }`}
                    strokeWidth={0}
                  />
                </button>
              ))}
            </div>

            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Share a few words about the seller and the item..."
              rows={3}
              className="w-full bg-white border border-line focus:border-gold-deep rounded-2xl px-4 py-3.5 outline-none text-[13.5px] text-navy placeholder-mute transition-colors resize-none mb-4"
            />

            <button
              type="submit"
              disabled={rating === 0 || !reviewText.trim() || submitting}
              className={`w-full font-bold tracking-[0.1em] text-[13px] py-3.5 rounded-full transition ${
                rating > 0 && reviewText.trim() && !submitting
                  ? 'bg-navy text-gold active:scale-[0.98] hover:bg-navy-light'
                  : 'bg-line text-mute cursor-not-allowed'
              }`}
            >
              {submitting ? 'SUBMITTING...' : 'SUBMIT REVIEW'}
            </button>
          </form>
        )}

        <div className="h-px bg-line mb-6" />

        <h2 className="font-bold text-navy text-[15px] mb-4">
          What buyers say about {listing.seller_name}
        </h2>

        {reviews.length === 0 ? (
          <p className="text-slate text-[13.5px]">No reviews yet — be the first to leave one.</p>
        ) : (
          <div className="space-y-5">
            {reviews.map((review) => (
              <div key={review.id}>
                <div className="flex items-center gap-2.5 mb-1">
                  <div className="w-8 h-8 rounded-full bg-line shrink-0 flex items-center justify-center font-bold text-navy text-[11px]">
                    {review.reviewer_name?.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-navy text-[13px]">{review.reviewer_name}</p>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-2.5 h-2.5 ${s <= review.rating ? 'fill-gold text-gold' : 'fill-line text-line'}`}
                          strokeWidth={0}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                {review.text && (
                  <p className="text-slate text-[13px] leading-relaxed pl-[42px]">{review.text}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

