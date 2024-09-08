require("dotenv-flow").config();

const express = require("express");
const cors = require("cors");
const router = require("./router/index.js");
const connectDb = require("./db/index.js");
const colors = require("colors");
const bodyParser = require("body-parser");
const fs = require("fs");

connectDb();
const app = express();

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

app.use(cors());

app.use("/api/v1", router);

app.get("/", (req, res) => {
  res.send("auth server is working !");
});

fs.mkdirSync("uploads", { recursive: true });

app.listen(process.env.PORT, () => {
  console.log(`server is running at port: ${process.env.PORT}`.bgGreen);
});
