import React, { useState } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import getOTP from "./getOTP";
import { useNavigate } from "react-router-dom";

export default function VerifyEmail() {
  const [email, setEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post("http://localhost:5001/api/auth/verify-account", { email });


      if (response.status === 200) {
        setOtpSent(true); 
        navigate("/get-otp", { state: { email } })
      }
    } catch (err) {
      // axios throws error for 4xx/5xx
      if (err.response && err.response.data) {
        setError(err.response.data.message || "User not found or error sending OTP");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      {!otpSent ? (
        <form
          onSubmit={handleSendOtp}
          className="w-full max-w-sm space-y-4 bg-white shadow-md rounded-2xl p-6"
        >
          <h2 className="text-xl font-semibold">Reset Password</h2>
          <p className="text-sm text-gray-500">
            Enter your email address to receive a one-time password.
          </p>
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Sending..." : "Send OTP"}
          </Button>
        </form>
      ) : (
        <OtpVerificationForm email={email} />
      )}
    </div>
  );
}
