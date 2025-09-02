import React from 'react';

const Favorites = ({ favoritedEvents }) => {
    return (
        <div className="favorites-tab-content">
            {favoritedEvents && favoritedEvents.length > 0 ? (
                <div className="event-list">
                    <h2>Your Favorite Events</h2>
                    {favoritedEvents.map(event => (
                        <li key={event.id} className="event-list-item">
                            <div>
                                <h3>{event.title}</h3>
                                <p className="event-info">{event.date} ◽ {event.location}</p>
                            </div>
                            <div className="list-item-actions">
                                <button className="btn-secondary">View Details</button>
                                {/* Option to remove from favorites from here too */}
                            </div>
                        </li>
                    ))}
                </div>
            ) : (
                <div className="empty-state">
                    <div className="empty-icon">♡</div>
                    <h2>No favorite events yet</h2>
                    <p>Start exploring events and add them to your favorites!</p>
                    <button className="btn-primary">Discover Events</button>
                </div>
            )}
        </div>
    );
};

export default Favorites;