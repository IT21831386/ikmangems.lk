# Email Service Setup Guide

## Overview
The payment system now sends confirmation emails to users when their payments are completed successfully.

## Email Service Configuration

### 1. Install Dependencies
```bash
cd api
npm install nodemailer
```

### 2. Environment Variables
Add these to your `.env` file:

```env
# Email Service Configuration (Gmail Example)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### 3. Gmail Setup (Recommended)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
   - Use this password as `EMAIL_PASS`

### 4. Other Email Providers

You can also use other email providers by modifying the transporter configuration in `api/services/emailService.js`:

```javascript
// For Outlook/Hotmail
service: 'hotmail'

// For Yahoo
service: 'yahoo'

// For custom SMTP
host: 'smtp.your-provider.com',
port: 587,
secure: false
```

## Email Features

### Automatic Email Sending
- **Online Payments**: Email sent immediately when payment is completed
- **Bank Deposits**: Email sent when admin approves payment (status = 'success')

### Email Content
- Professional HTML template with company branding
- Payment details (Payment ID, Transaction ID, Amount, etc.)
- Different content for Bank Deposits vs Online Payments
- Responsive design for mobile and desktop

### Email Template Includes
- Company header (ikmangems.lk)
- Payment confirmation message
- Detailed payment information
- Professional footer with contact details

## Testing Email Service

### Test Endpoint
You can test the email service using this endpoint:

```bash
POST http://localhost:5001/api/test-email
Content-Type: application/json

{
  "email": "test@example.com"
}
```

### Manual Testing
1. Make a test payment
2. Check the server logs for email sending status
3. Verify email is received in the user's inbox

## Troubleshooting

### Common Issues

1. **"Invalid login" error**:
   - Check if 2FA is enabled
   - Verify app password is correct
   - Ensure EMAIL_USER is correct

2. **"Connection timeout"**:
   - Check internet connection
   - Verify SMTP settings
   - Try different email provider

3. **Emails not received**:
   - Check spam folder
   - Verify email address is correct
   - Check server logs for errors

### Debug Mode
Set `NODE_ENV=development` to see detailed email sending logs.

## Security Notes

- Never commit email credentials to version control
- Use environment variables for all sensitive data
- Consider using a dedicated email service for production
- Implement rate limiting for email sending

## Production Recommendations

1. **Use dedicated email service** (SendGrid, Mailgun, etc.)
2. **Implement email templates** management
3. **Add email delivery tracking**
4. **Set up email monitoring** and alerts
5. **Implement retry logic** for failed emails
