const Listing = require("../models/listing.js");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");

const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

async function geocode(query) {
  const geoData = await geocodingClient
    .forwardGeocode({ query, limit: 1 })
    .send();
  const feature = geoData.body.features[0];
  return feature ? feature.geometry : null;
}

module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
};

module.exports.create = async (req, res) => {
  const { location, country } = req.body.listing;
  const geometry = await geocode(`${location}, ${country}`);

  if (!geometry) {
    req.flash(
      "error",
      "Couldn't find that location. Try a more specific place name.",
    );
    return res.redirect("/listings/new");
  }

  const newListing = new Listing(req.body.listing);
  newListing.geometry = geometry;
  newListing.owner = req.user._id;

  if (req.file) {
    newListing.image = { filename: req.file.filename, url: req.file.path };
  }

  const savedListing = await newListing.save();
  console.log(savedListing);

  req.flash("success", "New listing created!");
  res.redirect(`/listings/${newListing._id}`);
};

module.exports.edit = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "The listing you requested does not exist.");
    return res.redirect("/listings");
  }

  let originalImageUrl = "";
  if (listing.image && listing.image.url) {
    originalImageUrl = listing.image.url.replace(
      "/upload",
      "/upload/h_300,w_250",
    );
  }

  res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.show = async (req, res) => {
  const { id } = req.params;

  const listing = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");

  if (!listing) {
    req.flash("error", "The listing you requested does not exist.");
    return res.redirect("/listings");
  }

  res.render("listings/show.ejs", { listing });
};

module.exports.update = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "The listing you requested does not exist.");
    return res.redirect("/listings");
  }

  const oldLocation = listing.location;
  const oldCountry = listing.country;

  listing.set(req.body.listing);

  const needsGeocode =
    listing.location !== oldLocation ||
    listing.country !== oldCountry ||
    !listing.geometry?.coordinates?.length;

  if (needsGeocode) {
    const geometry = await geocode(`${listing.location}, ${listing.country}`);
    if (!geometry) {
      req.flash(
        "error",
        "Couldn't find that location. Try a more specific place name.",
      );
      return res.redirect(`/listings/${id}/edit`);
    }
    listing.geometry = geometry;
  }

  if (req.file) {
    listing.image = { filename: req.file.filename, url: req.file.path };
  }

  await listing.save();

  req.flash("success", "Listing updated successfully!");
  res.redirect(`/listings/${listing._id}`);
};

module.exports.delete = async (req, res) => {
  const { id } = req.params;
  const deletedListing = await Listing.findByIdAndDelete(id);

  if (!deletedListing) {
    req.flash("error", "The listing you requested does not exist.");
    return res.redirect("/listings");
  }

  req.flash("success", "Listing deleted successfully!");
  res.redirect("/listings");
};
