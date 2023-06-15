/* eslint-disable no-underscore-dangle */
const mongoose = require("mongoose");

const { Schema } = mongoose;

const SphereSchema = new Schema({
  admin: { type: Schema.Types.ObjectId, ref: "User" },
  name: { type: String, required: true },
  description: String,
  stories: [{ type: Schema.Types.ObjectId, ref: "Story" }],
});

SphereSchema.virtual("url").get(function getURL() {
  return `/spheres/${this._id}`;
});

module.exports = mongoose.model("Sphere", SphereSchema, "spheres");
