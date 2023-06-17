/* eslint-disable no-underscore-dangle */
/* eslint-disable import/no-extraneous-dependencies */
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const he = require("he");

const Sphere = require("../models/sphere");
const Story = require("../models/story");

exports.createSphereGET = asyncHandler(async (req, res) => {
  res.render("spheres/createSphereForm", {
    title: "New Sphere",
  });
});

exports.createSpherePOST = [
  body("name", "This field is required.")
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage("This field must be between 1 and 30 characters long.")
    .escape(),
  body("description", "This field is required.")
    .trim()
    .isLength({ min: 1, max: 150 })
    .withMessage("This field must be between 1 and 150 characters long.")
    .escape(),

  asyncHandler(async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.render("spheres/createSphereForm", {
        title: "New Sphere",
        errors: errors.array(),
        newSphere: {
          name: he.decode(req.body.name),
        },
      });
    } else {
      const newSphere = await Sphere.create({
        admins: [req.user._id],
        members: [req.user._id],
        name: req.body.name,
        description: req.body.description,
      });
      res.redirect(newSphere.url);
    }
  }),
];

exports.sphereDetailsGET = asyncHandler(async (req, res) => {
  const sphere = await Sphere.findById(req.params.sphereId)
    .populate({
      path: "stories",
      options: { sort: { createdAt: -1 } },
      populate: {
        path: "author",
      },
    })
    .exec();

  res.render("spheres/sphereDetails", {
    title: sphere.name,
    sphere,
  });
});

exports.listOfSpheresGET = asyncHandler(async (req, res) => {
  const allSpheres = await Sphere.find().sort({ stories: -1 }).exec();

  res.render("spheres/listOfSpheres", {
    title: "All Spheres",
    allSpheres,
  });
});

exports.createStoryGET = asyncHandler(async (req, res) => {
  const sphere = await Sphere.findById(req.params.sphereId).exec();

  res.render("spheres/createStoryForm", {
    title: "New Story",
    sphere,
  });
});

exports.createStoryPOST = [
  body("title", "This field is required.")
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("This field must be between 1 and 50 characters long.")
    .escape(),
  body("story", "This field is required.")
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage("This field must be between 1 and 500 characters long.")
    .escape(),

  asyncHandler(async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.render("spheres/createStoryForm", {
        title: "New Story",
        errors: errors.array(),
        newStory: {
          title: he.decode(req.body.title),
        },
      });
    } else {
      const newStory = await Story.create({
        title: req.body.title,
        story: req.body.story,
        author: req.user._id,
      });
      const currentSphere = await Sphere.findById(
        req.params.sphereId,
        "stories"
      ).exec();
      const newSphereStories = currentSphere.stories;
      newSphereStories.push(newStory._id);
      await Sphere.findByIdAndUpdate(req.params.sphereId, {
        stories: newSphereStories,
      });

      res.redirect(`/spheres/${req.params.sphereId}`);
    }
  }),
];

exports.deleteStoryGET = asyncHandler(async (req, res) => {
  const story = await Story.findById(req.params.storyId)
    .populate("author")
    .exec();
  const cancelLink = `/spheres/${req.params.sphereId}`;

  res.render("spheres/storyDeleteForm", {
    title: "Delete a story",
    story,
    cancelLink,
  });
});

exports.deleteStoryPOST = asyncHandler(async (req, res) => {
  const currentStory = await Story.findById(req.params.storyId).exec();
  const currentSphere = await Sphere.findById(req.params.sphereId).exec();
  const storyIndexOf = currentSphere.stories.indexOf(currentStory._id);
  const newSphereStoriesArray = currentSphere.stories;
  newSphereStoriesArray.splice(storyIndexOf, 1);
  await Sphere.findByIdAndUpdate(req.params.sphereId, {
    stories: newSphereStoriesArray,
  });
  await Story.findByIdAndDelete(req.params.storyId);
  res.redirect(`/spheres/${req.params.sphereId}`);
});

exports.sphereJoinGET = asyncHandler(async (req, res) => {
  const currentSphere = await Sphere.findById(req.params.sphereId).exec();
  const newSphereMembersArray = currentSphere.members;
  newSphereMembersArray.push(req.user._id);
  await Sphere.findByIdAndUpdate(req.params.sphereId, {
    members: newSphereMembersArray,
  });
  res.redirect(`/spheres/${req.params.sphereId}`);
});
