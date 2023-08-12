const nodemailer = require('nodemailer');

const mailHelper = async (option) => {
  const transporter = nodemailer.createTransport({
    host: process.env.NODEMAILER_HOST,
    port: process.env.NODEMAILER_PORT,
    auth: {
      user: process.env.NODEMAILER_USER,
      pass: process.env.NODEMAILER_PASS,
    },
  });

  //message:
  const message = {
    from: 'nvnv1332@gmail.com',
    to: option.email,
    subject: option.subject,
    text: option.message,
  };

  //send mail:
  await transporter.sendMail(message);
};

module.exports = mailHelper;
