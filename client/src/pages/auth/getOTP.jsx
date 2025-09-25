import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function GetOTP({ email }) {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5001/api/auth/send-verify-otp", {
        email,
        otp,
      });

      if (res.status === 200) {
        // OTP correct → redirect to reset password form route
        navigate("/reset-password", { state: { email } });
      }
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Invalid OTP or error verifying OTP.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <form
        onSubmit={handleVerifyOtp}
        className="w-full max-w-sm space-y-4 bg-white shadow-md rounded-2xl p-6"
      >
        <h2 className="text-xl font-semibold">Enter OTP</h2>
        <p className="text-sm text-gray-500">
          We’ve sent a one-time password to <span className="font-medium">{email}</span>
        </p>
        <Input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Verifying..." : "Verify OTP"}
        </Button>
      </form>
    </div>
  );
}
