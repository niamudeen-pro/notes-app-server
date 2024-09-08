const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      default: null,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: Number,
      default: null,
    },
    password: {
      type: String,
      default: null,
    },
    profileImg: {
      type: String,
      default: null,
    },
    resetPassowordToken: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

const User = new mongoose.model("User", userSchema);
module.exports = User;
