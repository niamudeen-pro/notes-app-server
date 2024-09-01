const express = require("express");
const notesRouter = express.Router();
const notesController = require("../controller/notes.controller");
const { verifyToken } = require("../middleware/auth.middleware");

notesRouter.route("/:userId").get(verifyToken, notesController.getNotes);

notesRouter.route("/add").post(verifyToken, notesController.addNote);

notesRouter.route("/edit/:id").patch(verifyToken, notesController.editNote);

notesRouter.route("/delete/:id").patch(verifyToken, notesController.deleteNote);

module.exports = notesRouter;
