
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../axios';
import ReviewModal from './ReviewModal';
import EventReviews from './EventReviews';
import { toast } from 'react-toastify';
import './Favorites.css';

const Favorites = ({ favoritedEvents, onToggleFavorite, onNavigateToDiscover }) => {
    const { user } = useAuth();
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [selectedEventForReview, setSelectedEventForReview] = useState(null);
    const [showReviewsModal, setShowReviewsModal] = useState(false);
    const [selectedEventReviews, setSelectedEventReviews] = useState(null);
    const [userReviews, setUserReviews] = useState({});
    const [registrations, setRegistrations] = useState([]);
    const [canReviewEvents, setCanReviewEvents] = useState({});

    useEffect(() => {
        if (user) {
            fetchUserRegistrations();
            fetchUserReviews();
        }
    }, [user]);

    useEffect(() => {
        if (favoritedEvents && favoritedEvents.length > 0 && registrations.length > 0) {
            checkReviewEligibility();
        }
    }, [favoritedEvents, registrations]);

    const fetchUserRegistrations = async () => {
        if (!user) return;
        try {
            const response = await API.get('/api/registrations/my-registrations');
            setRegistrations(response.data.registrations || []);
        } catch (error) {
            console.error("Error fetching user registrations:", error);
        }
    };

    const fetchUserReviews = async () => {
        if (!user) return;
        try {
            const reviewsResponse = await API.get('/api/reviews/my-reviews');
            const reviewsMap = {};
            reviewsResponse.data.reviews?.forEach(review => {
                reviewsMap[review.event._id || review.event] = review;
            });
            setUserReviews(reviewsMap);
        } catch (error) {
            console.error("Error fetching user reviews:", error);
        }
    };

    const checkReviewEligibility = async () => {
        const eligibility = {};
        for (const event of favoritedEvents) {
            if (event._id) {
                try {
                    const response = await API.get(`/api/reviews/event/${event._id}/can-review`);
                    eligibility[event._id] = response.data.canReview;
                } catch (error) {
                    console.error("Error checking review eligibility:", error);
                    eligibility[event._id] = false;
                }
            }
        }
        setCanReviewEvents(eligibility);
    };

    const getRegistrationStatus = (eventId) => {
        const registration = registrations.find(reg => reg.event && (reg.event._id === eventId || reg.event === eventId));
        return registration || null;
    };

    const handleWriteReview = async (event) => {
        if (!user) {
            toast.error("Please login to write a review");
            return;
        }

        const userReview = userReviews[event._id];
        
        if (userReview) {
            setSelectedEventForReview(event);
            setShowReviewModal(true);
            return;
        }

        try {
            const canReviewResponse = await API.get(`/api/reviews/event/${event._id}/can-review`);
            
            if (!canReviewResponse.data.canReview) {
                const existingReviewResponse = await API.get(`/api/reviews/event/${event._id}/my-review`);
                
                if (existingReviewResponse.data.review) {
                    setUserReviews(prev => ({
                        ...prev,
                        [event._id]: existingReviewResponse.data.review
                    }));
                    setSelectedEventForReview(event);
                    setShowReviewModal(true);
                } else {
                    toast.error("You can only review events you have attended with approved registration");
                }
                return;
            }

            setSelectedEventForReview(event);
            setShowReviewModal(true);
        } catch (error) {
            console.error("Error checking review eligibility:", error);
            toast.error("Error checking review eligibility");
        }
    };

    const handleViewReviews = (event) => {
        setSelectedEventReviews(event);
        setShowReviewsModal(true);
    };

    const handleReviewSuccess = (review) => {
        setShowReviewModal(false);
        setUserReviews(prev => ({
            ...prev,
            [review.event]: review
        }));
        toast.success(review._id ? "Review updated successfully!" : "Review submitted successfully!");
    };

    const handleReviewDelete = async (eventId) => {
        try {
            setUserReviews(prev => {
                const newReviews = { ...prev };
                delete newReviews[eventId];
                return newReviews;
            });
            toast.success("Review deleted successfully!");
        } catch (error) {
            console.error("Error in review deletion:", error);
            toast.error("Review deleted successfully!");
        }
    };

    const handleRemoveFavorite = (event) => {
        if (onToggleFavorite) {
            onToggleFavorite(event, false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };

    const formatTime = (timeString) => {
        if (!timeString) return '';
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const formattedHour = hour % 12 || 12;
        return `${formattedHour}:${minutes} ${ampm}`;
    };

    const getTimeRange = (startTime, endTime) => {
        return `${formatTime(startTime)} - ${formatTime(endTime)}`;
    };

    return (
        <div className="favorites-container">
            {/* Review Modal */}
            {showReviewModal && selectedEventForReview && (
                <ReviewModal
                    event={selectedEventForReview}
                    existingReview={userReviews[selectedEventForReview._id]}
                    onClose={() => setShowReviewModal(false)}
                    onSuccess={handleReviewSuccess}
                    onDelete={() => handleReviewDelete(selectedEventForReview._id)}
                />
            )}

            {/* Reviews Modal */}
            {showReviewsModal && selectedEventReviews && (
                <div className="modal-overlay" onClick={() => setShowReviewsModal(false)}>
                    <div className="reviews-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Reviews for {selectedEventReviews.title}</h2>
                            <button 
                                className="close-button"
                                onClick={() => setShowReviewsModal(false)}
                                aria-label="Close reviews modal"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="modal-body">
                            <EventReviews 
                                eventId={selectedEventReviews._id}
                                event={selectedEventReviews}
                                currentUser={user}
                            />
                        </div>
                    </div>
                </div>
            )}

            <div className="favorites-header">
                <div className="header-content">
                    <h1>Your Favorite Events</h1>
                    {/* <p>Events you've saved for later</p> */}
                </div>
                {favoritedEvents && favoritedEvents.length > 0 && (
                    <div className="favorites-count">
                        <span>{favoritedEvents.length} {favoritedEvents.length === 1 ? 'event' : 'events'}</span>
                    </div>
                )}
            </div>

            {favoritedEvents && favoritedEvents.length > 0 ? (
                <div className="favorites-grid">
                    {favoritedEvents.map(event => {
                        const userRegistration = getRegistrationStatus(event._id);
                        const isRegistered = !!userRegistration;
                        const isApproved = userRegistration?.status === 'approved';
                        const userReview = userReviews[event._id];
                        const hasReviews = event.reviewCount > 0;
                        
                        return (
                            <div key={event._id} className="favorite-card">
                                <div className="favorite-image-container">
                                    {event.image ? (
                                        <img 
                                            src={event.image} 
                                            alt={event.title}
                                            className="favorite-image"
                                        />
                                    ) : (
                                        <div className="favorite-image-placeholder">
                                            <span>❤️</span>
                                        </div>
                                    )}
                                    <div className="favorite-category-tag">
                                        {event.category || 'General'}
                                    </div>
                                    {/* Reviews Badge */}
                                    {hasReviews && (
                                        <div 
                                            className="reviews-badge clickable"
                                            onClick={() => handleViewReviews(event)}
                                            title="Click to view reviews"
                                        >
                                            ⭐ {event.averageRating?.toFixed(1) || 0} ({event.reviewCount})
                                        </div>
                                    )}
                                    <button 
                                        className="btn-remove-favorite"
                                        onClick={() => handleRemoveFavorite(event)}
                                        title="Remove from favorites"
                                    >
                                        ❌
                                    </button>
                                </div>
                                
                                <div className="favorite-content">
                                    <div className="favorite-header">
                                        <h3 className="favorite-title">{event.title || 'Untitled Event'}</h3>
                                    </div>
                                    
                                    <p className="favorite-description">
                                        {event.description || 'No description available.'}
                                    </p>
                                    
                                    <div className="favorite-details">
                                        <div className="detail-item">
                                            <span className="detail-icon">📅</span>
                                            <span className="detail-text">
                                                {formatDate(event.startDate)}
                                            </span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-icon">🕒</span>
                                            <span className="detail-text">
                                                {getTimeRange(event.startTime, event.endTime)}
                                            </span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-icon">📍</span>
                                            <span className="detail-text">
                                                {event.venue || 'Location not specified'}
                                            </span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-icon">👥</span>
                                            <span className="detail-text">
                                                {event.registeredCount || 0} / {event.capacity || '∞'} registered
                                            </span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-icon">💰</span>
                                            <span className="detail-text">
                                                {event.price > 0 ? `$${event.price}` : 'Free'}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    {/* Fixed Button Container - Same as Discover Events */}
                                    <div className="fixed-buttons-container">
                                        {/* Top Button */}
                                        <div className="top-button-section">
                                            {isRegistered ? (
                                                /* Write Review for registered users */
                                                <button 
                                                    className={`btn-review ${userReview ? 'has-review' : ''}`}
                                                    onClick={() => handleWriteReview(event)}
                                                    disabled={!isApproved}
                                                    aria-label={userReview ? 'Edit your review' : 'Write a review'}
                                                >
                                                    {!isApproved ? 'Pending Review' : 
                                                     userReview ? '✏️ Edit Review' : '⭐ Write Review'}
                                                </button>
                                            ) : (
                                                /* View Reviews for non-registered users */
                                                <button 
                                                    className={`view-reviews-btn ${!hasReviews ? 'disabled' : ''}`}
                                                    onClick={() => handleViewReviews(event)}
                                                    disabled={!hasReviews}
                                                    aria-label={hasReviews ? 'View event reviews' : 'No reviews available'}
                                                >
                                                    {hasReviews ? ' View Reviews' : 'No Reviews'}
                                                </button>
                                            )}
                                        </div>
                                        
                                        {/* Bottom Button */}
                                        <div className="bottom-button-section">
                                            {isRegistered ? (
                                                /* Registration Status for registered users */
                                                <div className="registration-status-btn">
                                                    {userRegistration.status === 'approved' && (
                                                        <div className="status-approved-btn">
                                                            <span className="status-text">✅ Registered</span>
                                                        </div>
                                                    )}
                                                    {userRegistration.status === 'pending' && (
                                                        <div className="status-pending-btn">
                                                            <span className="status-text">🕒 Pending</span>
                                                        </div>
                                                    )}
                                                    {userRegistration.status === 'rejected' && (
                                                        <div className="status-rejected-btn">
                                                            <span className="status-text">❌ Rejected</span>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                /* Register Now for non-registered users */
                                                <button 
                                                    className="btn-register"
                                                    onClick={() => window.location.href = '/dashboard'}
                                                    aria-label="Register for event"
                                                >
                                                    Register Now
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="favorites-empty-state">
                    <div className="empty-icon">❤️</div>
                    <h2>No favorite events yet</h2>
                    <p>Start exploring events and add them to your favorites for easy access!</p>
                    <button 
                        className="btn-primary"
                        onClick={onNavigateToDiscover}
                    >
                        Discover Events
                    </button>
                </div>
            )}
        </div>
    );
};

export default Favorites;