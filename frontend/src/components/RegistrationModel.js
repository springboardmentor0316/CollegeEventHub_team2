
import React, { useState } from 'react';
import API from '../axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import './RegistrationModel.css';

const RegistrationModal = ({ event, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        phoneNumber: '',
        collegeId: '',
        department: '',
        year: '',
        notes: '',
        numberOfAttendees: 1 // New field
    });
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ 
            ...formData, 
            [name]: name === 'numberOfAttendees' ? parseInt(value) || 1 : value 
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Validate number of attendees
        const availableSlots = event.capacity - (event.registeredCount || 0);
        if (formData.numberOfAttendees > availableSlots) {
            toast.error(`Only ${availableSlots} slots available`);
            setLoading(false);
            return;
        }

        try {
            const response = await API.post(`/api/registrations/register/${event._id}`, formData);
            
            if (response.data.success) {
                // toast.success("Registration submitted successfully!");
                onSuccess(response.data.registration);
            } else {
                toast.error(response.data.message || "Registration failed");
            }
        } catch (error) {
            console.error("Registration error:", error);
            const errorMessage = error.response?.data?.message || "Registration failed. Please try again.";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    if (!event) return null;

    const availableSlots = event.capacity - (event.registeredCount || 0);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="registration-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Register for Event</h2>
                    <button className="close-button" onClick={onClose}>×</button>
                </div>
                
                <div className="event-info">
                    <h3>{event.title}</h3>
                    <p><strong>Date:</strong> {new Date(event.startDate).toLocaleDateString()}</p>
                    <p><strong>Time:</strong> {event.startTime} - {event.endTime}</p>
                    <p><strong>Venue:</strong> {event.venue}</p>
                    <p><strong>Available Slots:</strong> {availableSlots}/{event.capacity}</p>
                </div>

                <form onSubmit={handleSubmit} className="registration-form">
                    {/* New Number of Attendees Field */}
                    <div className="form-group">
                        <label htmlFor="numberOfAttendees">Number of Attendees *</label>
                        <input
                            type="number"
                            id="numberOfAttendees"
                            name="numberOfAttendees"
                            value={formData.numberOfAttendees}
                            onChange={handleChange}
                            required
                            min="1"
                            max={Math.min(availableSlots, 10)} // Limit to 10 max or available slots
                            placeholder="How many people are attending?"
                        />
                        <small>Including yourself and friends</small>
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="phoneNumber">Phone Number *</label>
                        <input
                            type="tel"
                            id="phoneNumber"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            required
                            placeholder="Enter your phone number"
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="collegeId">College ID *</label>
                        <input
                            type="text"
                            id="collegeId"
                            name="collegeId"
                            value={formData.collegeId}
                            onChange={handleChange}
                            required
                            placeholder="Enter your college ID"
                        />
                    </div>
                    
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="department">Department</label>
                            <select 
                                id="department" 
                                name="department" 
                                value={formData.department} 
                                onChange={handleChange}
                            >
                                <option value="">Select Department</option>
                                <option value="Computer Science">Computer Science</option>
                                <option value="Electrical Engineering">Electrical Engineering</option>
                                <option value="Mechanical Engineering">Mechanical Engineering</option>
                                <option value="Civil Engineering">Civil Engineering</option>
                                <option value="Business Administration">Business Administration</option>
                                <option value="Arts">Arts</option>
                                <option value="Science">Science</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="year">Academic Year</label>
                            <select 
                                id="year" 
                                name="year" 
                                value={formData.year} 
                                onChange={handleChange}
                            >
                                <option value="">Select Year</option>
                                <option value="1st Year">1st Year</option>
                                <option value="2nd Year">2nd Year</option>
                                <option value="3rd Year">3rd Year</option>
                                <option value="4th Year">4th Year</option>
                                <option value="Postgraduate">Postgraduate</option>
                            </select>
                        </div>
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="notes">Additional Notes</label>
                        <textarea
                            id="notes"
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            rows="3"
                            placeholder="Any special requirements, questions, or additional information..."
                        />
                    </div>
                    
                    <div className="form-actions">
                        <button 
                            type="button" 
                            className="btn-cancel" 
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="btn-submit" 
                            disabled={loading || availableSlots === 0}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner"></span>
                                    Registering...
                                </>
                            ) : (
                                `Register ${formData.numberOfAttendees > 1 ? `${formData.numberOfAttendees} People` : 'Now'}`
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RegistrationModal;

