/* eslint-disable no-underscore-dangle */
const mongoose = require("mongoose");

const { Schema } = mongoose;

const SphereSchema = new Schema({
  admins: [{ type: Schema.Types.ObjectId, ref: "User" }],
  members: [{ type: Schema.Types.ObjectId, ref: "User" }],
  name: { type: String, required: true, min: 1, max: 30 },
  description: { type: String, required: true, min: 1, max: 150 },
  stories: [{ type: Schema.Types.ObjectId, ref: "Story" }],
});

SphereSchema.virtual("url").get(function getURL() {
  return `/spheres/${this._id}`;
});

module.exports = mongoose.model("Sphere", SphereSchema, "spheres");
