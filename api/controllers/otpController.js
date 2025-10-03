import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const otpStore = {}; // Temporary OTP store

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP
export const sendOTP = async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ message: "Phone number is required" });

  const otp = generateOTP();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes expiry

  otpStore[phone] = { otp, expiresAt };

  const message = `Your OTP is: ${otp}. It will expire in 5 minutes.`;

  try {
    const response = await fetch("https://app.text.lk/api/v3/sms/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.TEXTLK_API_TOKEN}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        recipient: phone,
        sender_id: process.env.SENDER_ID || "ikmangems",
        type: "plain",
        message,
      }),
    });

    const data = await response.json();

    if (data.status === "success") {
      return res.json({ success: true, message: "OTP sent successfully" });
    } else {
      return res.status(500).json({ success: false, message: "Failed to send OTP", error: data });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

// Verify OTP
export const verifyOTP = (req, res) => {
  const { phone, otp } = req.body;
  if (!phone || !otp) return res.status(400).json({ message: "Phone and OTP are required" });

  const record = otpStore[phone];
  if (!record) return res.status(400).json({ success: false, message: "OTP not found. Please request again." });

  if (Date.now() > record.expiresAt) {
    delete otpStore[phone];
    return res.status(400).json({ success: false, message: "OTP expired. Please request a new one." });
  }

  if (record.otp === otp) {
    delete otpStore[phone]; // Clear after success
    return res.json({ success: true, message: "OTP verified successfully" });
  } else {
    return res.status(400).json({ success: false, message: "Invalid OTP" });
  }
};

// Resend OTP
export const resendOTP = (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ message: "Phone number is required" });

  // Just call sendOTP again (reuse logic)
  return sendOTP(req, res);
};


/*import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const otpStore = {}; // Temporary in-memory OTP storage

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}


export const sendOTP = async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ message: "Phone number is required" });

  const otp = generateOTP();
  otpStore[phone] = otp;

  const message = `Your OTP is: ${otp}`;

  try {
    const response = await fetch("https://app.text.lk/api/v3/sms/send", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.TEXTLK_API_TOKEN}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        recipient: phone,
        sender_id: process.env.SENDER_ID, 
        type: "plain",
        message,
      }),
    });

    const data = await response.json();

    if (data.status === "success") {
      return res.json({ message: "OTP sent successfully" });
    } else {
      return res.status(500).json({ message: "Failed to send OTP", error: data });
    }
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};


export const verifyOTP = (req, res) => {
  const { phone, otp } = req.body;
  if (!phone || !otp) return res.status(400).json({ message: "Phone and OTP are required" });

  if (otpStore[phone] && otpStore[phone] === otp) {
    delete otpStore[phone]; 
    return res.json({ message: "OTP verified successfully" });
  } else {
    return res.status(400).json({ message: "Invalid OTP" });
  }
};*/
