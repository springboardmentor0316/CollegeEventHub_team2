import React from 'react';
import Header from './Header'; // Re-use the main header
import './EventListingPage.css';

const EventListingPage = () => {
    // In a real app, this data would come from your backend API
    const events = [
        { id: 1, category: 'Technology', title: 'Tech Innovation Summit 2025', date: 'Mon, Sep 15, 2025', time: '9:00 AM - 5:00 PM', location: 'Main Auditorium, Tech Building', registered: 345, capacity: 500, tags: ['AI', 'Blockchain', 'Innovation', '+1'], requirements: 'Open to all students and faculty' },
        { id: 2, category: 'Arts', title: 'Student Art Exhibition', date: 'Thu, Sep 18, 2025 - Thu, Sep 25, 2025', time: '10:00 AM - 6:00 PM', location: 'Art Gallery, Fine Arts Building', registered: 92, capacity: 150, tags: ['Art', 'Exhibition', 'Student Work', '+1'], requirements: 'N/A' },
        { id: 3, category: 'Career', title: 'Career Fair 2025', date: 'Mon, Sep 22, 2025', time: '10:00 AM - 4:00 PM', location: 'Student Center, Main Hall', registered: 302, capacity: 500, tags: ['Career', 'Jobs', 'Internships', '+1'], requirements: 'Bring resume and dress professionally' },
    ];

    return (
        <>
            <Header />
            <div className="event-listing-container">
                <div className="event-listing-header">
                    <h1>Campus Events</h1>
                    <p>Discover and join amazing events happening on campus</p>
                </div>

                <div className="filters-bar">
                    <input type="search" placeholder="Search events..." className="search-input" />
                    <select className="filter-select">
                        <option>All</option>
                        <option>Technology</option>
                        <option>Arts</option>
                        <option>Career</option>
                    </select>
                    <select className="filter-select">
                        <option>All Dates</option>
                    </select>
                    <button className="btn btn-primary">Show All</button>
                </div>

                <p className="results-count">{events.length} events found</p>

                <div className="event-listing-grid">
                    {events.map(event => (
                        <div key={event.id} className="event-card-large">
                            <div className="event-image-placeholder"></div>
                            <div className="event-content">
                                <div className="card-header">
                                    <span>{event.category}</span>
                                    <div className="card-actions">
                                        <button className="icon-btn">♡</button>
                                        <button className="icon-btn">🔗</button>
                                    </div>
                                </div>
                                <h2>{event.title}</h2>
                                <p className="card-description">Join us for a day of cutting-edge technology presentations, networking opportunities, and hands-on workshops...</p>
                                <p className="card-info">📅 {event.date}</p>
                                <p className="card-info">🕒 {event.time}</p>
                                <p className="card-info">📍 {event.location}</p>
                                <div className="registration-status">
                                    <span>👥 {event.registered}/{event.capacity} registered</span>
                                    <div className="progress-bar">
                                        <div className="progress" style={{width: `${(event.registered/event.capacity)*100}%`}}></div>
                                    </div>
                                    <span>{Math.round((event.registered/event.capacity)*100)}% full</span>
                                </div>
                                <div className="tags">
                                    {event.tags.map(tag => <span key={tag} className="tag">{tag}</span>)}
                                </div>
                                <div className="card-footer">
                                    <button className="btn btn-secondary">Registered</button>
                                    <p><strong>Requirements:</strong> {event.requirements}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default EventListingPage;