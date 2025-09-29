
import React, { useState, useEffect } from 'react';
import API from '../axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import RegistrationModal from './RegistrationModel';
import './DiscoverEvents.css';

const DiscoverEvents = ({ onToggleFavorite, favoritedEvents }) => {
    const [events, setEvents] = useState([]);
    const [registrations, setRegistrations] = useState([]);
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [showRegistrationModal, setShowRegistrationModal] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState({ registrationId: null, eventId: null });
    
    const [availableCategories, setAvailableCategories] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });

    const { user } = useAuth();

    useEffect(() => {
        fetchEvents();
        if (user) {
            fetchUserRegistrations();
        }
    }, [user]);

    useEffect(() => {
        applyFilters();
    }, [events, searchQuery, categoryFilter, statusFilter, dateRange]);

    // Debug useEffect
    useEffect(() => {
        console.log('🔍 DiscoverEvents - Current events:', events);
        console.log('🔍 DiscoverEvents - Favorited events from props:', favoritedEvents);
        console.log('🔍 DiscoverEvents - onToggleFavorite function:', onToggleFavorite ? 'Provided' : 'NOT PROVIDED');
    }, [events, favoritedEvents, onToggleFavorite]);

    const fetchEvents = async () => {
        try {
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

    const handleToggleFavorite = (eventId) => {
        console.log('⭐ DiscoverEvents: Toggle favorite called for event:', eventId);
        
        // Find the actual event object
        const event = events.find(e => e._id === eventId);
        console.log('⭐ Found event:', event);
        
        if (!event) {
            console.error('❌ Event not found');
            return;
        }

        const newFavoriteStatus = !event.isFavorite;
        console.log('⭐ New favorite status:', newFavoriteStatus);

        // Update local UI state first for immediate feedback
        setEvents(prevEvents =>
            prevEvents.map(event =>
                event._id === eventId ? { ...event, isFavorite: newFavoriteStatus } : event
            )
        );
        
        // Call parent function to update global state
        if (onToggleFavorite) {
            console.log('⭐ Calling onToggleFavorite with event data');
            onToggleFavorite(event, newFavoriteStatus);
        } else {
            console.error('❌ onToggleFavorite function not provided');
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
        
        if (statusFilter !== 'all') {
            if (statusFilter === 'published') {
                result = result.filter(event => event.published);
            } else if (statusFilter === 'draft') {
                result = result.filter(event => event.draft);
            }
        }
        
        if (dateRange.start) {
            const startDate = new Date(dateRange.start);
            result = result.filter(event => new Date(event.startDate) >= startDate);
        }
        
        if (dateRange.end) {
            const endDate = new Date(dateRange.end);
            result = result.filter(event => new Date(event.startDate) <= endDate);
        }
        
        setFilteredEvents(result);
    };

    const getRegistrationStatus = (eventId) => {
        const registration = registrations.find(reg => reg.event && reg.event._id === eventId);
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
        toast.success("Registration submitted successfully! Status: Pending Approval");
    };

    const handleCancelRegistration = async (registrationId, eventId) => {
        try {
            await API.put(`/api/registrations/cancel/${registrationId}`);
            setRegistrations(prev => prev.filter(reg => reg._id !== registrationId));
            setShowCancelConfirm({ registrationId: null, eventId: null });
            toast.success("Registration cancelled successfully");
        } catch (error) {
            console.error("Error cancelling registration:", error);
            toast.error("Error cancelling registration");
        }
    };

    const handleShare = async (eventTitle, eventId) => {
        const eventUrl = `${window.location.origin}/events/${eventId}`;
        
        if (navigator.share) {
            try {
                await navigator.share({
                    title: eventTitle,
                    url: eventUrl,
                });
            } catch (error) {
                console.error('Error sharing event:', error);
            }
        } else {
            navigator.clipboard.writeText(eventUrl)
                .then(() => toast.success('Event link copied to clipboard!'))
                .catch(err => console.error('Could not copy text: ', err));
        }
    };

    const handleResetFilters = () => {
        setSearchQuery('');
        setCategoryFilter('all');
        setStatusFilter('all');
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

    const refreshData = () => {
        fetchEvents();
        if (user) {
            fetchUserRegistrations();
        }
        toast.info("Refreshing events...");
    };

    if (loading) {
        return (
            <div className="discover-events">
                <div className="loading">Loading events...</div>
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
            
            {/* Cancel Confirmation Modal */}
            {showCancelConfirm.registrationId && (
                <div className="cancel-confirm-overlay">
                    <div className="cancel-confirm-dialog">
                        <p>Are you sure you want to cancel your registration?</p>
                        <div className="cancel-confirm-buttons">
                            <button
                                onClick={() => {
                                    handleCancelRegistration(showCancelConfirm.registrationId, showCancelConfirm.eventId);
                                }}
                                className="btn btn-primary"
                            >
                                Yes
                            </button>
                            <button
                                onClick={() => setShowCancelConfirm({ registrationId: null, eventId: null })}
                                className="btn btn-secondary"
                            >
                                No
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Summary Cards */}
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
            
            {/* Filters Section */}
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
                        
                        <select 
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="filter-select"
                        >
                            <option value="all">All Status</option>
                            <option value="published">Published</option>
                            <option value="draft">Draft</option>
                        </select>
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
            
            {/* Results Info */}
            <div className="results-info">
                <p>Showing {filteredEvents.length} of {events.length} events</p>
            </div>
            
            {/* Events Grid */}
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
                        const isEventFull = event.capacity <= (event.registeredCount || 0);
                        
                        return (
                            <div key={event._id} className="event-card">
                                {/* Event Image */}
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
                                </div>
                                
                                {/* Event Details */}
                                <div className="event-content">
                                    <div className="event-header">
                                        <h3 className="event-title">{event.title || 'Untitled Event'}</h3>
                                        <div className="event-actions">
                                            <button 
                                                className={`favorite-btn ${event.isFavorite ? 'active' : ''}`}
                                                onClick={() => handleToggleFavorite(event._id)}
                                                title={event.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                                            >
                                                {event.isFavorite ? '❤️' : '🤍'}
                                            </button>
                                            <button 
                                                className="share-btn"
                                                onClick={() => handleShare(event.title, event._id)}
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
                                    
                                    {/* Registration Status */}
                                    <div className="registration-section">
                                        {isRegistered ? (
                                            <div className="registration-status">
                                                {userRegistration.status === 'approved' && (
                                                    <div className="status-item status-approved">
                                                        <span className="status-icon">✅</span>
                                                        <span className="status-text">Registered</span>
                                                    </div>
                                                )}
                                                {userRegistration.status === 'pending' && (
                                                    <div className="status-item status-pending">
                                                        <span className="status-icon">🕒</span>
                                                        <span className="status-text">Pending</span>
                                                        <button 
                                                            className="btn-cancel"
                                                            onClick={() => setShowCancelConfirm({ 
                                                                registrationId: userRegistration._id, 
                                                                eventId: event._id 
                                                            })}
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                )}
                                                {userRegistration.status === 'rejected' && (
                                                    <div className="status-item status-rejected">
                                                        <span className="status-icon">❌</span>
                                                        <span className="status-text">Rejected</span>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <button 
                                                className={`btn-register ${isEventFull ? 'disabled' : ''}`}
                                                onClick={() => handleRegister(event)}
                                                disabled={isEventFull || !user}
                                            >
                                                {!user ? 'Login to Register' : 
                                                 isEventFull ? 'Event Full' : 'Register Now'}
                                            </button>
                                        )}
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


