// backfill-geometry.js
// One-time script: finds every listing missing geometry/coordinates
// and geocodes it, so you don't have to manually edit each one.
//
// Run with:  node backfill-geometry.js

if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}

const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
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

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
  console.log("Connected to DB");

  const missing = await Listing.find({
    $or: [
      { geometry: { $exists: false } },
      { "geometry.coordinates": { $exists: false } },
      { "geometry.coordinates.0": { $exists: false } },
    ],
  });

  console.log(`Found ${missing.length} listing(s) missing coordinates.\n`);

  let fixed = 0;
  let failed = 0;

  for (const listing of missing) {
    const query = `${listing.location}, ${listing.country}`;
    try {
      const geometry = await geocode(query);

      if (!geometry) {
        console.log(`✗ No match for "${listing.title}" (${query})`);
        failed++;
        continue;
      }

      // updateOne skips full-document validation, so it won't fail
      // even if some other required field is missing on old data
      await Listing.updateOne({ _id: listing._id }, { $set: { geometry } });

      console.log(
        `✓ Fixed "${listing.title}" (${query}) ->`,
        geometry.coordinates,
      );
      fixed++;
    } catch (err) {
      console.log(
        `✗ Error geocoding "${listing.title}" (${query}):`,
        err.message,
      );
      failed++;
    }
  }

  console.log(`\nDone. Fixed: ${fixed}, Failed: ${failed}`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Backfill script error:", err);
  process.exit(1);
});
