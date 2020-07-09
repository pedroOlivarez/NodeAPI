const nodemailer = require("nodemailer");

async function sendEmail(options) {
   const {
      SMTP_HOST,
      SMTP_PORT,
      SMTP_EMAIL,
      SMTP_PASSWORD,
      FROM_EMAIL,
      FROM_NAME,
   } = process.env;
   
   const { 
      to,
      subject,
      text,
   } = options;

   const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      auth: {
         user: SMTP_EMAIL,
         pass: SMTP_PASSWORD,
      },
   });

   const message = {
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to,
      subject,
      text,
   };

   const info = await transporter.sendMail(message);

  console.log(`Message sent: ${info.messageId}`);
}

module.exports = sendEmail;