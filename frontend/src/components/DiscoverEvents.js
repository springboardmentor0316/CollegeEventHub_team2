import React, { useState } from 'react';

const DiscoverEvents = ({ onToggleFavorite }) => {
    // In a real app, this data would come from your backend API
    const initialEvents = [
        { id: 1, category: 'Technology', title: 'Tech Innovation Summit 2025', date: '2025-09-15 at 9:00 AM', location: 'Main Auditorium, Tech Building', registered: 245, capacity: 500, status: 'Registered', isFavorite: false },
        { id: 2, category: 'Arts', title: 'Student Art Exhibition', date: '2025-09-18 at 10:00 AM', location: 'Art Gallery, Fine Arts Building', registered: 88, capacity: 150, status: 'Register Now', isFavorite: false },
    ];

    const [events, setEvents] = useState(initialEvents);

    const handleToggleFavorite = (eventId) => {
        setEvents(prevEvents =>
            prevEvents.map(event =>
                event.id === eventId ? { ...event, isFavorite: !event.isFavorite } : event
            )
        );
        // Call the parent handler to update global favorites state if needed
        if (onToggleFavorite) {
            const updatedEvent = events.find(event => event.id === eventId);
            onToggleFavorite(updatedEvent.id, !updatedEvent.isFavorite);
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
            // Fallback for browsers that don't support Web Share API
            const shareText = `${eventTitle} - Check out this event: ${eventUrl}`;
            navigator.clipboard.writeText(shareText)
                .then(() => alert('Event link copied to clipboard!'))
                .catch(err => console.error('Could not copy text: ', err));
        }
    };

    return (
        <div className="discover-events">
            <div className="summary-cards">
                <div className="summary-card"><strong>24</strong> Upcoming Events</div>
                <div className="summary-card"><strong>7</strong> Registered</div>
                <div className="summary-card"><strong>{events.filter(e => e.isFavorite).length}</strong> Favorites</div> {/* Dynamic favorite count */}
                <div className="summary-card"><strong>18</strong> Attended</div>
            </div>
            <div className="event-filters">
                <input type="search" placeholder="Search events..." />
                <div className="category-tags">
                    <span>All</span>
                    <span className="active">Technology</span>
                    <span>Entertainment</span>
                    <span>Academic</span>
                    <span>Sports</span>
                    <span>Career</span>
                    <span>Social</span>
                </div>
            </div>
            <div className="event-grid">
                {events.map(event => (
                    <div key={event.id} className="event-card">
                        <div className="event-image-placeholder"></div>
                        <div className="event-details">
                            <span className="event-category">{event.category}</span>
                            <div className="event-actions">
                                <button 
                                    className={`icon-btn favorite-btn ${event.isFavorite ? 'favorited' : ''}`}
                                    onClick={() => handleToggleFavorite(event.id)}>
                                    {event.isFavorite ? '❤️' : '🤍'} {/* Filled vs Outline Heart */}
                                </button>
                                <button 
                                    className="icon-btn share-btn"
                                    onClick={() => handleShare(event.title, `http://localhost:3000/events/${event.id}`)}> {/* Example URL */}
                                    🔗
                                </button>
                            </div>
                            <h3>{event.title}</h3>
                            <p className="event-info">{event.date}</p>
                            <p className="event-info">{event.location}</p>
                            <p className="event-info">{event.registered}/{event.capacity} registered</p>
                            <button className={`btn ${event.status === 'Registered' ? 'btn-secondary' : 'btn-primary'}`}>
                                {event.status}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DiscoverEvents;