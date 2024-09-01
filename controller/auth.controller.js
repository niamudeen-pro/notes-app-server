const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");
const TOKEN_DETAILS = require("../config/index");
const convertImageToBinary = require("../utils/helper");
const fs = require("fs");

// ================ REGISTER ======================

const register = async (req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).send({ errors: errors.array() });
    } else {
      const { username, email, phone, password, isAdmin } = req.body;

      const userExist = await User.findOne({ email });

      if (userExist) {
        return res.status(400).send({ message: "email already exists" });
      }

      await User.create({
        username,
        email,
        phone,
        password,
        isAdmin,
      });

      res.status(201).send({
        code: "SUCCESS",
      });
    }
  } catch (error) {
    console.log(error, "error");
    res.status(500).send({ msg: error });
  }
};

// ============= LOGIN ======================

const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).send({ errors: errors.array() });
    } else {
      const { email, password } = req.body;

      const userExist = await User.findOne({ email });
      if (!userExist) {
        return res.status(400).send({
          message: "Invalid Credentials",
        });
      }

      const isPasswordMatch = await bcrypt.compare(
        password,
        userExist.password
      );

      const payload = {
        userId: userExist._id.toString(),
      };

      const token = jwt.sign(payload, TOKEN_DETAILS.JWT_SECRET_KEY, {
        expiresIn: TOKEN_DETAILS.ACCESS_TOKEN_EXPIRATION_TIME,
      });

      if (isPasswordMatch) {
        res.status(200).send({
          access_token: token,
          userId: userExist._id.toString(),
          code: "SUCCESS",
        });
      } else {
        return res.status(401).send({
          message: "Invalid email or passoword",
        });
      }
    }
  } catch (error) {
    res.status(500).send({ msg: error });
  }
};

// ============== FETCHING USER DETAILS

const getUserData = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).send({
        message: "INVALID_REQUEST",
      });
    }

    const user = await User.findById({ _id: userId });

    if (!user) {
      return res.status(400).send({
        code: "USER_NOT_FOUND",
      });
    }
    return res.status(200).send({
      user: {
        userId: user._id.toString(),
        username: user.username,
        email: user.email,
        phone: user.phone,
        notes: user.notes,
        profileImg: user.profileImg,
      },
      code: "SUCCESS",
    });
  } catch (error) {
    console.log(error, "error");
    res.status(500).send({ msg: error });
  }
};

const editUser = async (req, res) => {
  try {
    const { userId } = req.user;

    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res.status(400).send({
        message: "USER_NOT_FOUND",
      });
    }

    let FILE_URL = "";
    let FILE_PATH = "";

    if (req.file) {
      const { filePath, fileUrl } = convertImageToBinary(req.file);
      if (fileUrl) FILE_URL = fileUrl;
      if (filePath) FILE_PATH = filePath;
    }

    await User.findByIdAndUpdate(
      { _id: req.user.userId },
      {
        ...req.body,
        profileImg: FILE_URL || user.profileImg,
      },
      { new: true }
    );

    if (FILE_PATH) {
      fs.unlinkSync(FILE_PATH);
    }

    res.status(200).send({
      code: "UPDATED",
    });
  } catch (error) {
    console.log("error: ", error);
    return res.status(500).send({
      code:
        error.codeName === "DuplicateKey"
          ? "DUPLICATE_KEY"
          : "INTERNAL_SERVER_ERROR",
    });
  }
};

module.exports = { login, register, getUserData, editUser };
