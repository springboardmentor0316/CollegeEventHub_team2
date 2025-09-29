
import React, { useState, useEffect } from 'react';
import API from '../axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import './MyEvents.css';

const MyEvents = () => {
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            fetchMyRegistrations();
        }
    }, [user]);

    const fetchMyRegistrations = async () => {
        try {
            const response = await API.get('/api/registrations/my-registrations');
            setRegistrations(response.data.registrations || []);
        } catch (error) {
            console.error("Error fetching registrations:", error);
            toast.error("Error loading your events");
        } finally {
            setLoading(false);
        }
    };

    const handleCancelRegistration = async (registrationId) => {
        if (window.confirm("Are you sure you want to cancel your registration?")) {
            try {
                await API.put(`/api/registrations/cancel/${registrationId}`);
                setRegistrations(prev => prev.filter(reg => reg._id !== registrationId));
                toast.success("Registration cancelled successfully");
            } catch (error) {
                console.error("Error cancelling registration:", error);
                toast.error("Error cancelling registration");
            }
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
        });
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
        fetchMyRegistrations();
        toast.info("Refreshing your events...");
    };

    if (loading) {
        return (
            <div className="my-events">
                <div className="loading">Loading your events...</div>
            </div>
        );
    }

    return (
        <div className="my-events">
            {/* Header Section */}
            <div className="my-events-header">
                <div className="header-content">
                    <h1>My Registered Events</h1>
                    <p>Manage your event registrations and approvals</p>
                </div>
                <button onClick={refreshData} className="btn-refresh">
                    🔄 Refresh
                </button>
            </div>

            {/* Stats Cards */}
            <div className="summary-cards">
                <div className="summary-card">
                    <div className="summary-icon">📅</div>
                    <div className="summary-content">
                        <strong>{registrations.length}</strong>
                        <span>Total Registrations</span>
                    </div>
                </div>
                <div className="summary-card">
                    <div className="summary-icon">⏳</div>
                    <div className="summary-content">
                        <strong>{registrations.filter(reg => reg.status === 'pending').length}</strong>
                        <span>Pending Approval</span>
                    </div>
                </div>
                <div className="summary-card">
                    <div className="summary-icon">✅</div>
                    <div className="summary-content">
                        <strong>{registrations.filter(reg => reg.status === 'approved').length}</strong>
                        <span>Approved</span>
                    </div>
                </div>
            </div>

            {/* Events Grid */}
            {registrations.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">🎫</div>
                    <h3>No Registered Events Yet</h3>
                    <p>Explore events and register to see them here!</p>
                    <button onClick={() => window.location.href = '/dashboard'} className="btn-primary">
                        Discover Events
                    </button>
                </div>
            ) : (
                <div className="events-grid compact">
                    {registrations.map(registration => (
                        <div key={registration._id} className="event-card compact">
                            {/* Event Image */}
                            <div className="event-image-container">
                                {registration.event?.image ? (
                                    <img 
                                        src={registration.event.image} 
                                        alt={registration.event.title}
                                        className="event-image"
                                    />
                                ) : (
                                    <div className="event-image-placeholder">
                                        <span>🎉</span>
                                    </div>
                                )}
                                <div className="event-category-tag">
                                    {registration.event?.category || 'General'}
                                </div>
                                <div className="registration-status-overlay">
                                    <span className={`status-badge status-${registration.status}`}>
                                        {registration.status.toUpperCase()}
                                    </span>
                                </div>
                            </div>
                            
                            {/* Event Details */}
                            <div className="event-content">
                                <div className="event-header">
                                    <h3 className="event-title">{registration.event?.title || 'Untitled Event'}</h3>
                                </div>
                                
                                <p className="event-description">
                                    {registration.event?.description || 'No description available.'}
                                </p>
                                
                                <div className="event-details">
                                    <div className="detail-item">
                                        <span className="detail-icon">📅</span>
                                        <span className="detail-text">
                                            {formatDate(registration.event?.startDate)}
                                        </span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-icon">🕒</span>
                                        <span className="detail-text">
                                            {getTimeRange(registration.event?.startTime, registration.event?.endTime)}
                                        </span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-icon">📍</span>
                                        <span className="detail-text">
                                            {registration.event?.venue || 'Location not specified'}
                                        </span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-icon">👥</span>
                                        <span className="detail-text">
                                            {registration.numberOfAttendees || 1} attendee(s)
                                        </span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-icon">📝</span>
                                        <span className="detail-text">
                                            Registered: {formatDate(registration.createdAt)}
                                        </span>
                                    </div>
                                </div>
                                
                                {/* Registration Actions */}
                                <div className="registration-actions">
                                    {registration.status === 'pending' && (
                                        <button 
                                            className="btn-cancel"
                                            onClick={() => handleCancelRegistration(registration._id)}
                                        >
                                            Cancel Registration
                                        </button>
                                    )}
                                    {registration.status === 'approved' && (
                                        <div className="approved-actions">
                                            <button className="btn-secondary">
                                                View Ticket
                                            </button>
                                            <button className="btn-cancel">
                                                Cancel
                                            </button>
                                        </div>
                                    )}
                                    {registration.status === 'rejected' && (
                                        <button className="btn-secondary">
                                            View Reason
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyEvents;