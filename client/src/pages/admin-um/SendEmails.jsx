// Add this to your authController.js

export const sendCustomEmail = async (req, res) => {
  try {
    const { to, subject, message, userName } = req.body;

    if (!to || !subject || !message) {
      return res.json({ 
        success: false, 
        message: "Email, subject, and message are required" 
      });
    }

    // Personalize the message if userName is provided
    const personalizedMessage = userName 
      ? `Dear ${userName},\n\n${message}\n\nBest regards,\nAdmin Team`
      : message;

    await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to: to,
      subject: subject,
      text: personalizedMessage,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          ${userName ? `<p>Dear <strong>${userName}</strong>,</p>` : ''}
          <div style="margin: 20px 0; line-height: 1.6;">
            ${message.replace(/\n/g, '<br>')}
          </div>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #666; font-size: 14px;">
            Best regards,<br>
            <strong>Admin Team</strong>
          </p>
        </div>
      `
    });

    res.json({ 
      success: true, 
      message: "Email sent successfully" 
    });
    
  } catch (error) {
    console.error('Email sending error:', error);
    res.json({ 
      success: false, 
      message: "Failed to send email: " + error.message 
    });
  }
};

// Add this endpoint for bulk email sending (more efficient)
export const sendBulkEmail = async (req, res) => {
  try {
    const { recipients, subject, message } = req.body;

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return res.json({ 
        success: false, 
        message: "Recipients array is required" 
      });
    }

    if (!subject || !message) {
      return res.json({ 
        success: false, 
        message: "Subject and message are required" 
      });
    }

    const emailPromises = recipients.map(recipient => {
      const personalizedMessage = recipient.name 
        ? `Dear ${recipient.name},\n\n${message}\n\nBest regards,\nAdmin Team`
        : message;

      return transporter.sendMail({
        from: process.env.SENDER_EMAIL,
        to: recipient.email,
        subject: subject,
        text: personalizedMessage,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            ${recipient.name ? `<p>Dear <strong>${recipient.name}</strong>,</p>` : ''}
            <div style="margin: 20px 0; line-height: 1.6;">
              ${message.replace(/\n/g, '<br>')}
            </div>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="color: #666; font-size: 14px;">
              Best regards,<br>
              <strong>Admin Team</strong>
            </p>
          </div>
        `
      });
    });

    await Promise.all(emailPromises);

    res.json({ 
      success: true, 
      message: `Bulk email sent successfully to ${recipients.length} recipients` 
    });
    
  } catch (error) {
    console.error('Bulk email sending error:', error);
    res.json({ 
      success: false, 
      message: "Failed to send bulk email: " + error.message 
    });
  }
};