const express = require("express");
const router = express.Router();

const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const UserController = require("../controllers/user.js");

// ==================================================
// SIGNUP
// ==================================================

// GET /users/signup
// Show the signup/registration form
router
  .route("/signup")
  .get((req, res) => {
    res.render("users/signup.ejs");
  })

  // POST /users/signup
  // Create a new user account
  .post(wrapAsync(UserController.signup));

// ==================================================
// LOGIN
// ==================================================

// GET /users/login
// Show the login form
router
  .route("/login")
  .get((req, res) => {
    res.render("users/login.ejs");
  })

  // POST /users/login
  // Authenticate the user using Passport Local Strategy
  .post(
    // Save the URL the user wanted to visit before login
    saveRedirectUrl,

    // Authenticate username and password
    passport.authenticate("local", {
      // Redirect here if authentication fails
      failureRedirect: "/users/login",

      // Show Passport's error message using connect-flash
      failureFlash: true,
    }),

    // If authentication is successful
    (req, res) => {
      console.log("LOGGED IN USER:");
      console.log(req.user);

      console.log("AUTHENTICATED:");
      console.log(req.isAuthenticated());

      // Show success message
      req.flash("success", "Welcome back to Wanderlust!");

      // Redirect user to the page they originally wanted to visit
      // If there is no saved URL, go to the listings page
      const redirectUrl = res.locals.redirectUrl || "/listings";

      res.redirect(redirectUrl);
    },
  );

// ==================================================
// LOGOUT
// ==================================================

// GET /users/logout
// Log the user out and destroy the login session
router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    // Handle logout error
    if (err) {
      return next(err);
    }

    // Show logout success message
    req.flash("success", "You have been logged out.");

    // Redirect to listings page after logout
    res.redirect("/listings");
  });
});

// ==================================================
// EXPORT ROUTER
// ==================================================

module.exports = router;
