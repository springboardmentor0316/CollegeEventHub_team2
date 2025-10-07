
import Review from "../models/reviewModel.js";
import Registration from "../models/registrationModel.js";
import Event from "../models/eventModel.js";

export const createReview = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { rating, comment, wouldRecommend = true, anonymous = false } = req.body;

    // Check if user has an approved registration for this event
    const registration = await Registration.findOne({
      event: eventId,
      user: req.user.id,
      status: 'approved'
    });

    if (!registration) {
      return res.status(403).json({ 
        success: false, 
        message: "You can only review events you've attended with approved registration" 
      });
    }

    // Check if user already reviewed this event
    const existingReview = await Review.findOne({
      event: eventId,
      user: req.user.id
    });

    if (existingReview) {
      return res.status(400).json({ 
        success: false, 
        message: "You have already reviewed this event" 
      });
    }

    // Create review
    const review = new Review({
      event: eventId,
      user: req.user.id,
      registration: registration._id,
      rating,
      comment,
      wouldRecommend,
      anonymous,
      isVisible: true // Ensure new reviews are visible by default
    });

    await review.save();
    
    // Update registration to mark review given
    registration.hasGivenReview = true;
    await registration.save();
    
    // Populate for response
    await review.populate('user', 'name');

    res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      review
    });

  } catch (err) {
    console.error("Error creating review:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// FIXED: Added isVisible: true filter to only show visible reviews
export const getEventReviews = async (req, res) => {
  try {
    const { eventId } = req.params;
    
    // FIX: Only get reviews that are visible
    const reviews = await Review.find({ 
      event: eventId,
      isVisible: true 
    })
      .populate('user', 'name')
      .sort({ createdAt: -1 });

    // Calculate statistics from visible reviews
    const visibleReviews = reviews; // All reviews are already visible due to query filter
    const averageRating = visibleReviews.length > 0 
      ? visibleReviews.reduce((sum, review) => sum + review.rating, 0) / visibleReviews.length
      : 0;

    const ratingDistribution = {
      5: visibleReviews.filter(r => r.rating === 5).length,
      4: visibleReviews.filter(r => r.rating === 4).length,
      3: visibleReviews.filter(r => r.rating === 3).length,
      2: visibleReviews.filter(r => r.rating === 2).length,
      1: visibleReviews.filter(r => r.rating === 1).length
    };

    res.json({
      success: true,
      reviews: visibleReviews,
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews: visibleReviews.length,
      ratingDistribution
    });

  } catch (err) {
    console.error("Error getting event reviews:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getUserReviewForEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    const review = await Review.findOne({
      event: eventId,
      user: req.user.id
    }).populate('user', 'name');

    if (review) {
      res.json({ success: true, review });
    } else {
      res.json({ success: true, review: null });
    }

  } catch (err) {
    console.error("Error getting user review for event:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const canUserReview = async (req, res) => {
  try {
    const { eventId } = req.params;

    // Check if user has approved registration and hasn't reviewed yet
    const registration = await Registration.findOne({
      event: eventId,
      user: req.user.id,
      status: 'approved'
    });

    // Check if user already reviewed
    const existingReview = await Review.findOne({
      event: eventId,
      user: req.user.id
    });

    const canReview = !!registration && !existingReview;

    res.json({
      success: true,
      canReview,
      registrationId: registration?._id,
      hasExistingReview: !!existingReview
    });

  } catch (err) {
    console.error("Error checking if user can review:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get user's reviews
export const getUserReviews = async (req, res) => {
    try {
      const reviews = await Review.find({ user: req.user.id })
        .populate('event', 'title startDate venue')
        .sort({ createdAt: -1 });
  
      res.json({
        success: true,
        reviews
      });
  
    } catch (err) {
      console.error("Error getting user reviews:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  };
  
  // Update review
  export const updateReview = async (req, res) => {
    try {
      const { reviewId } = req.params;
      const { rating, comment, wouldRecommend, anonymous } = req.body;
  
      const review = await Review.findOne({
        _id: reviewId,
        user: req.user.id
      });
  
      if (!review) {
        return res.status(404).json({ 
          success: false, 
          message: "Review not found" 
        });
      }
  
      // Update review fields
      review.rating = rating;
      review.comment = comment;
      review.wouldRecommend = wouldRecommend !== undefined ? wouldRecommend : true;
      review.anonymous = anonymous !== undefined ? anonymous : false;
  
      await review.save();
      await review.populate('user', 'name');
  
      res.json({
        success: true,
        message: "Review updated successfully",
        review
      });
  
    } catch (err) {
      console.error("Error updating review:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  };
  
  // Delete review
  export const deleteReview = async (req, res) => {
    try {
      const { reviewId } = req.params;
  
      const review = await Review.findOneAndDelete({
        _id: reviewId,
        user: req.user.id
      });
  
      if (!review) {
        return res.status(404).json({ 
          success: false, 
          message: "Review not found" 
        });
      }
  
      // Update registration to allow reviewing again
      await Registration.findByIdAndUpdate(review.registration, {
        hasGivenReview: false
      });
  
      res.json({
        success: true,
        message: "Review deleted successfully"
      });
  
    } catch (err) {
      console.error("Error deleting review:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  };

  // Admin: Get all reviews across all events
export const getAllReviewsForAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', eventId = '', userId = '' } = req.query;
    
    // Build filter object
    let filter = {};
    
    if (search) {
      filter.$or = [
        { comment: { $regex: search, $options: 'i' } },
        { 'user.name': { $regex: search, $options: 'i' } },
        { 'event.title': { $regex: search, $options: 'i' } }
      ];
    }
    
    if (eventId) {
      filter.event = eventId;
    }
    
    if (userId) {
      filter.user = userId;
    }

    const reviews = await Review.find(filter)
      .populate('user', 'name email')
      .populate('event', 'title')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Review.countDocuments(filter);

    // Calculate overall statistics
    const totalReviews = await Review.countDocuments();
    const averageRating = await Review.aggregate([
      { $group: { _id: null, avg: { $avg: '$rating' } } }
    ]);
    
    const ratingDistribution = await Review.aggregate([
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $sort: { _id: -1 } }
    ]);

    res.json({
      success: true,
      reviews,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
      statistics: {
        totalReviews,
        averageRating: averageRating[0]?.avg ? Math.round(averageRating[0].avg * 10) / 10 : 0,
        ratingDistribution: ratingDistribution.reduce((acc, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {})
      }
    });

  } catch (err) {
    console.error("Error getting reviews for admin:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Admin: Delete any review
export const deleteReviewByAdmin = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findByIdAndDelete(reviewId);

    if (!review) {
      return res.status(404).json({ 
        success: false, 
        message: "Review not found" 
      });
    }

    // Update registration to allow reviewing again
    await Registration.findByIdAndUpdate(review.registration, {
      hasGivenReview: false
    });

    res.json({
      success: true,
      message: "Review deleted successfully"
    });

  } catch (err) {
    console.error("Error deleting review by admin:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Admin: Toggle review visibility
export const toggleReviewVisibility = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { isVisible } = req.body;

    const review = await Review.findByIdAndUpdate(
      reviewId,
      { isVisible },
      { new: true }
    ).populate('user', 'name').populate('event', 'title');

    if (!review) {
      return res.status(404).json({ 
        success: false, 
        message: "Review not found" 
      });
    }

    res.json({
      success: true,
      message: `Review ${isVisible ? 'made visible' : 'hidden'} successfully`,
      review
    });

  } catch (err) {
    console.error("Error toggling review visibility:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Admin: Get review statistics
export const getReviewStatistics = async (req, res) => {
  try {
    const totalReviews = await Review.countDocuments();
    const reviewsWithComments = await Review.countDocuments({ comment: { $ne: '' } });
    const averageRating = await Review.aggregate([
      { $group: { _id: null, avg: { $avg: '$rating' } } }
    ]);
    
    const ratingDistribution = await Review.aggregate([
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $sort: { _id: -1 } }
    ]);

    const recentReviews = await Review.find()
      .populate('user', 'name')
      .populate('event', 'title')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      statistics: {
        totalReviews,
        reviewsWithComments,
        averageRating: averageRating[0]?.avg ? Math.round(averageRating[0].avg * 10) / 10 : 0,
        ratingDistribution: ratingDistribution.reduce((acc, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {}),
        recentReviews
      }
    });

  } catch (err) {
    console.error("Error getting review statistics:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};