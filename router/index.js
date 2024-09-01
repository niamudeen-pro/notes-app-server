const express = require("express");
const router = express.Router();
const userRouter = require("./auth.routes");
const notesRouter = require("./notes.routes");

router.use("/auth", userRouter);
router.use("/notes", notesRouter);

module.exports = router;
