const Listing = require("./models/listing.js");
const Review = require("./models/reviews.js");

const { listingSchema, reviewSchema } = require("./schema.js");
const ExpressError = require("./utils/ExpressError.js");

// ==========================================
// VALIDATE LISTING
// ==========================================

const validateListing = (req, res, next) => {
  const { error } = listingSchema.validate(req.body);

  if (error) {
    const errMsg = error.details.map((el) => el.message).join(", ");

    throw new ExpressError(400, errMsg);
  }

  next();
};

// ==========================================
// VALIDATE REVIEW
// ==========================================

const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);

  if (error) {
    const errMsg = error.details.map((el) => el.message).join(", ");

    throw new ExpressError(400, errMsg);
  }

  next();
};

// ==========================================
// LOGIN REQUIRED
// ==========================================

const isLoggedIn = (req, res, next) => {
  console.log("Is authenticated:", req.isAuthenticated());

  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl;

    req.flash("error", "You must be logged in!");

    return res.redirect("/users/login");
  }

  next();
};

// ==========================================
// OWNER REQUIRED
// ==========================================

const isOwner = async (req, res, next) => {
  const { id } = req.params;

  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }

  if (!listing.owner || !listing.owner.equals(req.user._id)) {
    req.flash("error", "You are not the owner of this listing!");
    return res.redirect(`/listings/${id}`);
  }

  next();
};

// ==========================================
// SAVE REDIRECT URL
// ==========================================

const saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }

  next();
};

// ==========================================
// REVIEW AUTHOR REQUIRED
// ==========================================

const reviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;

  const review = await Review.findById(reviewId);

  if (!review) {
    req.flash("error", "Review not found!");
    return res.redirect(`/listings/${id}`);
  }

  if (!review.author || !review.author.equals(req.user._id)) {
    req.flash("error", "You are not the author of this review!");
    return res.redirect(`/listings/${id}`);
  }

  next();
};

// ==========================================
// EXPORT
// ==========================================

module.exports = {
  validateListing,
  validateReview,
  isLoggedIn,
  isOwner,
  reviewAuthor,
  saveRedirectUrl,
};
