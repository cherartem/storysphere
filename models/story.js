/* eslint-disable no-underscore-dangle */
const mongoose = require("mongoose");

const { Schema } = mongoose;

const StorySchema = new Schema(
  {
    title: { type: String, required: true, min: 1, max: 50 },
    story: { type: String, required: true, min: 1, max: 500 },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

StorySchema.virtual("url").get(function getURL() {
  return `/stories/${this._id}`;
});

module.exports = mongoose.model("Story", StorySchema, "stories");
