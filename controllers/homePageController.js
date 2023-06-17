/* eslint-disable import/no-extraneous-dependencies */
const asyncHandler = require("express-async-handler");

const Sphere = require("../models/sphere");
const Story = require("../models/story");

exports.homePageGET = asyncHandler(async (req, res) => {
  const top4Spheres = await Sphere.find().sort({ stories: -1 }).limit(4).exec();
  const sortedStories = await Story.find().sort({ createdAt: -1 }).exec();

  res.render("index", {
    title: "Home",
    top4Spheres,
    sortedStories,
  });
});
