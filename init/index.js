const mongoose = require("mongoose");

const Listing = require("../models/listing.js");
const User = require("../models/user.js");
const initData = require("./data.js");

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");

  console.log("Connected to database");

  await initDB();

  await mongoose.connection.close();

  console.log("Database connection closed");
}

const initDB = async () => {
  await Listing.deleteMany({});

  let owner = await User.findOne({});

  if (!owner) {
    owner = new User({
      email: "sahilpoddar489@gmail.com",
      username: "sahil-poddar",
    });

    owner = await User.register(owner, "sahil");

    console.log("Created demo user:", owner.username);
  }

  const listingsWithOwner = initData.data.map((obj) => ({
    ...obj,
    owner: owner._id,
  }));

  await Listing.insertMany(listingsWithOwner);

  console.log("Data was initialized");
};

main().catch((err) => {
  console.error("Database initialization failed:", err);
  mongoose.connection.close();
});
