const nodemailer = require('nodemailer');

exports.sendDetailedAbsenceNotification = async (student, absentSessions) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  console.log(`Sending absence notification to ${student.email}`);

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: student.email,
    subject: 'Important: Absence Notification',
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Absence Notification</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f8f8f8; border-radius: 5px; padding: 20px; margin-bottom: 20px;">
          <h2 style="color: #e74c3c;">📅 Absence Notification</h2>
          <p style="font-size: 16px;">Dear <strong>${student.name}</strong>,</p>
          <p>We hope this email finds you well. We've noticed that you were absent for the following sessions:</p>
        </div>

        <div style="background-color: #fff; border: 1px solid #e0e0e0; border-radius: 5px; padding: 15px; margin-bottom: 20px;">
          <h3 style="color: #3498db;">🕒 Missed Sessions:</h3>
          <ul style="list-style-type: none; padding-left: 0;">
            ${absentSessions.map(session => `
              <li style="margin-bottom: 10px; padding: 10px; background-color: #f1f8ff; border-radius: 3px;">
                <strong>Date:</strong> ${session.date}<br>
                <strong>Time:</strong> ${session.startTime} - ${session.endTime}
              </li>
            `).join('')}
          </ul>
          <p style="font-weight: bold; color: #e74c3c;">Total sessions missed: ${absentSessions.length}</p>
        </div>

        <div style="background-color: #f8f8f8; border-radius: 5px; padding: 20px;">
          <h3 style="color: #27ae60;">📝 Next Steps:</h3>
          <ol>
            <li>Please provide a reason for your absence through our student portal.</li>
            <li>If you believe this is an error, contact the administration office as soon as possible.</li>
            <li>Review any missed coursework and reach out to your instructors if you need assistance catching up.</li>
          </ol>
          <p>Remember, regular attendance is crucial for your academic success. If you're facing any challenges, our student support team is here to help.</p>
        </div>

        <div style="margin-top: 20px; text-align: center; color: #7f8c8d;">
          <p>Best regards,<br><strong>Karmayogi Institute of Technology</strong></p>
          <p style="font-size: 12px;">
            📞 Contact: (123) 456-7890 | 📧 Email: admin@school.edu<br>
            🏫 School Address: At Post Shelve, Tal, Pandharpur, Maharashtra 413304
          </p>
        </div>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Detailed absence email sent to ${student.email}`);
  } catch (error) {
    console.error('Error sending detailed absence email:', {
      error: error.message,
      stack: error.stack,
      student: student,
      absentSessions: absentSessions
    });

    if (error.code === 'EAUTH') {
      console.error('Error: Missing email credentials. Please set the EMAIL_USER and EMAIL_PASS environment variables.');
    } else {
      throw error;
    }
  }
};