/* eslint-disable import/no-extraneous-dependencies */
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const bcryptjs = require("bcryptjs");

const User = require("../models/user");

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
    .custom(async (value) => {
      const existingUser = await User.findOne({ username: value });
      if (existingUser) {
        throw new Error("A user with this username already exists.");
      }
    })
    .escape(),
  body("password", "This field is required.").trim().escape(),
  body("confirmPassword", "Passwords do not match.")
    .trim()
    .custom((value, { req }) => value === req.body.password)
    .escape(),

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
              fullName: req.body.fullName,
              username: req.body.username,
              password: req.body.password,
              confirmPassword: req.body.confirmPassword,
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
