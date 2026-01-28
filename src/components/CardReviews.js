import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { getCardReviews, saveCardReview, updateReviewHelpful } from '../config/firebase';
import './CardReviews.css';

const CardReviews = ({ card }) => {
  const { user } = useApp();
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [pros, setPros] = useState(['']);
  const [cons, setCons] = useState(['']);
  const [wouldRecommend, setWouldRecommend] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userHelpfulVotes, setUserHelpfulVotes] = useState(new Set());

  // Load user's previous helpful votes from localStorage
  useEffect(() => {
    const storedVotes = localStorage.getItem(`helpful_votes_${card.id}`);
    if (storedVotes) {
      try {
        const votesArray = JSON.parse(storedVotes);
        setUserHelpfulVotes(new Set(votesArray));
      } catch (error) {
        console.error('Error loading helpful votes:', error);
      }
    }
  }, [card.id]);

  // Load reviews from Firestore
  useEffect(() => {
    const loadReviews = async () => {
      try {
        const cardReviews = await getCardReviews(card.id);
        setReviews(cardReviews);
      } catch (error) {
        console.error('Error loading reviews:', error);
        // Fallback to mock data if Firestore fails
        setReviews([
    {
      id: '1',
      userId: 'user1',
      userName: 'Rahul Sharma',
      rating: 4.5,
      review: 'Excellent cashback on dining! The reward points accumulate quickly and customer service is responsive.',
      pros: ['High cashback', 'Good customer service', 'Easy approval'],
      cons: ['Annual fee is high'],
      wouldRecommend: true,
      date: '2025-12-15',
      helpfulCount: 24
    },
    {
      id: '2',
      userId: 'user2',
      userName: 'Priya Patel',
      rating: 5,
      review: 'Best credit card I have ever owned. The travel benefits are amazing and lounge access is a game changer.',
      pros: ['Airport lounge access', 'Travel rewards', 'No forex fees'],
      cons: [],
      wouldRecommend: true,
      date: '2025-12-10',
      helpfulCount: 18
    },
    {
      id: '3',
      userId: 'user3',
      userName: 'Amit Kumar',
      rating: 3.5,
      review: 'Decent card but the annual fee is quite steep. Rewards are good if you spend in the right categories.',
      pros: ['Good rewards structure', 'Multiple offers'],
      cons: ['High annual fee', 'Limited acceptance at some merchants'],
      wouldRecommend: true,
      date: '2025-12-05',
      helpfulCount: 12
    }
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadReviews();
  }, [card.id]);

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const addPro = () => setPros([...pros, '']);
  const addCon = () => setCons([...cons, '']);

  const updatePro = (index, value) => {
    const newPros = [...pros];
    newPros[index] = value;
    setPros(newPros);
  };

  const updateCon = (index, value) => {
    const newCons = [...cons];
    newCons[index] = value;
    setCons(newCons);
  };

  const removePro = (index) => {
    setPros(pros.filter((_, i) => i !== index));
  };

  const removeCon = (index) => {
    setCons(cons.filter((_, i) => i !== index));
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (rating === 0) {
      alert('Please select a rating');
      return;
    }

    if (!reviewText.trim()) {
      alert('Please write a review');
      return;
    }

    const newReview = {
      id: `review${Date.now()}`,
      userId: user?.uid || 'anonymous',
      userName: user?.name || 'Anonymous User',
      rating,
      reviewText: reviewText,
      review: reviewText,
      pros: pros.filter(p => p.trim() !== ''),
      cons: cons.filter(c => c.trim() !== ''),
      wouldRecommend,
      date: new Date().toISOString().split('T')[0],
      helpful: 0,
      helpfulCount: 0
    };

    try {
      // Save to Firestore
      await saveCardReview(card.id, newReview);
      setReviews([newReview, ...reviews]);

      // Reset form
      setRating(0);
      setReviewText('');
      setPros(['']);
      setCons(['']);
      setWouldRecommend(true);
      setShowReviewForm(false);

      alert('Thank you for your review!');
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    }
  };

  const handleHelpful = async (reviewId) => {
    const review = reviews.find(r => r.id === reviewId);
    if (!review) return;

    const hasVoted = userHelpfulVotes.has(reviewId);
    const currentCount = review.helpful || review.helpfulCount || 0;
    const newHelpfulCount = hasVoted ? Math.max(0, currentCount - 1) : currentCount + 1;

    try {
      await updateReviewHelpful(card.id, reviewId, newHelpfulCount);

      // Update local state
      setReviews(reviews.map(r =>
        r.id === reviewId
          ? { ...r, helpful: newHelpfulCount, helpfulCount: newHelpfulCount }
          : r
      ));

      // Toggle user's vote
      setUserHelpfulVotes(prev => {
        const newSet = new Set(prev);
        if (hasVoted) {
          newSet.delete(reviewId);
        } else {
          newSet.add(reviewId);
        }
        // Store in localStorage for persistence
        localStorage.setItem(`helpful_votes_${card.id}`, JSON.stringify([...newSet]));
        return newSet;
      });
    } catch (error) {
      console.error('Error updating helpful count:', error);
    }
  };

  const renderStars = (rating, interactive = false, size = 'medium') => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 1; i <= 5; i++) {
      const filled = interactive ? (hoverRating || rating) >= i : i <= fullStars;
      const half = !interactive && i === fullStars + 1 && hasHalfStar;

      stars.push(
        <span
          key={i}
          className={`star ${size} ${filled ? 'filled' : ''} ${half ? 'half' : ''} ${interactive ? 'interactive' : ''}`}
          onClick={interactive ? () => setRating(i) : undefined}
          onMouseEnter={interactive ? () => setHoverRating(i) : undefined}
          onMouseLeave={interactive ? () => setHoverRating(0) : undefined}
        >
          {filled || half ? '★' : '☆'}
        </span>
      );
    }

    return <div className="stars">{stars}</div>;
  };

  return (
    <div className="card-reviews">
      <div className="reviews-header">
        <div className="rating-summary">
          <div className="average-rating">
            <span className="rating-number">{averageRating.toFixed(1)}</span>
            {renderStars(averageRating, false, 'large')}
            <span className="review-count">Based on {reviews.length} reviews</span>
          </div>
        </div>

        <button
          className="write-review-button"
          onClick={() => setShowReviewForm(!showReviewForm)}
        >
          {showReviewForm ? 'Cancel' : '✍️ Write a Review'}
        </button>
      </div>

      {showReviewForm && (
        <form className="review-form" onSubmit={handleSubmitReview}>
          <h3>Write Your Review</h3>

          <div className="form-group">
            <label>Your Rating *</label>
            {renderStars(rating, true)}
            <span className="rating-label">
              {rating === 0 ? 'Select your rating' : `${rating} out of 5 stars`}
            </span>
          </div>

          <div className="form-group">
            <label>Your Review *</label>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Share your experience with this card..."
              rows="5"
              required
            />
          </div>

          <div className="form-group">
            <label>Pros (Optional)</label>
            {pros.map((pro, index) => (
              <div key={index} className="input-row">
                <input
                  type="text"
                  value={pro}
                  onChange={(e) => updatePro(index, e.target.value)}
                  placeholder="e.g., Great rewards"
                />
                {pros.length > 1 && (
                  <button
                    type="button"
                    className="remove-btn"
                    onClick={() => removePro(index)}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            <button type="button" className="add-btn" onClick={addPro}>
              + Add Pro
            </button>
          </div>

          <div className="form-group">
            <label>Cons (Optional)</label>
            {cons.map((con, index) => (
              <div key={index} className="input-row">
                <input
                  type="text"
                  value={con}
                  onChange={(e) => updateCon(index, e.target.value)}
                  placeholder="e.g., High annual fee"
                />
                {cons.length > 1 && (
                  <button
                    type="button"
                    className="remove-btn"
                    onClick={() => removeCon(index)}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            <button type="button" className="add-btn" onClick={addCon}>
              + Add Con
            </button>
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={wouldRecommend}
                onChange={(e) => setWouldRecommend(e.target.checked)}
              />
              I would recommend this card to others
            </label>
          </div>

          <button type="submit" className="submit-review-btn">
            Submit Review
          </button>
        </form>
      )}

      <div className="reviews-list">
        <h3>Customer Reviews ({reviews.length})</h3>

        {reviews.map(review => (
          <div key={review.id} className="review-card">
            <div className="review-header">
              <div className="reviewer-info">
                <div className="reviewer-avatar">
                  {review.userName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4>{review.userName}</h4>
                  <span className="review-date">
                    {new Date(review.date).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>
              {renderStars(review.rating)}
            </div>

            <p className="review-text">{review.review}</p>

            {review.pros.length > 0 && (
              <div className="review-points pros">
                <h5>👍 Pros:</h5>
                <ul>
                  {review.pros.map((pro, index) => (
                    <li key={index}>{pro}</li>
                  ))}
                </ul>
              </div>
            )}

            {review.cons.length > 0 && (
              <div className="review-points cons">
                <h5>👎 Cons:</h5>
                <ul>
                  {review.cons.map((con, index) => (
                    <li key={index}>{con}</li>
                  ))}
                </ul>
              </div>
            )}

            {review.wouldRecommend && (
              <div className="recommendation-badge">
                ✓ Recommends this card
              </div>
            )}

            <div className="review-footer">
              <button
                className={`helpful-btn ${userHelpfulVotes.has(review.id) ? 'voted' : ''}`}
                onClick={() => handleHelpful(review.id)}
              >
                👍 Helpful ({review.helpful || review.helpfulCount || 0})
                {userHelpfulVotes.has(review.id) && ' ✓'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CardReviews;
