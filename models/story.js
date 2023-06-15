/* eslint-disable no-underscore-dangle */
const mongoose = require("mongoose");

const { Schema } = mongoose;

const StorySchema = new Schema({
  title: { type: String, required: true },
  story: { type: String, required: true },
  author: { type: String, required: true },
});

StorySchema.virtual("url").get(function getURL() {
  return `/stories/${this._id}`;
});

module.exports = mongoose.model("Story", StorySchema, "stories");
