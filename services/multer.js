const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "_" + file.originalname);
  },
});

const MAX_FILE_SIZE = 1024 * 200;
const ALLOWED_FILE_TYPES = [
  "image/jpg",
  "image/png",
  "image/jpeg",
  "image/webp",
];

const fileFilter = (req, file, cb) => {
  if (ALLOWED_FILE_TYPES.includes(file.mimetype)) {
    return cb(null, true);
  } else {
    return cb(new Error("Only .webp, .jpeg, .jpg & .png images are allowed"));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
}).single("picture");

module.exports = upload;
