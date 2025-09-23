import nodemailer from 'nodemailer';

class EmailService {
  constructor() {
    // Email configuration - you can use Gmail, Outlook, or any SMTP service
    this.transporter = nodemailer.createTransport({
      service: 'gmail', // You can change this to 'outlook', 'yahoo', etc.
      auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASS || 'your-app-password' // Use app password for Gmail
      }
    });

    console.log('Email Service initialized');
  }

  // Send payment confirmation email
  async sendPaymentConfirmation(paymentData) {
    try {
      const { 
        fullName, 
        emailAddress, 
        paymentId, 
        transactionId, 
        auctionId, 
        amount, 
        paymentType,
        cardType,
        bank,
        branch,
        date
      } = paymentData;

      // Format amount
      const formatAmount = (amount) => {
        return new Intl.NumberFormat('en-LK', {
          style: 'currency',
          currency: 'LKR',
          minimumFractionDigits: 0
        }).format(amount);
      };

      // Create email content
      const subject = `Payment Confirmation - ${paymentId}`;
      
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Payment Confirmation</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #1e3c72, #2a5298); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
                .payment-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745; }
                .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #e9ecef; }
                .detail-row:last-child { border-bottom: none; }
                .label { font-weight: bold; color: #495057; }
                .value { color: #212529; font-family: 'Courier New', monospace; }
                .footer { text-align: center; margin-top: 30px; color: #6c757d; font-size: 12px; }
                .success-icon { font-size: 48px; color: #28a745; margin-bottom: 20px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>ikmangems.lk</h1>
                    <h2>Payment Confirmation</h2>
                </div>
                
                <div class="content">
                    <div style="text-align: center;">
                        <div class="success-icon">✅</div>
                        <h2 style="color: #28a745; margin-bottom: 20px;">Payment Successful!</h2>
                    </div>
                    
                    <p>Dear ${fullName},</p>
                    
                    <p>Thank you for your payment! We are pleased to confirm that your payment has been processed successfully.</p>
                    
                    <div class="payment-details">
                        <h3 style="color: #495057; margin-bottom: 20px;">Payment Details</h3>
                        
                        <div class="detail-row">
                            <span class="label">Payment Number:</span>
                            <span class="value">${paymentId}</span>
                        </div>
                        ${paymentType === 'Online Payment' ? `
                        <div class="detail-row">
                            <span class="label">Transaction ID:</span>
                            <span class="value">${transactionId}</span>
                        </div>
                        ` : ''}
                        <div class="detail-row">
                            <span class="label">Auction ID:</span>
                            <span class="value">${auctionId}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Payment Method:</span>
                            <span class="value">${paymentType}</span>
                        </div>
                        ${paymentType === 'Bank Deposit' ? `
                        <div class="detail-row">
                            <span class="label">Bank:</span>
                            <span class="value">${bank}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Branch:</span>
                            <span class="value">${branch}</span>
                        </div>
                        ` : `
                        <div class="detail-row">
                            <span class="label">Card Type:</span>
                            <span class="value">${cardType === 'visa' ? 'Visa Card' : cardType === 'mastercard' ? 'Master Card' : 'Card Payment'}</span>
                        </div>
                        `}
                        <div class="detail-row">
                            <span class="label">Amount:</span>
                            <span class="value">${formatAmount(amount)}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Payment Date:</span>
                            <span class="value">${date}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Status:</span>
                            <span class="value" style="color: #28a745; font-weight: bold;">COMPLETED</span>
                        </div>
                    </div>
                    
                    <p>You can download your payment invoice from your payment history page.</p>
                    
                    <p>If you have any questions or concerns, please don't hesitate to contact our support team.</p>
                    
                    <div class="footer">
                        <p><strong>ikmangems.lk</strong></p>
                        <p>Colombo, Sri Lanka</p>
                        <p>Email: support@ikmangems.lk | Tel: +94 11 234 5678</p>
                        <p>Thank you for choosing Ikman Gems!</p>
                        <p style="margin-top: 15px; font-size: 10px;">This is an automated email. Please do not reply to this email.</p>
                    </div>
                </div>
            </div>
        </body>
        </html>
      `;

      const textContent = `
        Payment Confirmation - ${paymentId}
        
        Dear ${fullName},
        
        Thank you for your payment! We are pleased to confirm that your payment has been processed successfully.
        
        Payment Details:
        - Payment Number: ${paymentId}
        ${paymentType === 'Online Payment' ? `- Transaction ID: ${transactionId}` : ''}
        - Auction ID: ${auctionId}
        - Payment Method: ${paymentType}
        ${paymentType === 'Bank Deposit' ? `- Bank: ${bank}\n- Branch: ${branch}` : `- Card Type: ${cardType === 'visa' ? 'Visa Card' : cardType === 'mastercard' ? 'Master Card' : 'Card Payment'}`}
        - Amount: ${formatAmount(amount)}
        - Payment Date: ${date}
        - Status: COMPLETED
        
        You can download your payment invoice from your payment history page.
        
        If you have any questions or concerns, please don't hesitate to contact our support team.
        
        Best regards,
        ikmangems.lk Team
        Colombo, Sri Lanka
        Email: support@ikmangems.lk | Tel: +94 11 234 5678
      `;

      // Send email
      const mailOptions = {
        from: `"ikmangems.lk" <${process.env.EMAIL_USER || 'noreply@ikmangems.lk'}>`,
        to: emailAddress,
        subject: subject,
        text: textContent,
        html: htmlContent
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      console.log('Email sent successfully:', result.messageId);
      return {
        success: true,
        messageId: result.messageId,
        message: 'Payment confirmation email sent successfully'
      };

    } catch (error) {
      console.error('Error sending email:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to send payment confirmation email'
      };
    }
  }

  // Test email functionality
  async testEmail(toEmail) {
    try {
      const mailOptions = {
        from: `"ikmangems.lk" <${process.env.EMAIL_USER || 'noreply@ikmangems.lk'}>`,
        to: toEmail,
        subject: 'Test Email from ikmangems.lk',
        text: 'This is a test email from ikmangems.lk payment system.',
        html: `
          <h2>Test Email</h2>
          <p>This is a test email from ikmangems.lk payment system.</p>
          <p>If you receive this email, the email service is working correctly!</p>
        `
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      return {
        success: true,
        messageId: result.messageId,
        message: 'Test email sent successfully'
      };

    } catch (error) {
      console.error('Error sending test email:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to send test email'
      };
    }
  }
}

const emailService = new EmailService();
export default emailService;
