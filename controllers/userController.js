/* eslint-disable import/no-extraneous-dependencies */
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const bcryptjs = require("bcryptjs");
const PasswordValidator = require("password-validator");
const he = require("he");
const passport = require("passport");

const User = require("../models/user");

const passwordSchema = new PasswordValidator();

passwordSchema
  .is()
  .min(8) // Minimum length requirement
  .has()
  .uppercase() // Require at least one uppercase letter
  .has()
  .lowercase() // Require at least one lowercase letter
  .has()
  .digits() // Require at least one digit
  .has()
  .symbols(); // Require at least one special character

exports.signUpGET = asyncHandler(async (req, res) => {
  res.render("signUp/index", {
    title: "Sign Up",
  });
});

exports.signUpPOST = [
  body("fullName", "This field is required.")
    .trim()
    .isLength({ min: 1, max: 747 })
    .withMessage("Full name should be between 1 and 747 characters long.")
    .escape(),
  body("username", "This field is required.")
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage("Username should be between 1 and 30 characters long.")
    .escape()
    .custom(async (value) => {
      const existingUser = await User.findOne({ username: value }).exec();
      if (existingUser) {
        throw new Error("A user with this username already exists.");
      } else {
        return true;
      }
    }),
  body("password", "This field is required.")
    .trim()
    .custom((value) => {
      if (!passwordSchema.validate(value)) {
        throw new Error(
          "The password must include at least one uppercase letter, one lowercase letter, one digit, one special character, and be at least 8 characters long."
        );
      } else {
        return true;
      }
    })
    .escape(),
  body("confirmPassword", "Passwords do not match.")
    .trim()
    .escape()
    .custom((value, { req }) => value === req.body.password),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    bcryptjs.hash(req.body.password, 10, async (error, hashedPassword) => {
      if (error) {
        next(error);
      } else {
        const newUser = new User({
          fullName: req.body.fullName,
          username: req.body.username,
          password: hashedPassword,
        });

        if (!errors.isEmpty()) {
          res.render("signUp/index", {
            title: "Sign Up",
            errors: errors.array(),
            newUser: {
              fullName: he.decode(req.body.fullName),
              username: he.decode(req.body.username),
              password: he.decode(req.body.password),
              confirmPassword: he.decode(req.body.confirmPassword),
            },
          });
        } else {
          await newUser.save();
          res.redirect("/");
        }
      }
    });
  }),
];

exports.signInGET = asyncHandler(async (req, res) => {
  res.render("signIn/index", {
    title: "Sign In",
  });
});

exports.signInPOST = [
  body("username").trim().escape(),
  body("password").trim().escape(),
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/signIn",
  }),
];

exports.logOutGET = asyncHandler(async (req, res, next) => {
  req.logout((error) => {
    if (error) {
      next(error);
    } else {
      res.redirect("/");
    }
  });
});
