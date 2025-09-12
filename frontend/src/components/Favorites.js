
import React from 'react';
import { useAuth } from '../context/AuthContext';

const Favorites = ({ favoritedEvents, onToggleFavorite, onNavigateToDiscover }) => {
    const { user } = useAuth();

    const handleRemoveFavorite = (eventId) => {
        if (onToggleFavorite) {
            onToggleFavorite(eventId, false);
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

    return (
        <div className="favorites-tab-content">
            {favoritedEvents && favoritedEvents.length > 0 ? (
                <div>
                    <div className="list-header">
                        <h2>Your Favorite Events</h2>
                        <span>{favoritedEvents.length} events</span>
                    </div>
                    <ul className="event-list">
                        {favoritedEvents.map(event => (
                            <li key={event._id} className="event-list-item">
                                <div className="event-info-container">
                                    <h3>{event.title}</h3>
                                    <p className="event-info">
                                        📅 {formatDate(event.startDate)} at {formatTime(event.startTime)}
                                    </p>
                                    <p className="event-info">📍 {event.venue}</p>
                                    <p className="event-info">{event.registered}/{event.capacity} registered</p>
                                </div>
                                <div className="list-item-actions">
                                    <button className="btn-secondary">View Details</button>
                                    <button 
                                        className="btn-tertiary"
                                        onClick={() => handleRemoveFavorite(event._id)}
                                    >
                                        Remove
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            ) : (
                <div className="empty-state">
                    <div className="empty-icon">♡</div>
                    <h2>No favorite events yet</h2>
                    <p>Start exploring events and add them to your favorites!</p>
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
