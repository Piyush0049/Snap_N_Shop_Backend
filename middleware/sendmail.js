
const nodemailer = require("nodemailer");
// Create a transporter object using SMTP transport
const sendmail = async(options) => {
const transporter = nodemailer.createTransport({
    service: process.env.SMPT_SERVICE,
    host : "smtp.gmail.com",
    Port: 465,
    auth: {
      user: process.env.SMPT_MAIL,
      pass: process.env.SMPT_PASSWORD,
    },
});

// Define email options
const mailOptions = {
    from: process.env.SMPT_MAIL,
    to: options.email,
    subject: options.subject,
    text: options.message
};

// Send email
await transporter.sendMail(mailOptions);
}

module.exports = sendmail;