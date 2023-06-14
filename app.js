/* eslint-disable no-console */
/* eslint-disable import/no-extraneous-dependencies */
const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const mongoose = require("mongoose");
const compression = require("compression");
const helmet = require("helmet");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

require("dotenv").config();

const indexRouter = require("./routes/index");
const signUpRouter = require("./routes/signUp");

const app = express();

// Set up MongoDB with Mongoose
mongoose
  .connect(process.env.MONGODB_CONNECTION_URI)
  .catch((error) => console.error(error));

mongoose.connection.once("open", () => {
  console.log("Successfully connected to MongoDB");
});

mongoose.connection.on("error", (error) => {
  console.error(error);
});

// Set up compression
app.use(compression());

// Set up Helmet
app.use(helmet());

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/signUp", signUpRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
