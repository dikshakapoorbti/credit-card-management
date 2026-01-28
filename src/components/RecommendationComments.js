import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { getRecommendationComments, saveRecommendationComment, updateCommentLikes } from '../config/firebase';
import './RecommendationComments.css';

const RecommendationComments = ({ category, amount }) => {
  const { user } = useApp();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load comments from Firestore
  useEffect(() => {
    const loadComments = async () => {
      try {
        const firestoreComments = await getRecommendationComments(category, amount);
        if (firestoreComments.length > 0) {
          setComments(firestoreComments);
        } else {
          // Fallback to mock data if no Firestore comments
          setComments([
    {
      id: 'comment1',
      userName: 'Priya Sharma',
      userAvatar: 'P',
      cardUsed: 'HDFC Regalia',
      rating: 5,
      comment: 'Used this card for dining at The Oberoi and got amazing cashback! The 10% offer really works.',
      amount: 3500,
      category: 'Dining',
      benefitEarned: '₹350 cashback',
      date: '2025-12-20',
      likes: 12,
      helpful: false
    },
    {
      id: 'comment2',
      userName: 'Rahul Kumar',
      userAvatar: 'R',
      cardUsed: 'SBI SimplyCLICK',
      rating: 4,
      comment: 'Good rewards on Amazon purchases. Got 10X points which converted to ₹500 worth of vouchers.',
      amount: 5000,
      category: 'Online Shopping',
      benefitEarned: '50,000 points',
      date: '2025-12-18',
      likes: 8,
      helpful: false
    },
    {
      id: 'comment3',
      userName: 'Anjali Verma',
      userAvatar: 'A',
      cardUsed: 'ICICI Amazon Pay',
      rating: 5,
      comment: 'Perfect for fuel expenses! The 5% cashback is instant and no minimum transaction required.',
      amount: 2000,
      category: 'Fuel',
      benefitEarned: '₹100 cashback',
      date: '2025-12-15',
      likes: 15,
      helpful: false
    }
          ]);
        }
      } catch (error) {
        console.error('Error loading comments:', error);
      } finally {
        setLoading(false);
      }
    };

    loadComments();
  }, [category, amount]);

  const [showCommentForm, setShowCommentForm] = useState(false);
  const [newComment, setNewComment] = useState({
    cardUsed: '',
    rating: 0,
    comment: '',
    benefitEarned: ''
  });
  const [hoverRating, setHoverRating] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  // Filter comments by current category if specified
  const filteredComments = category
    ? comments.filter(c => c.category === category)
    : comments;

  const handleSubmitComment = async (e) => {
    e.preventDefault();

    if (!newComment.cardUsed || !newComment.comment || newComment.rating === 0) {
      setErrorMessage('Please fill in all required fields');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    setErrorMessage('');

    const comment = {
      id: `comment${Date.now()}`,
      userId: user?.uid || 'anonymous',
      userName: user?.name || 'Anonymous User',
      userAvatar: user?.name?.charAt(0).toUpperCase() || 'A',
      cardUsed: newComment.cardUsed,
      rating: newComment.rating,
      comment: newComment.comment,
      amount: amount || 0,
      category: category || 'Others',
      benefitEarned: newComment.benefitEarned,
      date: new Date().toISOString().split('T')[0],
      likes: 0,
      helpful: false
    };

    try {
      await saveRecommendationComment(comment);
      setComments([comment, ...comments]);
      setNewComment({ cardUsed: '', rating: 0, comment: '', benefitEarned: '' });
      setShowCommentForm(false);
    } catch (error) {
      console.error('Error saving comment:', error);
      setErrorMessage('Failed to save comment. Please try again.');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  const handleLike = async (commentId) => {
    const comment = comments.find(c => c.id === commentId);
    if (!comment) return;

    const newLikes = comment.helpful ? comment.likes - 1 : comment.likes + 1;

    try {
      await updateCommentLikes(commentId, newLikes);
      setComments(comments.map(c =>
        c.id === commentId
          ? { ...c, likes: newLikes, helpful: !c.helpful }
          : c
      ));
    } catch (error) {
      console.error('Error updating likes:', error);
    }
  };

  const renderStars = (rating, interactive = false) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      const filled = interactive ? (hoverRating || rating) >= i : i <= rating;
      stars.push(
        <span
          key={i}
          className={`star ${filled ? 'filled' : ''} ${interactive ? 'interactive' : ''}`}
          onClick={interactive ? () => setNewComment({ ...newComment, rating: i }) : undefined}
          onMouseEnter={interactive ? () => setHoverRating(i) : undefined}
          onMouseLeave={interactive ? () => setHoverRating(0) : undefined}
        >
          {filled ? '★' : '☆'}
        </span>
      );
    }
    return <div className="stars">{stars}</div>;
  };

  return (
    <div className="recommendation-comments">
      {errorMessage && (
        <div className="error-dialog">
          <div className="error-content">
            <span className="error-icon">⚠️</span>
            <p>{errorMessage}</p>
          </div>
        </div>
      )}

      <div className="comments-header">
        <div className="header-content">
          <h2>💬 Community Experiences</h2>
          <p>See what others earned using their cards for {category || 'various purchases'}</p>
        </div>
        <button
          className="add-comment-btn"
          onClick={() => setShowCommentForm(!showCommentForm)}
        >
          {showCommentForm ? 'Cancel' : '+ Share Your Experience'}
        </button>
      </div>

      {showCommentForm && (
        <form className="comment-form" onSubmit={handleSubmitComment}>
          <h3>Share Your Experience</h3>

          <div className="form-group">
            <label>Which card did you use? *</label>
            <input
              type="text"
              value={newComment.cardUsed}
              onChange={(e) => setNewComment({ ...newComment, cardUsed: e.target.value })}
              placeholder="e.g., HDFC Regalia, SBI SimplyCLICK"
              required
            />
          </div>

          <div className="form-group">
            <label>Rate your experience *</label>
            {renderStars(newComment.rating, true)}
          </div>

          <div className="form-group">
            <label>Share your experience *</label>
            <textarea
              value={newComment.comment}
              onChange={(e) => setNewComment({ ...newComment, comment: e.target.value })}
              placeholder="Tell us about your experience, benefits earned, and any tips..."
              rows="4"
              required
            />
          </div>

          <div className="form-group">
            <label>What did you earn?</label>
            <input
              type="text"
              value={newComment.benefitEarned}
              onChange={(e) => setNewComment({ ...newComment, benefitEarned: e.target.value })}
              placeholder="e.g., ₹500 cashback or 50,000 points"
            />
          </div>

          <button type="submit" className="submit-comment-btn">
            Post Comment
          </button>
        </form>
      )}

      <div className="comments-list">
        {filteredComments.length === 0 ? (
          <div className="no-comments">
            <p>No experiences shared yet for {category || 'this category'}.</p>
            <p>Be the first to share!</p>
          </div>
        ) : (
          <>
            <div className="comments-count">
              {filteredComments.length} {filteredComments.length === 1 ? 'experience' : 'experiences'} shared
            </div>

            {filteredComments.map(comment => (
              <div key={comment.id} className="comment-card">
                <div className="comment-header">
                  <div className="user-info">
                    <div className="user-avatar">{comment.userAvatar}</div>
                    <div className="user-details">
                      <h4>{comment.userName}</h4>
                      <p className="card-used">Used: {comment.cardUsed}</p>
                      <div className="comment-meta">
                        {renderStars(comment.rating)}
                        <span className="comment-date">
                          {new Date(comment.date).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="transaction-details">
                    <div className="detail-item">
                      <span className="detail-label">Amount</span>
                      <span className="detail-value">₹{comment.amount.toLocaleString()}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Category</span>
                      <span className="detail-value category-badge">{comment.category}</span>
                    </div>
                  </div>
                </div>

                <div className="comment-body">
                  <p className="comment-text">{comment.comment}</p>

                  {comment.benefitEarned && (
                    <div className="benefit-earned">
                      <span className="benefit-icon">🎉</span>
                      <span className="benefit-text">
                        <strong>Benefit Earned:</strong> {comment.benefitEarned}
                      </span>
                    </div>
                  )}
                </div>

                <div className="comment-footer">
                  <button
                    className={`like-btn ${comment.helpful ? 'liked' : ''}`}
                    onClick={() => handleLike(comment.id)}
                  >
                    <span className="like-icon">{comment.helpful ? '👍' : '👍🏻'}</span>
                    <span className="like-text">
                      {comment.helpful ? 'Helpful' : 'Helpful'} ({comment.likes})
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default RecommendationComments;
