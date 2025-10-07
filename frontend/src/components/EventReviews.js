
import React, { useState, useEffect } from 'react';
import API from '../axios';
import ReviewModal from './ReviewModal';
import './EventReviews.css';

const EventReviews = ({ eventId, event, currentUser }) => {
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [ratingDistribution, setRatingDistribution] = useState({});
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [userReview, setUserReview] = useState(null);
  const [canReview, setCanReview] = useState(false);
  const [checkingReviewStatus, setCheckingReviewStatus] = useState(false);

  useEffect(() => {
    fetchReviews();
    checkUserReviewStatus();
  }, [eventId, currentUser]);

  const fetchReviews = async () => {
    try {
      const response = await API.get(`/api/reviews/event/${eventId}`);
      setReviews(response.data.reviews);
      setAverageRating(response.data.averageRating);
      setTotalReviews(response.data.totalReviews);
      setRatingDistribution(response.data.ratingDistribution || {});
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkUserReviewStatus = async () => {
    if (!currentUser) return;
    
    setCheckingReviewStatus(true);
    try {
      // Check if user already has a review
      const userReviewResponse = await API.get(`/api/reviews/event/${eventId}/my-review`);
      const existingReview = userReviewResponse.data.review;
      setUserReview(existingReview);

      // Only check can-review if user doesn't have an existing review
      if (!existingReview) {
        const canReviewResponse = await API.get(`/api/reviews/event/${eventId}/can-review`);
        setCanReview(canReviewResponse.data.canReview);
      } else {
        // If user has a review, they can always edit it
        setCanReview(true);
      }
    } catch (error) {
      console.error("Error checking user review status:", error);
    } finally {
      setCheckingReviewStatus(false);
    }
  };

  const handleReviewSuccess = (review) => {
    setShowReviewModal(false);
    setUserReview(review);
    fetchReviews(); // Refresh reviews list
    checkUserReviewStatus(); // Refresh review status
  };

  const handleReviewDelete = () => {
    setShowReviewModal(false);
    setUserReview(null);
    setCanReview(false);
    fetchReviews(); // Refresh reviews list
    checkUserReviewStatus(); // Refresh review status
  };

  const displayedReviews = showAll ? reviews : reviews.slice(0, 3);

  const getRatingPercentage = (rating) => {
    if (totalReviews === 0) return 0;
    return ((ratingDistribution[rating] || 0) / totalReviews) * 100;
  };

  if (loading) {
    return (
      <div className="reviews-loading">
        <div className="loading-spinner"></div>
        <p>Loading reviews...</p>
      </div>
    );
  }

  return (
    <div className="event-reviews">
      <div className="reviews-header">
        <div className="reviews-title-section">
          <h2>⭐ Event Reviews</h2>
          {currentUser && (canReview || userReview) && (
            <button 
              className="write-review-btn"
              onClick={() => setShowReviewModal(true)}
              disabled={checkingReviewStatus}
            >
              {checkingReviewStatus ? 'Checking...' : 
               userReview ? '✏️ Edit Review' : '📝 Write Review'}
            </button>
          )}
        </div>
        
        <div className="rating-overview">
          <div className="average-rating">
            <span className="rating-number">{averageRating.toFixed(1)}</span>
            <span className="rating-out-of">/5</span>
            <div className="rating-stars">
              {'★'.repeat(Math.round(averageRating))}
              {'☆'.repeat(5 - Math.round(averageRating))}
            </div>
            <div className="total-reviews">({totalReviews} reviews)</div>
          </div>
          
          {totalReviews > 0 && (
            <div className="rating-breakdown">
              {[5, 4, 3, 2, 1].map(rating => (
                <div key={rating} className="rating-bar">
                  <span className="rating-label">{rating}★</span>
                  <div className="bar-container">
                    <div 
                      className="bar-fill"
                      style={{ width: `${getRatingPercentage(rating)}%` }}
                    ></div>
                  </div>
                  <span className="rating-count">{ratingDistribution[rating] || 0}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {totalReviews === 0 ? (
        <div className="no-reviews">
          <div className="no-reviews-icon">💬</div>
          <h3>No reviews yet</h3>
          <p>Be the first to share your experience with this event!</p>
          
          {currentUser && (canReview || userReview) && (
            <button 
              className="write-review-btn primary"
              onClick={() => setShowReviewModal(true)}
              disabled={checkingReviewStatus}
            >
              {checkingReviewStatus ? 'Checking...' : 
               userReview ? '✏️ Edit Review' : '📝 Write First Review'}
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="reviews-list">
            {displayedReviews.map(review => (
              <div key={review._id} className="review-card">
                <div className="review-header">
                  <div className="reviewer-info">
                    <div className="reviewer-avatar">
                      {review.anonymous ? '👤' : review.user?.name?.charAt(0) || 'U'}
                    </div>
                    <div className="reviewer-details">
                      <span className="reviewer-name">
                        {review.anonymous ? 'Anonymous User' : review.user?.name || 'User'}
                      </span>
                      <div className="review-rating">
                        {'★'.repeat(review.rating)}
                        {'☆'.repeat(5 - review.rating)}
                        <span className="rating-value">{review.rating}.0</span>
                      </div>
                    </div>
                  </div>
                  <span className="review-date">
                    {new Date(review.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                
                {review.comment && (
                  <p className="review-comment">{review.comment}</p>
                )}
                
                <div className="review-footer">
                  {review.wouldRecommend && (
                    <div className="recommendation-badge">
                      <span className="badge-icon">✅</span>
                      Would recommend
                    </div>
                  )}
                  {review.anonymous && (
                    <div className="anonymous-badge">
                      <span className="badge-icon">👤</span>
                      Posted anonymously
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {reviews.length > 3 && (
            <div className="show-more-container">
              <button 
                className="show-more-btn"
                onClick={() => setShowAll(!showAll)}
              >
                {showAll ? 'Show Less' : `Show All ${reviews.length} Reviews`}
              </button>
            </div>
          )}
        </>
      )}

      {showReviewModal && (
        <ReviewModal
          event={event}
          existingReview={userReview}
          onClose={() => setShowReviewModal(false)}
          onSuccess={handleReviewSuccess}
          onDelete={handleReviewDelete}
        />
      )}
    </div>
  );
};

export default EventReviews;