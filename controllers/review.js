
const Review = require("../models/reviews.js");
const Listing = require("../models/listing.js");

// ==========================================
// CREATE REVIEW
// ==========================================

module.exports.review = async (req, res) => {
  const { id } = req.params;

  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing not found.");
    return res.redirect("/listings");
  }

  const newReview = new Review(req.body.review);

  // Set logged-in user as review author
  newReview.author = req.user._id;

  // Add review to listing
  listing.reviews.push(newReview);

  // Save review and listing
  await newReview.save();
  await listing.save();

  req.flash("success", "Review added successfully!");

  res.redirect(`/listings/${listing._id}`);
};

// ==========================================
// DELETE REVIEW
// ==========================================

module.exports.deleteReview = async (req, res) => {
  const { id, reviewId } = req.params;

  // Remove review ID from listing
  await Listing.findByIdAndUpdate(id, {
    $pull: {
      reviews: reviewId,
    },
  });

  // Delete review document
  await Review.findByIdAndDelete(reviewId);

  req.flash("success", "Review deleted successfully!");

  res.redirect(`/listings/${id}`);
};
