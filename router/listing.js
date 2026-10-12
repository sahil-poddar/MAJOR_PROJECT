const express = require("express");
const router = express.Router();

const wrapAsync = require("../utils/wrapAsync.js");

const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");

const listingController = require("../controllers/listing.js");

const multer = require("multer");
const { storage } = require("../cloudconfig.js");

const upload = multer({ storage });

// ==========================================
// ALL LISTINGS
// ==========================================

router
  .route("/")
  .get(wrapAsync(listingController.index))
  .post(
    isLoggedIn,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.create),
  );

// ==========================================
// NEW LISTING
// ==========================================

router.route("/new").get(isLoggedIn, (req, res) => {
  res.render("listings/new.ejs");
});

// ==========================================
// SHOW / UPDATE / DELETE LISTING
// ==========================================

router
  .route("/:id")
  .get(wrapAsync(listingController.show))
  .put(
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.update),
  )
  .delete(isLoggedIn, isOwner, wrapAsync(listingController.delete));

// ==========================================
// EDIT LISTING
// ==========================================

router
  .route("/:id/edit")
  .get(isLoggedIn, isOwner, wrapAsync(listingController.edit));

module.exports = router;
