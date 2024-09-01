const jwt = require("jsonwebtoken");
const TOKEN_DETAILS = require("../config/index");

const verifyToken = (req, res, next) => {
  const token = req?.headers?.authorization?.split(" ")[1];

  if (!token) {
    return res.status(200).send({
      success: false,
      message: "A token is required for authorization",
    });
  }
  try {
    const decodedUser = jwt.verify(token, TOKEN_DETAILS.JWT_SECRET_KEY);
    req.user = decodedUser;
  } catch (error) {
    return res.status(401).send({ message: "Token has expired" });
  }
  return next();
};

const refreshToken = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ code: "INVALID_REQUEST" });
    }

    const token = jwt.sign(
      {
        userId: userId,
      },
      TOKEN_DETAILS.JWT_SECRET_KEY,
      {
        expiresIn: "10s",
      }
    );

    return res.status(200).json({ code: "SUCCESS", token });
  } catch (error) {
    console.log("error: ", error);
    return res.status(400).send({ message: "invalid token" });
  }
};

module.exports = { verifyToken, refreshToken };
