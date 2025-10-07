
import React, { useState, useEffect } from 'react';
import API from '../axios';
import { toast } from 'react-toastify';
import './ReviewModal.css';

const ReviewModal = ({ event, existingReview, onClose, onSuccess, onDelete }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (existingReview) {
            setRating(existingReview.rating);
            setComment(existingReview.comment || '');
            setIsEditing(true);
        } else {
            setRating(0);
            setComment('');
            setIsEditing(false);
        }
    }, [existingReview]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!rating) {
            toast.error('Please select a rating');
            return;
        }

        setLoading(true);
        try {
            let response;
            
            if (isEditing && existingReview) {
                response = await API.put(`/api/reviews/${existingReview._id}`, {
                    rating,
                    comment: comment.trim()
                });
            } else {
                response = await API.post(`/api/reviews/event/${event._id}`, {
                    rating,
                    comment: comment.trim()
                });
            }
            
            onSuccess(response.data.review);
        } catch (error) {
            console.error('Error submitting review:', error);
            if (error.response?.status === 400) {
                toast.error('You have already reviewed this event');
            } else if (error.response?.status === 403) {
                toast.error('Only attendees can review events');
            } else {
                toast.error('Error submitting review');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!existingReview) return;
        
        if (!window.confirm('Delete your review?')) {
            return;
        }

        setLoading(true);
        try {
            await API.delete(`/api/reviews/${existingReview._id}`);
            toast.success('Review deleted!');
            onDelete();
        } catch (error) {
            console.error('Error deleting review:', error);
            toast.error('Error deleting review');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="review-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="header-content">
                        <h2>{isEditing ? 'Edit Review' : 'Write Review'}</h2>
                        <p className="event-name">{event.title}</p>
                    </div>
                    <button className="close-button" onClick={onClose}>×</button>
                </div>

                <form onSubmit={handleSubmit} className="review-form">
                    <div className="form-section">
                        <label>Your Rating</label>
                        <div className="star-rating">
                            {[1, 2, 3, 4, 5].map(star => (
                                <button
                                    key={star}
                                    type="button"
                                    className={`star ${star <= rating ? 'active' : ''}`}
                                    onClick={() => setRating(star)}
                                >
                                    ★
                                </button>
                            ))}
                        </div>
                        <div className="rating-label">
                            {rating === 5 && 'Excellent'}
                            {rating === 4 && 'Very Good'}
                            {rating === 3 && 'Good'}
                            {rating === 2 && 'Fair'}
                            {rating === 1 && 'Poor'}
                            {rating === 0 && 'Select rating'}
                        </div>
                    </div>

                    <div className="form-section">
                        <label>Your Review</label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Share your experience..."
                            rows="3"
                            maxLength={300}
                        />
                        <div className="char-count">{comment.length}/300</div>
                    </div>

                    <div className="modal-actions">
                        <div className="actions-left">
                            {isEditing && (
                                <button 
                                    type="button" 
                                    className="btn-delete"
                                    onClick={handleDelete}
                                >
                                    Delete
                                </button>
                            )}
                        </div>
                        <div className="actions-right">
                            <button 
                                type="button" 
                                className="btn-cancel"
                                onClick={onClose}
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                className="btn-submit"
                                disabled={!rating || loading}
                            >
                                {loading ? 'Saving...' : isEditing ? 'Update' : 'Submit'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReviewModal;