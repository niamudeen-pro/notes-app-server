const mongoose = require("mongoose");
const User = require("../models/user.model.js");

const noteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    title: String,
    message: String,
    image: String,
    imageId: String,
  },
  {
    timestamps: true,
  }
);

const Notes = mongoose.model("Notes", noteSchema);
module.exports = Notes;
