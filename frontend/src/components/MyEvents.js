
import React, { useState, useEffect } from 'react';
import API from '../axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import './MyEvents.css';
import ReviewModal from './ReviewModal';

const MyEvents = () => {
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [selectedEventForReview, setSelectedEventForReview] = useState(null);
    const [userReviews, setUserReviews] = useState({});
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [registrationToCancel, setRegistrationToCancel] = useState(null);

    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            fetchMyRegistrations();
            fetchUserReviews();
        }
    }, [user]);

    const fetchMyRegistrations = async () => {
        try {
            const response = await API.get('/api/registrations/my-registrations');
            console.log('Registrations API Response:', response.data);
            setRegistrations(response.data.registrations || []);
        } catch (error) {
            console.error("Error fetching registrations:", error);
            toast.error("Error loading your events");
        } finally {
            setLoading(false);
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

    const handleReviewClick = (event, registration) => {
        setSelectedEventForReview({ ...event, registration });
        setShowReviewModal(true);
    };

    const handleReviewSuccess = (review) => {
        setShowReviewModal(false);
        // Update user reviews state
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

    const handleCancelClick = (registration) => {
        setRegistrationToCancel(registration);
        setShowCancelModal(true);
    };

    const handleCancelConfirm = async () => {
        if (!registrationToCancel) return;
        
        try {
            await API.put(`/api/registrations/cancel/${registrationToCancel._id}`);
            setRegistrations(prev => prev.filter(reg => reg._id !== registrationToCancel._id));
            toast.success("Registration cancelled successfully");
            setShowCancelModal(false);
            setRegistrationToCancel(null);
        } catch (error) {
            console.error("Error cancelling registration:", error);
            toast.error("Error cancelling registration");
        }
    };

    const handleCancelCancel = () => {
        setShowCancelModal(false);
        setRegistrationToCancel(null);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Date not specified';
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                weekday: 'short', 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric'
            });
        } catch (error) {
            console.error('Error formatting date:', error);
            return 'Invalid Date';
        }
    };

    const formatTime = (timeString) => {
        if (!timeString) return '';
        try {
            const timeParts = timeString.split(':');
            const hours = parseInt(timeParts[0]);
            const minutes = timeParts[1];
            const ampm = hours >= 12 ? 'PM' : 'AM';
            const formattedHour = hours % 12 || 12;
            return `${formattedHour}:${minutes} ${ampm}`;
        } catch (error) {
            console.error('Error formatting time:', error);
            return 'Invalid Time';
        }
    };

    const getTimeRange = (startTime, endTime) => {
        if (!startTime) return 'Time not specified';
        const formattedStart = formatTime(startTime);
        if (!endTime) return formattedStart;
        const formattedEnd = formatTime(endTime);
        return `${formattedStart} - ${formattedEnd}`;
    };

    const getAttendeeCount = (registration) => {
        return registration.numberOfAttendees || 1;
    };

    const refreshData = () => {
        setLoading(true);
        fetchMyRegistrations();
        fetchUserReviews();
        toast.info("Refreshing your events...");
    };

    if (loading) {
        return (
            <div className="my-events">
                <div className="loading">
                    <div className="loading-spinner"></div>
                    <p>Loading your events...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="my-events">
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

            {/* Cancel Registration Confirmation Modal */}
            {showCancelModal && registrationToCancel && (
                <div className="modal-overlay" onClick={handleCancelCancel}>
                    <div className="confirmation-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>❌ Cancel Registration</h3>
                            <button className="close-button" onClick={handleCancelCancel}>×</button>
                        </div>
                        <div className="modal-body">
                            <p>Are you sure you want to cancel your registration for <strong>{registrationToCancel.event?.title}</strong>?</p>
                            <p className="warning-text">This action cannot be undone.</p>
                        </div>
                        <div className="modal-actions">
                            <button className="btn-cancel" onClick={handleCancelCancel}>
                                Keep Registration
                            </button>
                            <button className="btn-confirm" onClick={handleCancelConfirm}>
                                Yes, Cancel Registration
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header Section */}
            <div className="my-events-header">
                <div className="header-content">
                    <h1>My Registered Events</h1>
                    <p>Manage your event registrations and reviews</p>
                </div>
                <button onClick={refreshData} className="btn-refresh">
                    🔄 Refresh
                </button>
            </div>

            {/* Stats Cards */}
            <div className="summary-cards">
                <div className="summary-card">
                    <div className="summary-icon">📅</div>
                    <div className="summary-content">
                        <strong>{registrations.length}</strong>
                        <span>Total Registrations</span>
                    </div>
                </div>
                <div className="summary-card">
                    <div className="summary-icon">⏳</div>
                    <div className="summary-content">
                        <strong>{registrations.filter(reg => reg.status === 'pending').length}</strong>
                        <span>Pending Approval</span>
                    </div>
                </div>
                <div className="summary-card">
                    <div className="summary-icon">✅</div>
                    <div className="summary-content">
                        <strong>{registrations.filter(reg => reg.status === 'approved').length}</strong>
                        <span>Approved</span>
                    </div>
                </div>
                <div className="summary-card">
                    <div className="summary-icon">⭐</div>
                    <div className="summary-content">
                        <strong>{Object.keys(userReviews).length}</strong>
                        <span>Reviews Given</span>
                    </div>
                </div>
            </div>

            {/* Events Grid */}
            {registrations.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">🎫</div>
                    <h3>No Registered Events Yet</h3>
                    <p>Explore events and register to see them here!</p>
                    <button onClick={() => window.location.href = '/dashboard'} className="btn-primary">
                        Discover Events
                    </button>
                </div>
            ) : (
                <div className="events-grid">
                    {registrations.map(registration => {
                        const event = registration.event;
                        const userReview = userReviews[event?._id];
                        const hasUserReview = !!userReview;
                        const isApproved = registration.status === 'approved';
                        
                        return (
                            <div key={registration._id} className="event-card">
                                {/* Event Image */}
                                <div className="event-image-container">
                                    {event?.image ? (
                                        <img 
                                            src={event.image} 
                                            alt={event.title}
                                            className="event-image"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.nextSibling.style.display = 'flex';
                                            }}
                                        />
                                    ) : null}
                                    <div className="event-image-placeholder" style={{display: event?.image ? 'none' : 'flex'}}>
                                        <span>🎉</span>
                                    </div>
                                    <div className="event-category-tag">
                                        {event?.category || 'General'}
                                    </div>
                                    <div className="registration-status-overlay">
                                        <span className={`status-badge status-${registration.status}`}>
                                            {registration.status.toUpperCase()}
                                        </span>
                                    </div>
                                    {/* Review Badge */}
                                    {hasUserReview && (
                                        <div className="review-badge">
                                            ⭐ Reviewed
                                        </div>
                                    )}
                                </div>
                                
                                {/* Event Details */}
                                <div className="event-content">
                                    <div className="event-header">
                                        <h3 className="event-title">{event?.title || 'Untitled Event'}</h3>
                                    </div>
                                    
                                    <p className="event-description">
                                        {event?.description || 'No description available.'}
                                    </p>
                                    
                                    <div className="event-details">
                                        <div className="detail-item">
                                            <span className="detail-icon">📅</span>
                                            <span className="detail-text">
                                                {formatDate(event?.startDate)}
                                                {event?.endDate && event.endDate !== event.startDate && 
                                                    ` to ${formatDate(event.endDate)}`
                                                }
                                            </span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-icon">🕒</span>
                                            <span className="detail-text">
                                                {getTimeRange(event?.startTime, event?.endTime)}
                                            </span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-icon">📍</span>
                                            <span className="detail-text">
                                                {event?.venue || 'Location not specified'}
                                            </span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-icon">👥</span>
                                            <span className="detail-text">
                                                Your attendees: {getAttendeeCount(registration)}
                                            </span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-icon">📝</span>
                                            <span className="detail-text">
                                                Registered: {formatDate(registration.createdAt)}
                                            </span>
                                        </div>
                                        {hasUserReview && (
                                            <div className="detail-item">
                                                <span className="detail-icon">⭐</span>
                                                <span className="detail-text">
                                                    Your rating: {userReview.rating}/5
                                                    {userReview.comment && ' (with comment)'}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Registration Actions */}
                                    <div className="registration-actions">
                                        {registration.status === 'pending' && (
                                            <button 
                                                className="btn-cancel-registration"
                                                onClick={() => handleCancelClick(registration)}
                                            >
                                                ❌ Cancel Registration
                                            </button>
                                        )}
                                        {registration.status === 'approved' && (
                                            <div className="approved-actions">
                                                <button 
                                                    className={`btn-write-review ${hasUserReview ? 'has-review' : ''}`}
                                                    onClick={() => handleReviewClick(event, registration)}
                                                    disabled={!isApproved}
                                                >
                                                    {!isApproved ? 'Pending Review' : 
                                                     hasUserReview ? '✏️ Update Review' : '⭐ Write Review'}
                                                </button>
                                                <button 
                                                    className="btn-cancel-registration"
                                                    onClick={() => handleCancelClick(registration)}
                                                >
                                                    ❌ Cancel Registration
                                                </button>
                                            </div>
                                        )}
                                        {registration.status === 'rejected' && (
                                            <button className="btn-secondary">
                                                View Reason
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default MyEvents;