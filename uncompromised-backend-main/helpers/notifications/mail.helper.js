const nodeMailer = require('nodemailer');

// send mail for the given options
async function sendMail(options) {
  try {
    const transporter = nodeMailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_MAIL,
        pass: process.env.SMTP_APP_PASS
      },
      authMethod: process.env.SMTP_AUTH_METHOD
    });

    const mailOptions = {
      from: process.env.SMTP_MAIL,
      to: options.to,
      subject: options.subject,
      html: options.message,
      attachments: options.attachments
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.log(error);
    return error;
  }
}

module.exports = { sendMail };
