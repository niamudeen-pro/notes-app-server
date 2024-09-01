const fs = require("fs");
const path = require("path");

const convertImageToBinary = (file) => {
  if (!file) return null;

  const filePath = path.join(__dirname, "../uploads/" + file.filename);
  const imageAsBase64 = fs.readFileSync(filePath, "base64");

  const fileUrl = `data:image/${file.mimetype};base64,${imageAsBase64}`;
  return { filePath, fileUrl };
};

module.exports = convertImageToBinary;
