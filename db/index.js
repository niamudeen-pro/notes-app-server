const mongoose = require("mongoose");

const connectDb = async () => {
  try {
    await mongoose.connect(process.env.DB_URL);
    console.log("connection to DB".bgMagenta);
  } catch (error) {
    console.log("database connection failed".bgMagenta);
    process.exit(0);
  }
};

module.exports = connectDb;
