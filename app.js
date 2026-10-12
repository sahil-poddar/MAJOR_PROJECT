if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");

const path = require("path");
const methodOverride = require("method-override");

const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");

const listings = require("./router/listing.js");
const review = require("./router/review.js");
const userRouter = require("./router/user.js");

const session = require("express-session");
const { MongoStore } = require("connect-mongo");
const flash = require("connect-flash");

const passport = require("passport");
const LocalStrategy = require("passport-local");
const user = require("./models/user.js");

// =========================================
// DATABASE URL
// =========================================

const dburl = process.env.ATLASB_URL;

// =========================================
// MONGODB SESSION STORE
// =========================================

const store = MongoStore.create({
  mongoUrl: dburl,

  crypto: {
    secret: process.env.SECRET,
  },

  ttl: 7 * 24 * 60 * 60,

  touchAfter: 24 * 60 * 60,
});

store.on("error", (err) => {
  console.log("Error in mongo session store:", err);
});

// =========================================
// SESSION OPTIONS
// =========================================

const sessionOption = {
  store: store,

  secret: process.env.SECRET,

  resave: false,

  saveUninitialized: false,

  cookie: {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),

    maxAge: 7 * 24 * 60 * 60 * 1000,

    httpOnly: true,
  },
};

// =========================================
// EJS
// =========================================

app.engine("ejs", ejsMate);

app.set("views", path.join(__dirname, "views"));

app.set("view engine", "ejs");

// =========================================
// MIDDLEWARE
// =========================================

app.use(
  express.urlencoded({
    extended: true,
  }),
);

app.use(methodOverride("_method"));

app.use(express.static(path.join(__dirname, "public")));

// =========================================
// FAVICON
// =========================================

app.get("/favicon.ico", (req, res) => {
  res.status(204).end();
});

// =========================================
// DATABASE CONNECTION
// =========================================

async function main() {
  await mongoose.connect(dburl);

  console.log("Connected to DB");
}

main()
  .then(() => {
    console.log("Database is ready");
  })
  .catch((err) => {
    console.log("Database connection error:", err);
  });

// =========================================
// SESSION
// =========================================

app.use(session(sessionOption));

app.use(flash());

// =========================================
// PASSPORT
// =========================================

app.use(passport.initialize());

app.use(passport.session());

passport.use(new LocalStrategy(user.authenticate()));

passport.serializeUser(user.serializeUser());

passport.deserializeUser(user.deserializeUser());

// =========================================
// LOCALS
// =========================================

app.use((req, res, next) => {
  res.locals.success = req.flash("success");

  res.locals.error = req.flash("error");

  res.locals.currentUser = req.user;

  next();
});

// =========================================
// ROUTES
// =========================================

app.use("/listings", listings);

app.use("/listings/:id/reviews", review);

app.use("/users", userRouter);

// =========================================
// DEMO USER
// =========================================

app.get("/demoUser", async (req, res) => {
  try {
    const fakeUser = new user({
      email: "sahilpoddar489@gmail.com",

      username: "sahil-poddar",
    });

    const registerUser = await user.register(fakeUser, "sahil");

    res.send(registerUser);
  } catch (err) {
    console.log("Demo user error:", err);

    res.status(500).send(err.message);
  }
});

// =========================================
// 404 ERROR
// =========================================

app.use((req, res, next) => {
  next(new ExpressError(404, "Page not found"));
});

// =========================================
// ERROR HANDLER
// =========================================

app.use((err, req, res, next) => {
  console.log("ERROR HANDLER:", req.method, req.originalUrl, err);

  const { statusCode = 500, message = "Something went wrong" } = err;

  res.status(statusCode).render("listings/Error.ejs", {
    message,
  });
});

// =========================================
// SERVER
// =========================================

app.listen(3030, () => {
  console.log("Server is running on http://localhost:3030");
});
