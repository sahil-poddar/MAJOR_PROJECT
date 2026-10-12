const express = require("express");
const router = express.Router({ mergeParams: true });

const Review = require("../models/reviews.js");

const wrapAsync = require("../utils/wrapAsync.js");

const {
  isLoggedIn,
  reviewAuthor,
  validateReview,
} = require("../middleware.js");

const reviewController = require("../controllers/review.js");

// ==========================================
// POST REVIEW
// POST /listings/:id/reviews
// ==========================================

router.post(
  "/",
  isLoggedIn,
  validateReview,
  wrapAsync(reviewController.review),
);

// ==========================================
// DELETE REVIEW
// DELETE /listings/:id/reviews/:reviewId
// ==========================================

router.delete(
  "/:reviewId",
  isLoggedIn,
  reviewAuthor,
  wrapAsync(reviewController.deleteReview),
);

module.exports = router;
