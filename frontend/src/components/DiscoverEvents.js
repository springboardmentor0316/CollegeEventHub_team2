
import React, { useState, useEffect } from 'react';
import API from '../axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import RegistrationModal from './RegistrationModel';
import ReviewModal from './ReviewModal';
import EventReviews from './EventReviews';
import './DiscoverEvents.css';

const DiscoverEvents = ({ onToggleFavorite, favoritedEvents }) => {
    const [events, setEvents] = useState([]);
    const [registrations, setRegistrations] = useState([]);
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [showRegistrationModal, setShowRegistrationModal] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState({ registrationId: null, eventId: null });
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [selectedEventForReview, setSelectedEventForReview] = useState(null);
    const [userReviews, setUserReviews] = useState({});
    const [showReviewsModal, setShowReviewsModal] = useState(false);
    const [selectedEventReviews, setSelectedEventReviews] = useState(null);
    
    const [availableCategories, setAvailableCategories] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });

    const { user } = useAuth();

    useEffect(() => {
        fetchEvents();
        if (user) {
            fetchUserRegistrations();
            fetchUserReviews();
        }
    }, [user, favoritedEvents]);

    useEffect(() => {
        applyFilters();
    }, [events, searchQuery, categoryFilter, dateRange]);

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

    const fetchEvents = async () => {
        try {
            setError(null);
            setLoading(true);
            const res = await API.get("/api/events/all_events");
            const eventsData = res.data?.events || [];
            
            const eventsWithFavorites = eventsData.map(event => ({
                ...event,
                isFavorite: favoritedEvents?.some(favEvent => favEvent._id === event._id) || false
            }));
            
            setEvents(eventsWithFavorites);
            
            const categories = ['all', ...new Set(eventsData.map(event => event.category).filter(Boolean))];
            setAvailableCategories(categories);
            
        } catch (error) {
            console.error("Error fetching events:", error);
            setError("Failed to load events. Please try again.");
            toast.error("Error fetching events. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const fetchUserRegistrations = async () => {
        if (!user) return;
        
        try {
            const response = await API.get('/api/registrations/my-registrations');
            setRegistrations(response.data.registrations || []);
        } catch (error) {
            console.error("Error fetching user registrations:", error);
        }
    };

    const checkIfUserCanReview = async (eventId) => {
        if (!user) return false;
        
        try {
            const response = await API.get(`/api/reviews/event/${eventId}/can-review`);
            return response.data.canReview;
        } catch (error) {
            console.error("Error checking review eligibility:", error);
            return false;
        }
    };

    const handleToggleFavorite = (eventId) => {
        const event = events.find(e => e._id === eventId);
        
        if (!event) {
            console.error('❌ Event not found');
            return;
        }

        const newFavoriteStatus = !event.isFavorite;

        setEvents(prevEvents =>
            prevEvents.map(event =>
                event._id === eventId ? { ...event, isFavorite: newFavoriteStatus } : event
            )
        );
        
        if (onToggleFavorite) {
            onToggleFavorite(event, newFavoriteStatus);
        }
    };

    const applyFilters = () => {
        let result = [...events];
        
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(event => 
                event.title?.toLowerCase().includes(query) || 
                event.description?.toLowerCase().includes(query) ||
                event.venue?.toLowerCase().includes(query)
            );
        }
        
        if (categoryFilter !== 'all') {
            result = result.filter(event => event.category === categoryFilter);
        }
        
        if (dateRange.start) {
            const startDate = new Date(dateRange.start);
            result = result.filter(event => new Date(event.startDate) >= startDate);
        }
        
        if (dateRange.end) {
            const endDate = new Date(dateRange.end);
            endDate.setHours(23, 59, 59, 999);
            result = result.filter(event => new Date(event.startDate) <= endDate);
        }
        
        setFilteredEvents(result);
    };

    const getRegistrationStatus = (eventId) => {
        const registration = registrations.find(reg => reg.event && (reg.event._id === eventId || reg.event === eventId));
        return registration || null;
    };

    const handleRegister = (event) => {
        if (!user) {
            toast.error("Please login to register for events");
            return;
        }
        setSelectedEvent(event);
        setShowRegistrationModal(true);
    };

    const handleRegistrationSuccess = async (registration) => {
        setShowRegistrationModal(false);
        await fetchUserRegistrations();
        await fetchEvents();
        toast.success("Registration submitted successfully! Status: Pending Approval");
    };

    const handleCancelRegistration = async (registrationId, eventId) => {
        try {
            await API.put(`/api/registrations/cancel/${registrationId}`);
            setRegistrations(prev => prev.filter(reg => reg._id !== registrationId));
            await fetchEvents();
            setShowCancelConfirm({ registrationId: null, eventId: null });
            toast.success("Registration cancelled successfully");
        } catch (error) {
            console.error("Error cancelling registration:", error);
            toast.error("Error cancelling registration");
        }
    };

    const fallbackCopy = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            toast.success('Event link copied to clipboard!');
        } catch (err) {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            toast.success('Event link copied to clipboard!');
        }
    };

    const handleShare = async (eventTitle, eventId) => {
        const eventUrl = `${window.location.origin}/events/${eventId}`;
        
        if (navigator.share) {
            try {
                await navigator.share({
                    title: eventTitle,
                    text: `Check out this event: ${eventTitle}`,
                    url: eventUrl,
                });
            } catch (error) {
                if (error.name !== 'AbortError') {
                    await fallbackCopy(eventUrl);
                }
            }
        } else {
            await fallbackCopy(eventUrl);
        }
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
        fetchEvents();
        toast.success(review._id ? "Review updated successfully!" : "Review submitted successfully!");
    };

    const handleReviewDelete = async (eventId) => {
        try {
            setUserReviews(prev => {
                const newReviews = { ...prev };
                delete newReviews[eventId];
                return newReviews;
            });
            
            fetchEvents();
            toast.success("Review deleted successfully!");
        } catch (error) {
            console.error("Error in review deletion:", error);
            toast.error("Review deleted successfully!");
        }
    };

    const handleResetFilters = () => {
        setSearchQuery('');
        setCategoryFilter('all');
        setDateRange({ start: '', end: '' });
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        try {
            const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
            return new Date(dateString).toLocaleDateString('en-US', options);
        } catch (error) {
            return 'Invalid Date';
        }
    };

    const formatTime = (timeString) => {
        if (!timeString) return '';
        try {
            const [hours, minutes] = timeString.split(':');
            const hour = parseInt(hours);
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const formattedHour = hour % 12 || 12;
            return `${formattedHour}:${minutes} ${ampm}`;
        } catch (error) {
            return 'Invalid Time';
        }
    };

    const getTimeRange = (startTime, endTime) => {
        return `${formatTime(startTime)} - ${formatTime(endTime)}`;
    };

    const refreshData = async () => {
        setLoading(true);
        try {
            await fetchEvents();
            if (user) {
                await fetchUserRegistrations();
                await fetchUserReviews();
            }
            toast.info("Events and reviews refreshed!");
        } catch (error) {
            console.error("Error refreshing data:", error);
            toast.error("Error refreshing data");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="discover-events">
                <div className="loading">Loading events...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="discover-events">
                <div className="error-state">
                    <div className="error-icon">⚠️</div>
                    <h3>Unable to load events</h3>
                    <p>{error}</p>
                    <button onClick={fetchEvents} className="btn-primary">Try Again</button>
                </div>
            </div>
        );
    }

    return (
        <div className="discover-events">
            {showRegistrationModal && selectedEvent && (
                <RegistrationModal
                    event={selectedEvent}
                    onClose={() => setShowRegistrationModal(false)}
                    onSuccess={handleRegistrationSuccess}
                />
            )}
            
            {showReviewModal && selectedEventForReview && (
                <ReviewModal
                    event={selectedEventForReview}
                    existingReview={userReviews[selectedEventForReview._id]}
                    onClose={() => setShowReviewModal(false)}
                    onSuccess={handleReviewSuccess}
                    onDelete={() => handleReviewDelete(selectedEventForReview._id)}
                />
            )}

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
            
            {showCancelConfirm.registrationId && (
                <div className="cancel-confirm-overlay">
                    <div className="cancel-confirm-dialog">
                        <p>Are you sure you want to cancel your registration?</p>
                        <div className="cancel-confirm-buttons">
                            <button
                                onClick={() => {
                                    handleCancelRegistration(showCancelConfirm.registrationId, showCancelConfirm.eventId);
                                }}
                                className="btn-primary"
                            >
                                Yes
                            </button>
                            <button
                                onClick={() => setShowCancelConfirm({ registrationId: null, eventId: null })}
                                className="btn-secondary"
                            >
                                No
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            <div className="summary-cards">
                <div className="summary-card">
                    <div className="summary-icon">📅</div>
                    <div className="summary-content">
                        <strong>{events.length}</strong>
                        <span>Total Events</span>
                    </div>
                </div>
                <div className="summary-card">
                    <div className="summary-icon">👥</div>
                    <div className="summary-content">
                        <strong>{registrations.length}</strong>
                        <span>My Registrations</span>
                    </div>
                </div>
                <div className="summary-card">
                    <div className="summary-icon">❤️</div>
                    <div className="summary-content">
                        <strong>{favoritedEvents ? favoritedEvents.length : 0}</strong>
                        <span>Favorites</span>
                    </div>
                </div>
            </div>
            
            <div className="filters-section">
                <div className="search-container">
                    <input 
                        type="search" 
                        placeholder="🔍 Search events by title, description, or venue..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input"
                    />
                </div>
                
                <div className="filter-controls">
                    <div className="filter-group">
                        <select 
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="filter-select"
                        >
                            {availableCategories.map(category => (
                                <option key={category} value={category}>
                                    {category === 'all' ? 'All Categories' : category}
                                </option>
                            ))}
                        </select>
                        
                        <input
                            type="date"
                            value={dateRange.start}
                            onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                            className="filter-select"
                            placeholder="Start Date"
                        />
                        
                        <input
                            type="date"
                            value={dateRange.end}
                            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                            className="filter-select"
                            placeholder="End Date"
                        />
                    </div>
                    
                    <div className="action-buttons">
                        <button onClick={handleResetFilters} className="btn-secondary">
                            Reset Filters
                        </button>
                        <button onClick={refreshData} className="btn-primary">
                            🔄 Refresh
                        </button>
                    </div>
                </div>
            </div>
            
            <div className="results-info">
                <p>Showing {filteredEvents.length} of {events.length} events</p>
            </div>
            
            <div className="events-grid">
                {filteredEvents.length === 0 ? (
                    <div className="no-events">
                        <div className="no-events-icon">🎭</div>
                        <h3>No events found</h3>
                        <p>Try adjusting your search criteria or browse all events</p>
                        {events.length > 0 && (
                            <button onClick={handleResetFilters} className="btn-primary">
                                Show All Events
                            </button>
                        )}
                    </div>
                ) : (
                    filteredEvents.map(event => {
                        const userRegistration = getRegistrationStatus(event._id);
                        const isRegistered = !!userRegistration;
                        const isApproved = userRegistration?.status === 'approved';
                        const isEventFull = event.capacity && (event.registeredCount || 0) >= event.capacity;
                        const userReview = userReviews[event._id];
                        const hasReviews = event.reviewCount > 0;
                        
                        return (
                            <div key={event._id} className="event-card">
                                <div className="event-image-container">
                                    {event.image ? (
                                        <img 
                                            src={event.image} 
                                            alt={event.title}
                                            className="event-image"
                                        />
                                    ) : (
                                        <div className="event-image-placeholder">
                                            <span>🎉</span>
                                        </div>
                                    )}
                                    <div className="event-category-tag">
                                        {event.category || 'General'}
                                    </div>
                                    {hasReviews && (
                                        <div 
                                            className="reviews-badge clickable"
                                            onClick={() => handleViewReviews(event)}
                                            title="Click to view reviews"
                                        >
                                            ⭐ {event.averageRating?.toFixed(1) || 0} ({event.reviewCount})
                                        </div>
                                    )}
                                </div>
                                
                                <div className="event-content">
                                    <div className="event-header">
                                        <h3 className="event-title">{event.title || 'Untitled Event'}</h3>
                                        <div className="event-actions">
                                            <button 
                                                className={`favorite-btn ${event.isFavorite ? 'active' : ''}`}
                                                onClick={() => handleToggleFavorite(event._id)}
                                                aria-label={event.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                                                title={event.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                                            >
                                                {event.isFavorite ? '❤️' : '🤍'}
                                            </button>
                                            <button 
                                                className="share-btn"
                                                onClick={() => handleShare(event.title, event._id)}
                                                aria-label="Share event"
                                                title="Share event"
                                            >
                                                🔗
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <p className="event-description">
                                        {event.description || 'No description available.'}
                                    </p>
                                    
                                    <div className="event-details">
                                        <div className="detail-item">
                                            <span className="detail-icon">📅</span>
                                            <span className="detail-text">
                                                {formatDate(event.startDate)}
                                                {event.endDate && event.endDate !== event.startDate && 
                                                    ` to ${formatDate(event.endDate)}`
                                                }
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
                                    
                                    <div className="fixed-buttons-container">
                                        <div className="top-button-section">
                                            {isRegistered ? (
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
                                        
                                        <div className="bottom-button-section">
                                            {isRegistered ? (
                                                <div className="registration-status-btn">
                                                    {userRegistration.status === 'approved' && (
                                                        <div className="status-approved-btn">
                                                            <span className="status-text">✅ Registered</span>
                                                            <button 
                                                                className="btn-cancel"
                                                                onClick={() => setShowCancelConfirm({ 
                                                                    registrationId: userRegistration._id, 
                                                                    eventId: event._id 
                                                                })}
                                                                aria-label="Cancel registration"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    )}
                                                    {userRegistration.status === 'pending' && (
                                                        <div className="status-pending-btn">
                                                            <span className="status-text">🕒 Pending</span>
                                                            <button 
                                                                className="btn-cancel"
                                                                onClick={() => setShowCancelConfirm({ 
                                                                    registrationId: userRegistration._id, 
                                                                    eventId: event._id 
                                                                })}
                                                                aria-label="Cancel registration"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    )}
                                                    {userRegistration.status === 'rejected' && (
                                                        <div className="status-rejected-btn">
                                                            <span className="status-text">❌ Rejected</span>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <button 
                                                    className={`btn-register ${isEventFull ? 'disabled' : ''}`}
                                                    onClick={() => handleRegister(event)}
                                                    disabled={isEventFull || !user}
                                                    aria-label={!user ? 'Login to register' : isEventFull ? 'Event is full' : 'Register for event'}
                                                >
                                                    {!user ? 'Login to Register' : 
                                                     isEventFull ? 'Event Full' : 'Register Now'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default DiscoverEvents;