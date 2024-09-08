const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");
const TOKEN_DETAILS = require("../config/index");
const convertImageToBinary = require("../utils/helper");
const fs = require("fs");
const sendEmail = require("../services/nodemailer");
const sgMail = require("@sendgrid/mail");

// ================ REGISTER ======================

const encryptPassword = async (password) => {
  if (!password) {
    return null;
  }
  try {
    return await bcrypt.hash(password, 10);
  } catch (error) {
    console.log("encryptPassword error  ", error);
    return null;
  }
};

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
        password: await encryptPassword(password),
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

const frogotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).send({
        code: "USER_NOT_FOUND",
        message: "Please check your email and try again",
      });
    }

    const generateToken = (payload, secretKey, expiresIn) => {
      try {
        const token = jwt.sign(payload, secretKey, {
          expiresIn: expiresIn,
        });
        return token;
      } catch (error) {
        console.log(error, "error generateToken");
        return null;
      }
    };

    const payload = {
      userId: user?._id.toString(),
    };
    const expiresIn = "5m";

    /**
     ** This function is used to generate token
     * */

    const token = generateToken(
      payload,
      process.env.REST_PASSWORD_SECRET_KEY,
      expiresIn
    );

    if (!token) {
      return res.status(400).send({ code: "INVALID_REQUEST" });
    }

    const RESET_URL = `${process.env.CLIENT_BASE_URL}/reset-password/${token}`;

    await User.findOneAndUpdate(
      { _id: user?._id },
      {
        resetPassowordToken: token,
      }
    );
    console.log(process.env.NODE_ENV, "process.env.NODE_ENV");

    try {
      if (process.env.NODE_ENV === "production") {
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        const message = {
          from: process.env.SENDER_EMAIL,
          to: email,
          templateId: "d-7a284e5749a04b21879c96292ccb9b81",
          personalizations: [
            {
              to: [{ email: email }],
              dynamic_template_data: {
                RESET_URL: RESET_URL,
                SENDER_EMAIL: process.env.SENDER_EMAIL,
              },
            },
          ],
        };

        sgMail
          .send(message)
          .then(() => {
            console.log("Email sent");
          })
          .catch((error) => {
            console.error(error);
          });
      } else {
        const message = {
          to: email,
          subject: "Password Reset Request",
          text: `We received a request to reset the password for your account. You can create a new password by clicking the link below:
  
  ${RESET_URL}
  
  If you didn't request this change, please ignore this email. Your password will remain unchanged.
  If you have any questions, feel free to contact us at ${process.env.SENDER_EMAIL}.
  ---
  Please do not reply to this email. This email address is not monitored.`,
        };
        await sendEmail(message);
      }
    } catch (error) {
      console.error("Error sending email:", error);
      return res.status(500).send({
        code: "EMAIL_SEND_FAILED",
        message: "Failed to send password reset email.",
      });
    }

    return res.status(200).send({
      code: "SUCCESS",
      message: "Password reset email sent successfully.",
    });
  } catch (error) {
    console.log(error, "error");
    res.status(500).send({ msg: error });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token: resetPassowordToken } = req.params;
    const { password: newPassword, confirmPassword } = req.body;

    if (!resetPassowordToken || !newPassword || !confirmPassword) {
      return res.status(400).send({
        code: "INVALID_REQUEST",
        message: "Token and new password are required.",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).send({
        code: "INVALID_REQUEST",
        message: "Passwords do not match.",
      });
    }

    // Verify the token
    const decoded = jwt.verify(
      resetPassowordToken,
      process.env.REST_PASSWORD_SECRET_KEY
    );

    // Find the user by the ID in the token
    const user = await User.findOne({
      _id: decoded.userId,
    });

    if (!user) {
      return res.status(400).send({
        code: "INVALID_TOKEN",
        message:
          "Invalid or expired token. Please request a new password reset.",
      });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password and clear the reset token
    await User.findByIdAndUpdate(user._id, {
      password: hashedPassword,
      resetPasswordToken: null, // Clear the reset token
    });

    return res.status(200).send({
      code: "SUCCESS",
      message: "Password has been successfully reset.",
    });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).send({
      code: "SERVER_ERROR",
      message: "An error occurred while resetting your password.",
    });
  }
};

const authGoogle = async (req, res) => {
  try {
    const { username, email } = req.body;

    const user = await User.findOne({ email });

    // scenario where user does not exist in our database
    if (!user) {
      // step 1: creating a user
      const user = await User.create({
        username,
        email,
      });

      const userId = user?._id.toString();

      // step 2: generating token
      const token = generateToken({ userId });

      return res.status(200).send({
        access_token: token,
        userId,
        code: "SUCCESS",
      });
    }

    // scenario where user exists in our database

    const userId = user?._id.toString();
    // step 2: generating token
    const token = generateToken({ userId });

    return res.status(200).send({
      access_token: token,
      userId,
      code: "SUCCESS",
    });
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

module.exports = {
  login,
  register,
  getUserData,
  editUser,
  authGoogle,
  frogotPassword,
  resetPassword,
};
