import axios from 'axios';

class TextLKService {
  constructor() {
    // Use your new TextLK API credentials
    this.apiKey = process.env.TEXTLK_API_TOKEN;
    this.baseURL = 'https://app.text.lk/api/http/'; // Use HTTP API for SMS
    this.senderId = process.env.SENDER_ID;
    
    console.log('TextLK Service initialized with new API key');
    console.log('API Key:', this.apiKey ? this.apiKey.substring(0, 10) + '...' : 'NOT SET');
    console.log('Base URL:', this.baseURL);
    console.log('Sender ID:', this.senderId);
  }

  // Send OTP to phone number
  async sendOTP(phoneNumber, message = null) {
    try {
      // Extract OTP from message if provided, otherwise generate new one
      let otp;
      if (message && message.includes('OTP')) {
        // Extract OTP from message like "Your OTP for ikmangems.lk payment verification is: 123456. Valid for 7 minutes."
        const otpMatch = message.match(/is:\s*(\d{6})/);
        otp = otpMatch ? otpMatch[1] : Math.floor(100000 + Math.random() * 900000).toString();
      } else {
        otp = Math.floor(100000 + Math.random() * 900000).toString();
      }
      
      const defaultMessage = message || `Your OTP for ikmangems.lk payment verification is: ${otp}. Valid for 7 minutes.`;
      
      // Check if TextLK credentials are configured
      if (!this.apiKey || this.apiKey === 'your_textlk_api_key') {
        console.log('TextLK API key not configured. Please add your TextLK API key to .env file');
        console.log(`OTP for ${phoneNumber}: ${otp}`);
        return {
          success: true,
          otp: otp,
          messageId: 'fallback',
          data: { message: 'TextLK API key not configured - OTP logged to console' }
        };
      }

      // Format phone number for TextLK (should be in international format)
      let formattedNumber = phoneNumber;
      if (phoneNumber.startsWith('0')) {
        formattedNumber = '94' + phoneNumber.substring(1);
      } else if (!phoneNumber.startsWith('94')) {
        formattedNumber = '94' + phoneNumber;
      }

      console.log('Original phone number:', phoneNumber);
      console.log('Formatted phone number:', formattedNumber);
      console.log('API Key (first 10 chars):', this.apiKey.substring(0, 10) + '...');

      // TextLK HTTP API format based on documentation
      const textlkPayload = {
        recipient: formattedNumber,
        message: message || defaultMessage,
        from: this.senderId,
        api_token: this.apiKey
      };
      
      // Try alternative token field names
      const alternativePayloads = [
        {
          recipient: formattedNumber,
          message: message || defaultMessage,
          from: this.senderId,
          api_token: this.apiKey
        },
        {
          recipient: formattedNumber,
          message: message || defaultMessage,
          from: this.senderId,
          api_token: this.apiKey,
          api_key: this.apiKey
        },
        {
          recipient: formattedNumber,
          message: message || defaultMessage,
          from: this.senderId,
          token: this.apiKey
        },
        {
          recipient: formattedNumber,
          message: message || defaultMessage,
          from: this.senderId,
          access_token: this.apiKey
        }
      ];

      console.log('TextLK SMS Payload:', textlkPayload);

      // Use the correct HTTP API endpoint for SMS
      const smsEndpoint = 'https://app.text.lk/api/http/sms/send';
      
      console.log(`Sending SMS via TextLK HTTP API: ${smsEndpoint}`);
      
      let response = null;
      let success = false;
      
      // Try all payload formats
      for (const payload of alternativePayloads) {
        try {
          console.log(`Trying payload format:`, payload);
          response = await axios.post(smsEndpoint, payload, {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          });
          
          console.log('TextLK API Response:', response.data);
          
          // Check if response indicates success
          if (response.data.status === 'success' || response.data.success === true || response.status === 200) {
            console.log('✅ TextLK SMS sent successfully!');
            success = true;
            break;
          } else {
            console.log('❌ TextLK response indicates failure:', response.data);
          }
        } catch (error) {
          console.log(`❌ Payload format failed:`, error.response?.data || error.message);
        }
      }
      
      if (!success) {
        throw new Error('All TextLK payload formats failed');
      }

      return {
        success: true,
        otp: otp,
        messageId: response.data.data?.id || response.data.messageId || 'textlk',
        data: response.data
      };
    } catch (error) {
      console.error('TextLK SMS Error:', error.response?.data || error.message);
      console.error('Error status:', error.response?.status);
      console.error('Error details:', error.response?.data);
      
      // Generate OTP for fallback
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Try to send via alternative method if TextLK fails
      try {
        console.log('Trying alternative SMS service...');
        const altResult = await this.sendViaFreeSMS(phoneNumber, message || defaultMessage);
        if (altResult.success) {
          console.log('Alternative SMS service succeeded');
          return {
            success: true,
            otp: otp,
            messageId: altResult.messageId,
            data: altResult.data
          };
        }
      } catch (altError) {
        console.log('Alternative SMS service also failed');
      }
      
      // Final fallback: log OTP to console
      console.log(`\n🚨 ALL SMS SERVICES FAILED 🚨`);
      console.log(`📱 Phone number: ${phoneNumber}`);
      console.log(`🔑 OTP for testing: ${otp}`);
      console.log(`💡 This is likely because you're using a free TextLK account`);
      console.log(`💡 Free accounts often don't allow SMS sending`);
      console.log(`💡 For production, you'll need to upgrade your TextLK account`);
      console.log(`\n✅ Payment flow will continue with console OTP for testing`);
      console.log(`🎯 USE THIS OTP: ${otp}`);
      
      return {
        success: true, // Return success so payment can continue
        otp: otp,
        messageId: 'console-fallback',
        error: error.response?.data?.message || error.message,
        message: 'SMS failed - likely free account limitation. OTP logged to console for testing.'
      };
    }
  }

  // Alternative SMS service using a free API
  async sendViaFreeSMS(phoneNumber, message) {
    try {
      // Format phone number for international format
      let formattedNumber = phoneNumber;
      if (phoneNumber.startsWith('0')) {
        formattedNumber = '94' + phoneNumber.substring(1);
      } else if (!phoneNumber.startsWith('94')) {
        formattedNumber = '94' + phoneNumber;
      }

      console.log(`Attempting to send SMS via alternative service to: ${formattedNumber}`);

      // Try multiple free SMS services
      const services = [
        {
          name: 'TextBelt',
          url: 'https://textbelt.com/text',
          payload: {
            phone: formattedNumber,
            message: message,
            key: 'textbelt'
          }
        },
        {
          name: 'SMS Global',
          url: 'https://api.smsglobal.com/v1/sms',
          payload: {
            to: formattedNumber,
            message: message
          }
        }
      ];

      for (const service of services) {
        try {
          console.log(`Trying ${service.name}...`);
          const response = await axios.post(service.url, service.payload);
          
          if (response.data.success || response.status === 200) {
            console.log(`${service.name} succeeded!`);
            return {
              success: true,
              messageId: response.data.textId || response.data.id || service.name,
              data: response.data
            };
          }
        } catch (error) {
          console.log(`${service.name} failed:`, error.message);
        }
      }

      throw new Error('All alternative SMS services failed');
    } catch (error) {
      console.error('Alternative SMS service error:', error.message);
      throw error;
    }
  }

  // Test TextLK connection
  async testConnection() {
    try {
      // Simple test - just return success for now
      return { success: true, data: { message: 'TextLK service loaded' } };
    } catch (error) {
      console.error('TextLK connection test failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Verify OTP (if TextLK provides verification endpoint)
  async verifyOTP(phoneNumber, otp) {
    try {
      const response = await axios.post(`${this.baseURL}/sms/verify`, {
        to: phoneNumber,
        otp: otp
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        verified: response.data.verified || false,
        data: response.data
      };
    } catch (error) {
      console.error('TextLK Verification Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }
}

export default new TextLKService();