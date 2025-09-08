
import React, { useEffect, useState } from "react";
import API from "../../axios";
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import "./MyEventsTab.css";

const MyEventsTab = ({ newEvent, setNewEvent, setShowCreateForm, setEditingEvent }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchEvents();
  }, [user]);

  const fetchEvents = async () => {
    console.log("📡 Fetching events...");
    try {
      const res = await API.post("/api/events/my_events", {
        userId: user.id
      });
      console.log("✅ Response:", res);
      setEvents(res.data?.events || []);
    } catch (error) {
      console.error("❌ Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (newEvent) {
      setEvents((prev) => [newEvent, ...prev]);
      setNewEvent(null);
    }
  }, [newEvent, setNewEvent]);

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

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        await API.delete(`/api/events/delete_event/${eventId}`);
        setEvents(events.filter(event => event._id !== eventId));
        toast.success("Event deleted successfully");
      } catch (error) {
        console.error("Error deleting event:", error);
        toast.error("Failed to delete event");
      }
    }
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setShowCreateForm(true);
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="event-listing-container">
      <div className="event-listing-header">
        <h1>My Events</h1>
        <p>Manage and track your created events</p>
      </div>

      <p className="results-count">{events.length} events found</p>

      <div className="event-listing-grid">
        {events.length === 0 ? (
          <p>No events created yet.</p>
        ) : (
          events.map(event => (
            <div key={event._id} className="event-card-large">
              {event.image ? (
                <img 
                  src={event.image} 
                  alt={event.title} 
                  className="event-image"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              ) : null}
              <div className="event-image-placeholder" style={{display: event.image ? 'none' : 'block'}}></div>
              <div className="event-content">
                <div className="card-header">
                  <span className="event-category">{event.category}</span>
                  <div className="card-actions">
                    <span className={`status-indicator ${event.published ? 'published' : 'draft'}`}>
                      {event.published ? 'Published' : 'Draft'}
                    </span>
                    <div className="action-buttons">
                      <button 
                        className="edit-btn"
                        onClick={() => handleEditEvent(event)}
                        title="Edit event"
                      >
                        ✏️
                      </button>
                      <button 
                        className="delete-btn"
                        onClick={() => handleDeleteEvent(event._id)}
                        title="Delete event"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
                <h2>{event.title}</h2>
                <p className="card-description">{event.description}</p>
                <p className="card-info">📅 {formatDate(event.startDate)} {event.endDate && event.endDate !== event.startDate ? `to ${formatDate(event.endDate)}` : ''}</p>
                <p className="card-info">🕒 {getTimeRange(event.startTime, event.endTime)}</p>
                <p className="card-info">📍 {event.venue}</p>
                <div className="event-meta">
                  <span>👥 Capacity: {event.capacity}</span>
                  <span>💰 {event.price > 0 ? `$${event.price}` : 'Free'}</span>
                </div>
                {event.tags && event.tags.length > 0 && (
                  <div className="tags">
                    {event.tags.map((tag, index) => 
                      <span key={index} className="tag">{tag}</span>
                    )}
                  </div>
                )}
                <div className="card-footer">
                  <p><strong>Requirements:</strong> {event.requirements || 'None'}</p>
                  <p><strong>Registration Deadline:</strong> {event.regDeadline ? formatDate(event.regDeadline) : 'None'}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyEventsTab;