const express = require("express");
const userRouter = express.Router();
const authControllers = require("../controller/auth.controller");
const { verifyToken, refreshToken } = require("../middleware/auth.middleware");
const {
  validateRegisterSchema,
  validateLoginSchema,
} = require("../middleware/validtion.middleware");
const uploadFileValidator = require("../middleware/file-upload.middleware");

userRouter
  .route("/register")
  .post(validateRegisterSchema, authControllers.register);

userRouter.route("/login").post(validateLoginSchema, authControllers.login);
userRouter.route("/forgot-password").post(authControllers.frogotPassword);

userRouter.route("/google").post(authControllers.authGoogle);
userRouter.route("/reset-password/:token").post(authControllers.resetPassword);

userRouter.route("/refresh-token/:userId").post(refreshToken);

userRouter.route("/user/:userId").get(verifyToken, authControllers.getUserData);
userRouter
  .route("/user/edit")
  .patch(verifyToken, uploadFileValidator, authControllers.editUser);

module.exports = userRouter;
