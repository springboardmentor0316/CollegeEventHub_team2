
import React, { useState, useEffect } from 'react';
import API from '../axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const DiscoverEvents = ({ onToggleFavorite }) => {
    const [events, setEvents] = useState([]);
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    
    // Filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateRange, setDateRange] = useState({
        start: '',
        end: ''
    });
    
    // Available categories extracted from events
    const [availableCategories, setAvailableCategories] = useState([]);

    useEffect(() => {
        fetchEvents();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [events, searchQuery, categoryFilter, statusFilter, dateRange]);

    const fetchEvents = async () => {
        try {
            const res = await API.get("/api/events/all_events");
            const eventsData = res.data?.events || [];
            
            // Add isFavorite property to each event
            const eventsWithFavorites = eventsData.map(event => ({
                ...event,
                isFavorite: false
            }));
            
            setEvents(eventsWithFavorites);
            
            // Extract unique categories
            const categories = ['all', ...new Set(eventsData.map(event => event.category))];
            setAvailableCategories(categories);
        } catch (error) {
            console.error("Error fetching events:", error);
            toast.error("Error fetching events. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let result = [...events];
        
        // Apply search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(event => 
                event.title.toLowerCase().includes(query) || 
                event.description.toLowerCase().includes(query) ||
                event.venue.toLowerCase().includes(query)
            );
        }
        
        // Apply category filter
        if (categoryFilter !== 'all') {
            result = result.filter(event => event.category === categoryFilter);
        }
        
        // Apply status filter
        if (statusFilter !== 'all') {
            if (statusFilter === 'published') {
                result = result.filter(event => event.published);
            } else if (statusFilter === 'draft') {
                result = result.filter(event => event.draft);
            }
        }
        
        // Apply date range filter
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

    const handleToggleFavorite = (eventId) => {
        setEvents(prevEvents =>
            prevEvents.map(event =>
                event._id === eventId ? { ...event, isFavorite: !event.isFavorite } : event
            )
        );
        
        if (onToggleFavorite) {
            const updatedEvent = events.find(event => event._id === eventId);
            onToggleFavorite(updatedEvent._id, !updatedEvent.isFavorite);
        }
    };

    const handleShare = async (eventTitle, eventUrl) => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: eventTitle,
                    url: eventUrl,
                });
                console.log('Event shared successfully');
            } catch (error) {
                console.error('Error sharing event:', error);
                alert(`Could not share: ${error.message}`);
            }
        } else {
            const shareText = `${eventTitle} - Check out this event: ${eventUrl}`;
            navigator.clipboard.writeText(shareText)
                .then(() => alert('Event link copied to clipboard!'))
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

    if (loading) return <div className="loading">Loading events...</div>;

    return (
        <div className="discover-events">
            <div className="summary-cards">
                <div className="summary-card"><strong>{events.length}</strong> Total Events</div>
                <div className="summary-card"><strong>{events.filter(e => e.status === 'Registered').length}</strong> Registered</div>
                <div className="summary-card"><strong>{events.filter(e => e.isFavorite).length}</strong> Favorites</div>
                <div className="summary-card"><strong>{events.filter(e => e.status === 'Attended').length}</strong> Attended</div>
            </div>
            
            {/* Advanced Filters */}
            <div className="advanced-filters">
                <h3>Filter Events</h3>
                
                <div className="filter-group">
                    <div className="filter-item">
                        <label htmlFor="search">Search Events:</label>
                        <input
                            type="text"
                            id="search"
                            placeholder="Search by title, description, or venue..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    
                    <div className="filter-item">
                        <label htmlFor="category">Event Type:</label>
                        <select
                            id="category"
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                        >
                            {availableCategories.map(category => (
                                <option key={category} value={category}>
                                    {category.charAt(0).toUpperCase() + category.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="filter-item">
                        <label htmlFor="status">Status:</label>
                        <select
                            id="status"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">All Statuses</option>
                            <option value="published">Published</option>
                            <option value="draft">Drafts</option>
                        </select>
                    </div>
                    
                    <div className="filter-item">
                        <label>Date Range:</label>
                        <div className="date-range">
                            <input
                                type="date"
                                placeholder="Start Date"
                                value={dateRange.start}
                                onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                            />
                            <span>to</span>
                            <input
                                type="date"
                                placeholder="End Date"
                                value={dateRange.end}
                                onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                            />
                        </div>
                    </div>
                    
                    <button className="reset-filters" onClick={handleResetFilters}>
                        Reset Filters
                    </button>
                </div>
            </div>
            
            <div className="results-info">
                <p>Showing {filteredEvents.length} of {events.length} events</p>
            </div>
            
            <div className="event-grid">
                {filteredEvents.length === 0 ? (
                    <div className="no-events">
                        <p>No events match your filters.</p>
                        <button onClick={handleResetFilters}>Clear all filters</button>
                    </div>
                ) : (
                    filteredEvents.map(event => (
                        <div key={event._id} className="event-card">
                            {event.image ? (
                                <img 
                                    src={event.image} 
                                    alt={event.title}
                                    className="event-image"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'block';
                                    }}
                                />
                            ) : null}
                            <div className="event-image-placeholder" style={{display: event.image ? 'none' : 'block'}}></div>
                            
                            <div className="event-details">
                                <span className="event-category">{event.category}</span>
                                <div className="event-actions">
                                    <button 
                                        className={`icon-btn favorite-btn ${event.isFavorite ? 'favorited' : ''}`}
                                        onClick={() => handleToggleFavorite(event._id)}>
                                        {event.isFavorite ? '❤️' : '🤍'}
                                    </button>
                                    <button 
                                        className="icon-btn share-btn"
                                        onClick={() => handleShare(event.title, `http://localhost:3000/events/${event._id}`)}>
                                        🔗
                                    </button>
                                </div>
                                <h3>{event.title}</h3>
                                <p className="event-info">📅 {formatDate(event.startDate)} {event.endDate && event.endDate !== event.startDate ? `to ${formatDate(event.endDate)}` : ''}</p>
                                <p className="event-info">🕒 {getTimeRange(event.startTime, event.endTime)}</p>
                                <p className="event-info">📍 {event.venue}</p>
                                <p className="event-info">👥 {event.capacity} capacity</p>
                                <p className="event-info">💰 {event.price > 0 ? `$${event.price}` : 'Free'}</p>
                                
                                <div className="event-status">
                                    <span className={`status-indicator ${event.published ? 'published' : 'draft'}`}>
                                        {event.published ? 'Published' : 'Draft'}
                                    </span>
                                </div>
                                
                                <button className={`btn ${event.status === 'Registered' ? 'btn-secondary' : 'btn-primary'}`}>
                                    {event.status || 'Register Now'}
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default DiscoverEvents;