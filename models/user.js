/* eslint-disable no-underscore-dangle */
const mongoose = require("mongoose");

const { Schema } = mongoose;

const UserSchema = new Schema({
  fullName: { type: String, required: true, minLength: 1, maxLength: 747 }, // The longest full name is 747 characters in length
  username: { type: String, required: true, minLength: 1, maxlength: 30 },
  password: { type: String, required: true },
  memberOf: { type: Schema.Types.ObjectId, ref: "Sphere" },
  adminOf: { type: Schema.Types.ObjectId, ref: "Sphere" },
  stories: [{ type: Schema.Types.ObjectId, ref: "Story" }],
});

UserSchema.virtual("url").get(function getURL() {
  return `/users/${this._id}`;
});

module.exports = mongoose.model("User", UserSchema, "users");
