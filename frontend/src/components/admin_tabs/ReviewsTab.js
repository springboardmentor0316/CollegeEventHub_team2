

import React, { useState, useEffect } from 'react';
import API from '../../axios';
import { toast } from 'react-toastify';
import './ReviewsTab.css';

const ReviewsTab = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, visible, hidden
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      // Use the admin endpoint
      const response = await API.get('/api/reviews/admin/all-reviews');
      setReviews(response.data.reviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }
  
    try {
      // Use admin delete endpoint
      await API.delete(`/api/reviews/admin/${reviewId}`);
      toast.success('Review deleted successfully');
      setReviews(reviews.filter(review => review._id !== reviewId));
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Failed to delete review');
    }
  };

  const handleToggleVisibility = async (reviewId, currentStatus) => {
    try {
      // Use admin visibility endpoint
      const response = await API.put(`/api/reviews/admin/${reviewId}/visibility`, {
        isVisible: !currentStatus
      });
      toast.success(`Review ${!currentStatus ? 'shown' : 'hidden'} successfully`);
      
      setReviews(reviews.map(review => 
        review._id === reviewId 
          ? { ...review, isVisible: !currentStatus }
          : review
      ));
    } catch (error) {
      console.error('Error updating review:', error);
      toast.error('Failed to update review');
    }
  };

  const filteredReviews = reviews.filter(review => {
    const matchesFilter = filter === 'all' || 
      (filter === 'visible' && review.isVisible) ||
      (filter === 'hidden' && !review.isVisible);
    
    const matchesSearch = review.comment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.event?.title?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (review) => {
    if (!review.isVisible) {
      return <span className="status-badge hidden">Hidden</span>;
    }
    return <span className="status-badge visible">Visible</span>;
  };

  if (loading) {
    return (
      <div className="reviews-tab">
        <div className="tab-header">
          <h2>Event Reviews</h2>
          <p>Manage and moderate user reviews</p>
        </div>
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading reviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="reviews-tab">
      <div className="tab-header">
        <div className="header-content">
          <div>
            <h2>Event Reviews</h2>
            <p>Manage and moderate user reviews ({reviews.length} total)</p>
          </div>
          <button 
            className="btn-refresh"
            onClick={fetchReviews}
            title="Refresh reviews"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="reviews-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search reviews, users, or events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>
        
        <div className="filter-buttons">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Reviews
          </button>
          <button 
            className={`filter-btn ${filter === 'visible' ? 'active' : ''}`}
            onClick={() => setFilter('visible')}
          >
            Visible
          </button>
          <button 
            className={`filter-btn ${filter === 'hidden' ? 'active' : ''}`}
            onClick={() => setFilter('hidden')}
          >
            Hidden
          </button>
        </div>
      </div>

      {/* Reviews List */}
      <div className="reviews-list">
        {filteredReviews.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💬</div>
            <h3>No reviews found</h3>
            <p>
              {searchTerm || filter !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'No reviews have been submitted yet'
              }
            </p>
          </div>
        ) : (
          <div className="reviews-grid">
            {filteredReviews.map(review => (
              <div key={review._id} className="review-card">
                <div className="review-header">
                  <div className="reviewer-info">
                    <div className="reviewer-avatar">
                      {review.anonymous ? '👤' : review.user?.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <h4 className="reviewer-name">
                        {review.anonymous ? 'Anonymous User' : review.user?.name || 'Unknown User'}
                      </h4>
                      <div className="review-meta">
                        <span className="event-name">{review.event?.title || 'Unknown Event'}</span>
                        <span className="review-date">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="review-actions">
                    {getStatusBadge(review)}
                    <button
                      className={`btn-toggle ${review.isVisible ? 'hide' : 'show'}`}
                      onClick={() => handleToggleVisibility(review._id, review.isVisible)}
                      title={review.isVisible ? 'Hide review' : 'Show review'}
                    >
                      {review.isVisible ? '👁️' : '👁️‍🗨️'}
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDeleteReview(review._id)}
                      title="Delete review"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                <div className="review-rating">
                  <div className="stars">
                    {'★'.repeat(review.rating)}
                    {'☆'.repeat(5 - review.rating)}
                  </div>
                  <span className="rating-value">{review.rating}.0/5</span>
                </div>

                {review.comment && (
                  <p className="review-comment">{review.comment}</p>
                )}

                <div className="review-footer">
                  {review.wouldRecommend && (
                    <span className="recommendation-tag">✅ Would recommend</span>
                  )}
                  {review.anonymous && (
                    <span className="anonymous-tag">👤 Anonymous</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewsTab;