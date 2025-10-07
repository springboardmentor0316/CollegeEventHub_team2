
import express from "express";
import { 
  createReview, 
  getEventReviews, 
  getUserReviewForEvent,
  canUserReview,
  getUserReviews,
  updateReview,
  deleteReview,
  // Add these new admin functions
  getAllReviewsForAdmin,
  deleteReviewByAdmin,
  toggleReviewVisibility,
  getReviewStatistics,
} from "../controllers/reviewController.js";
import userAuth from "../middleware/userAuth.js";
// Make sure you have adminAuth middleware, if not use userAuth for now
// import adminAuth from "../middleware/adminAuth.js"; 

const router = express.Router();

// Public route - get reviews for an event
router.get("/event/:eventId", getEventReviews);

// Protected user routes
router.post("/event/:eventId", userAuth, createReview);
router.get("/event/:eventId/my-review", userAuth, getUserReviewForEvent);
router.get("/event/:eventId/can-review", userAuth, canUserReview);
router.get('/my-reviews', userAuth, getUserReviews);
router.put('/:reviewId', userAuth, updateReview);
router.delete('/:reviewId', userAuth, deleteReview);

// Admin routes - if you don't have adminAuth, use userAuth for now
router.get('/admin/all-reviews', userAuth,  getAllReviewsForAdmin);
router.delete('/admin/:reviewId', userAuth,  deleteReviewByAdmin);
router.put('/admin/:reviewId/visibility', userAuth,  toggleReviewVisibility);
router.get('/admin/statistics', userAuth,  getReviewStatistics);



export default router;