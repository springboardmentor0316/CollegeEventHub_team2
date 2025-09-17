
import React, { useState, useEffect } from 'react';
import API from '../axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const MyEvents = () => {
    const [registeredEvents, setRegisteredEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        fetchRegisteredEvents();
    }, []);

    const fetchRegisteredEvents = async () => {
        try {
            // This endpoint would need to be created in your backend
            const response = await API.get('/api/events/my_registrations');
            setRegisteredEvents(response.data.registrations || []);
        } catch (error) {
            console.error("Error fetching registered events:", error);
            toast.error("Error loading your events");
        } finally {
            setLoading(false);
        }
    };

    const handleCancelRegistration = async (eventId, ticketId) => {
        if (window.confirm("Are you sure you want to cancel your registration?")) {
            try {
                // This endpoint would need to be created in your backend
                await API.delete(`/api/events/cancel_registration/${eventId}/${ticketId}`);
                toast.success("Registration cancelled successfully");
                // Remove the event from the list
                setRegisteredEvents(prev => prev.filter(event => event.ticket !== ticketId));
            } catch (error) {
                console.error("Error cancelling registration:", error);
                toast.error("Error cancelling registration");
            }
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

    if (loading) return <div className="loading">Loading your events...</div>;

    return (
        <div className="my-events">
            <div className="list-header">
                <h2>My Registered Events</h2>
                <span>{registeredEvents.length} events</span>
            </div>
            
            {registeredEvents.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">🎫</div>
                    <h2>No registered events yet</h2>
                    <p>Explore events and register to see them here!</p>
                </div>
            ) : (
                <ul className="event-list">
                    {registeredEvents.map(event => (
                        <li key={event.ticket} className="event-list-item">
                            <div className="event-info-container">
                                <h3>{event.title}</h3>
                                <p className="event-info">
                                    📅 {formatDate(event.startDate)} at {formatTime(event.startTime)}
                                </p>
                                <p className="event-info">📍 {event.venue}</p>
                                <p className="event-ticket">
                                    <span className="status-confirmed">Confirmed</span> 
                                    Ticket: {event.ticket}
                                </p>
                            </div>
                            <div className="list-item-actions">
                                <button className="btn-secondary">View Details</button>
                                <button 
                                    className="btn-tertiary"
                                    onClick={() => handleCancelRegistration(event._id, event.ticket)}
                                >
                                    Cancel Registration
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default MyEvents;