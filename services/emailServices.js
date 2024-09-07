const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

exports.sendAbsenceNotification = async (student) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: student.email,
    subject: 'Absence Notification',
    text: `Dear ${student.name}, you were absent today. Please provide a reason for your absence.`
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${student.email}`);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};