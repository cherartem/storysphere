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
const bcryptjs = require("bcryptjs");

require("dotenv").config();

const indexRouter = require("./routes/index");
const signUpRouter = require("./routes/signUp");
const signInRouter = require("./routes/signIn");

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

// Set up the LocalStrategy
const User = require("./models/user");

passport.use(
  // eslint-disable-next-line consistent-return
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await User.findOne({ username });
      if (!user) {
        return done(null, false, {
          message: "The user with this username does not exist.",
        });
      }
      bcryptjs.compare(password, user.password, (error, res) => {
        if (res) {
          return done(null, user);
        }
        return done(null, false, {
          message: "The password you entered is incorrect. Please try again.",
        });
      });
    } catch (error) {
      return done(error);
    }
  })
);

// Allow users to stay logged in as they move around the app
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

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

// Redirect the user to the sign in page if he isn't authenticated
app.use((req, res, next) => {
  if (!req.user && req.url !== "/signIn" && req.url !== "/signUp") {
    res.redirect("/signIn");
  } else {
    next();
  }
});

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

app.use("/", indexRouter);
app.use("/signUp", signUpRouter);
app.use("/signIn", signInRouter);

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
