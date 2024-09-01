const Notes = require("../models/notes.model");
const path = require("path");
const fs = require("fs");

/**
 * This function is used to fetch all the notes based on the userId
 * @params {userId}
 * @returns {object} => {code, notes}
 * */

const getNotes = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).send({
        code: "INVALID_REQUEST",
      });
    }

    const notesList = await Notes.find({ userId });

    if (!notesList) {
      return res.status(400).send({
        code: "NOT_FOUND",
      });
    }

    return res.status(200).send({
      code: "SUCCESS",
      notes: notesList,
    });
  } catch (error) {
    console.log("error: getNotes ", error);
    res.status(500).send({ message: error });
  }
};

/**
 * This function is used to add the note in the notes collection
 * @body {title, message}
 * @returns {object} => {code}
 * */

const addNote = async (req, res) => {
  try {
    const { title, message } = req.body;
    const { userId } = req.user;

    // const { file } = req;

    // let FILE_URL = "";

    // if (file) {
    //   const filePath = path.join(__dirname, "../uploads/" + file.filename);
    //   const imageAsBase64 = fs.readFileSync(filePath, "base64");

    //   FILE_URL = `data:image/${file.mimetype};base64,${imageAsBase64}`;
    //   fs.unlinkSync(filePath);
    // }

    await Notes.create({
      userId,
      title,
      message,
    });

    return res.status(201).send({
      code: "SUCCESS",
    });
  } catch (error) {
    console.log("error addNote", error);

    res.status(500).send({
      success: false,
      message: "Error uploading images",
    });
  }
};

/**
 * This function is used to edit the note based on the noteId and userId
 * @body {title, message}
 * @param {noteId}
 * @req {file, user}
 * @returns {object} => {code}
 * */

const editNote = async (req, res) => {
  try {
    const { userId } = req.user;
    const { id: noteId } = req.params;
    const { title, message } = req.body;
    console.log("req.body: ", req.body);

    const existingNote = await Notes.findOne({ _id: noteId, userId });

    if (!existingNote) {
      return res.status(400).send({
        code: "NOT_FOUND",
      });
    }

    const result = await Notes.findOneAndUpdate(
      { _id: noteId, userId },
      {
        title,
        message,
      }
    );

    if (!result) {
      return res.status(400).send({
        code: "NOT_FOUND",
      });
    }

    return res.status(200).send({
      message: "UPDATED",
    });
  } catch (error) {
    console.error("Error reading folder or uploading files:", error);
    res.status(500).send({
      success: false,
      message: "Error updating note",
    });
  }
};

/**
 * This function is used to edit the note based on the noteId and userId
 * @param {userId}
 * @req { user}
 * @returns {object} => {code}
 * */

const deleteNote = async (req, res) => {
  try {
    const { userId } = req.user;
    const { id: noteId } = req.params;

    const existingNote = await Notes.findOne({ _id: noteId, userId });

    if (!existingNote) {
      return res.status(400).send({
        code: "NOT_FOUND",
      });
    }

    await Notes.findOneAndDelete({ _id: noteId, userId });

    return res.status(200).send({
      code: "SUCCESS",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: error });
  }
};

module.exports = {
  getNotes,
  addNote,
  editNote,
  deleteNote,
};
