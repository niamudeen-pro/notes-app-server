const nodemailer = require("nodemailer");

const sendEmail = (message) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // Use `true` for port 465, `false` for all other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const emailOptions = {
    from: process.env.SENDER_EMAIL,
    ...message,
  };

  try {
    transporter.sendMail(emailOptions);
  } catch (error) {
    console.log(error, "error sendEmail");
  }
};

module.exports = sendEmail;
