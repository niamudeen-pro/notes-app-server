const upload = require("../services/multer");

const uploadFileValidator = (req, res, next) => {
  upload(req, res, function (err) {
    if (err) {
      return res.status(500).send({
        code: "ERROR",
        message: err.message,
      });
    }
    next();
  });
};

module.exports = uploadFileValidator;
