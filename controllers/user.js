
const User = require("../models/user.js");

// ===============================
// SIGNUP
// ===============================

module.exports.signup = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    const newUser = new User({
      username,
      email,
    });

    const registerUser = await User.register(newUser, password);

    console.log("REGISTERED:", registerUser);

    // Automatically login after signup
    req.login(registerUser, (err) => {
      if (err) {
        return next(err);
      }

      req.flash("success", "Welcome to Wanderlust!");

      res.redirect("/listings");
    });

  } catch (e) {
    console.log("SIGNUP ERROR:", e);

    req.flash("error", e.message);

    res.redirect("/users/signup");
  }
};

