import React from 'react';
import Header from './Header'; // Re-use the main header
import './CreateEventPage.css';

const CreateEventPage = () => {
    // In a real app, you would use useState here to manage form inputs

    return (
        <>
            <Header />
            <div className="create-event-container">
                <div className="form-header">
                    <h2><span className="form-icon">➕</span> Create New Event</h2>
                    <p>Fill in the details to create a new campus event</p>
                </div>

                <form className="create-event-form">
                    <div className="form-section">
                        <h3>Basic Information</h3>
                        <div className="form-group">
                            <label htmlFor="eventTitle">Event Title *</label>
                            <input type="text" id="eventTitle" placeholder="Enter event title" />
                        </div>
                        <div className="form-group">
                            <label htmlFor="eventDescription">Description *</label>
                            <textarea id="eventDescription" placeholder="Detailed event description" rows="4"></textarea>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="eventCategory">Category *</label>
                                <select id="eventCategory">
                                    <option>Select category</option>
                                    <option>Technology</option>
                                    <option>Arts</option>
                                    <option>Career</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="eventCapacity">Capacity *</label>
                                <input type="number" id="eventCapacity" placeholder="Maximum attendees" />
                            </div>
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>Date & Time</h3>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="startDate">Start Date *</label>
                                <input type="date" id="startDate" />
                            </div>
                             <div className="form-group">
                                <label htmlFor="endDate">End Date *</label>
                                <input type="date" id="endDate" />
                            </div>
                        </div>
                         <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="startTime">Start Time *</label>
                                <input type="time" id="startTime" />
                            </div>
                             <div className="form-group">
                                <label htmlFor="endTime">End Time *</label>
                                <input type="time" id="endTime" />
                            </div>
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>Location</h3>
                         <div className="form-group">
                            <label htmlFor="eventVenue">Venue *</label>
                            <input type="text" id="eventVenue" placeholder="Event location" />
                        </div>
                    </div>
                    
                    <div className="form-section">
                        <h3>Additional Options</h3>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="eventPrice">Price (optional)</label>
                                <input type="text" id="eventPrice" defaultValue="0.00" />
                            </div>
                             <div className="form-group">
                                <label htmlFor="regDeadline">Registration Deadline</label>
                                <input type="date" id="regDeadline" />
                            </div>
                        </div>
                        <div className="form-group">
                            <label htmlFor="eventImage">Event Image URL</label>
                            <input type="url" id="eventImage" placeholder="https://example.com/image.jpg" />
                        </div>
                         <div className="form-group">
                            <label htmlFor="eventRequirements">Requirements/Notes</label>
                            <textarea id="eventRequirements" placeholder="Any special requirements or notes for attendees" rows="3"></textarea>
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>Tags</h3>
                        <div className="tags-input-container">
                            <input type="text" placeholder="Add a tag" />
                            <button type="button">+</button>
                        </div>
                    </div>
                    
                    <div className="form-actions">
                        <button type="button" className="btn-secondary">Cancel</button>
                        <div className="action-group-right">
                            <button type="button" className="btn-secondary">📄 Save as Draft</button>
                            <button type="submit" className="btn-primary">🚀 Publish Event</button>
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
};

export default CreateEventPage;