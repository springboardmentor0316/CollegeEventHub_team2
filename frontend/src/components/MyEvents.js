import React from 'react';

const MyEvents = () => {
    const registeredEvents = [
        { id: 1, title: 'Tech Innovation Summit 2025', date: '2025-09-15 at 9:00 AM', location: 'Main Auditorium, Tech Building', ticket: 'THX001234' },
        { id: 2, title: 'Career Fair 2025', date: '2025-09-22 at 10:00 AM', location: 'Student Center, Main Hall', ticket: 'CF005678' },
    ];
    return (
        <div className="my-events">
            <div className="list-header">
                <h2>My Registered Events</h2>
                <span>{registeredEvents.length} events</span>
            </div>
            <ul className="event-list">
                {registeredEvents.map(event => (
                    <li key={event.id} className="event-list-item">
                        <div>
                            <h3>{event.title}</h3>
                            <p className="event-info">{event.date} ◽ {event.location}</p>
                            <p className="event-ticket"><span>confirmed</span> Ticket: {event.ticket}</p>
                        </div>
                        <div className="list-item-actions">
                            <button className="btn-secondary">View Details</button>
                            <button className="btn-tertiary">Cancel</button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};
export default MyEvents;