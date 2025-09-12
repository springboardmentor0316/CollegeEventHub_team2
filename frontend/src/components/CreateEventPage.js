

import React, { useState, useEffect } from 'react';
import Header from './Header';
import './CreateEventPage.css';
import API from '../axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const CreateEventPage = ({ setShowCreateForm, setNewEvent, editingEvent, setEditingEvent, setActiveTab }) => {
  const { user } = useAuth();
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialFormState = {
    title: '',
    description: '',
    category: '',
    capacity: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    venue: '',
    price: 0,
    regDeadline: '',
    image: '',
    requirements: '',
    tags: [],
  };
  
  const [formData, setFormData] = useState(initialFormState);

  // Prefill form if editing
  useEffect(() => {
    if (editingEvent) {
      setFormData({
        title: editingEvent.title || '',
        description: editingEvent.description || '',
        category: editingEvent.category || '',
        capacity: editingEvent.capacity || '',
        startDate: editingEvent.startDate ? editingEvent.startDate.split('T')[0] : '',
        endDate: editingEvent.endDate ? editingEvent.endDate.split('T')[0] : '',
        startTime: editingEvent.startTime || '',
        endTime: editingEvent.endTime || '',
        venue: editingEvent.venue || '',
        price: editingEvent.price || 0,
        regDeadline: editingEvent.regDeadline ? editingEvent.regDeadline.split('T')[0] : '',
        image: editingEvent.image || '',
        requirements: editingEvent.requirements || '',
        tags: editingEvent.tags || [],
      });
    } else {
      // Reset form when creating a new event
      resetForm();
    }
  }, [editingEvent]);

  // Function to completely reset the form
  const resetForm = () => {
    setFormData(initialFormState);
    setTagInput('');
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const addTag = () => {
    if (tagInput.trim() !== '' && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const removeTag = (tag) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((t) => t !== tag),
    });
  };

  const handleSubmit = async (e, draft = false) => {
    e.preventDefault();

    if (isSubmitting) return;
    
    setIsSubmitting(true);

    try {
      if (!user) {
        toast.error('You must be logged in to create an event');
        return;
      }
      
      let res;
      if (editingEvent) {
        // Update existing event
        res = await API.put(`/api/events/update_event/${editingEvent._id}`, {
          ...formData,
          draft
        });
        toast.success(draft ? 'Draft updated!' : 'Event updated!');
      } else {
        // Create new event
        res = await API.post('/api/events/create_event', {
          ...formData,
          draft
        });
        toast.success(draft ? 'Draft saved!' : 'Event published!');
      }

      // Update parent state so MyEventsTab can see new/updated event
      if (setNewEvent) {
        setNewEvent(res.data.event);
      }

      // Reset the form
      resetForm();
      
      // Close form and redirect to My Events tab
      setShowCreateForm(false);
      setEditingEvent(null);
      
      // Force a redirect by using a state update that will trigger a re-render
      setTimeout(() => {
        setActiveTab('my-events');
      }, 0);
    } catch (err) {
      console.error(err);
      // toast.error(`Error ${editingEvent ? 'updating' : 'creating'} event`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    // Reset the form before closing
    resetForm();
    setShowCreateForm(false);
    setEditingEvent(null);
    setActiveTab('my-events');
  };

  return (
    <>
      <Header />
      <div className="create-event-container">
        <div className="form-header">
          <h2>
            {editingEvent ? 'Edit Event' : 'Create New Event'}
          </h2>
          <p>{editingEvent ? 'Update the details of your event' : 'Fill in the details to create a new campus event'}</p>
        </div>

        <form className="create-event-form" onSubmit={(e) => handleSubmit(e, false)}>
          {/* Title & Description */}
          <div className="form-group">
            <label htmlFor="title">Event Title *</label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter event title"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Detailed event description"
              rows="4"
              required
            ></textarea>
          </div>

          {/* Category & Capacity */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">Category *</label>
              <select id="category" value={formData.category} onChange={handleChange} required>
                <option value="">Select category</option>
                <option value="Technology">Technology</option>
                <option value="Arts">Arts</option>
                <option value="Career">Career</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="capacity">Capacity *</label>
              <input
                type="number"
                id="capacity"
                value={formData.capacity}
                onChange={handleChange}
                placeholder="Maximum attendees"
                required
              />
            </div>
          </div>

          {/* Dates & Times */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startDate">Start Date *</label>
              <input type="date" id="startDate" value={formData.startDate} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="endDate">End Date *</label>
              <input type="date" id="endDate" value={formData.endDate} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startTime">Start Time *</label>
              <input type="time" id="startTime" value={formData.startTime} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="endTime">End Time *</label>
              <input type="time" id="endTime" value={formData.endTime} onChange={handleChange} required />
            </div>
          </div>

          {/* Venue */}
          <div className="form-group">
            <label htmlFor="venue">Venue *</label>
            <input
              type="text"
              id="venue"
              value={formData.venue}
              onChange={handleChange}
              placeholder="Event location"
              required
            />
          </div>

          {/* Price, Deadline, Image, Requirements */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="price">Price (optional)</label>
              <input
                type="number"
                id="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="Enter event price"
              />
            </div>
            <div className="form-group">
              <label htmlFor="regDeadline">Registration Deadline</label>
              <input type="date" id="regDeadline" value={formData.regDeadline} onChange={handleChange} />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="image">Event Image URL</label>
            <input
              type="url"
              id="image"
              value={formData.image}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="form-group">
            <label htmlFor="requirements">Requirements/Notes</label>
            <textarea
              id="requirements"
              value={formData.requirements}
              onChange={handleChange}
              placeholder="Any special requirements or notes"
              rows="3"
            ></textarea>
          </div>

          {/* Tags */}
          <div className="form-group">
            <label>Tags</label>
            <div className="tags-input-container">
              {formData.tags.map((tag, index) => (
                <span key={index} className="tag">
                  {tag}{' '}
                  <button type="button" onClick={() => removeTag(tag)}>
                    x
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Add a tag"
              />
              <button type="button" onClick={addTag}>
                +
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={handleCancel} disabled={isSubmitting}>
              Cancel
            </button>
            <div className="action-group-right">
              <button 
                type="button" 
                className="btn-secondary" 
                onClick={(e) => handleSubmit(e, true)} 
                disabled={isSubmitting}
              >
                {isSubmitting ? '⏳' : '📄'} {editingEvent ? 'Update Draft' : 'Save as Draft'}
              </button>
              <button type="submit" className="btn-primary" disabled={isSubmitting}>
                {isSubmitting ? '⏳' : '🚀'} {editingEvent ? 'Update Event' : 'Publish Event'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default CreateEventPage;