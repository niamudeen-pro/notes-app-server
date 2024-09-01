const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
    },
    email: {
      type: String,
      unique: [true, "Email is already in use."],
    },
    phone: {
      type: Number,
      unique: [true, "Phone number is already in use."],
    },
    password: {
      type: String,
    },
    profileImg: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// secruring the password with bcrypt
userSchema.pre("save", async function (next) {
  const user = this;

  if (!user.isModified("password")) {
    next();
  }

  try {
    const saltRound = 10;
    const hash_password = await bcrypt.hash(user.password, saltRound);
    user.password = hash_password;
  } catch (error) {
    next(error);
  }
});

// define the model and collection name
const User = new mongoose.model("User", userSchema);
module.exports = User;
