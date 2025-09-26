import React, { useState } from "react";
import axios from "axios";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordFlow() {
  const [step, setStep] = useState(1); // 1: email, 2: OTP, 3: reset password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  // Step 1: Send OTP
  const handleSendOtp = async () => {
    setError("");
    if (!email) return setError("Email is required");
    if (!/\S+@\S+\.\S+/.test(email)) return setError("Invalid email address");

    try {
      const res = await axios.post(
        "http://localhost:5001/api/auth/send-reset-otp",
        { email }
      );
      if (res.data.success) {
        setStep(2);
      } else {
        setError(res.data.message || "Failed to send OTP");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Network error");
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async () => {
    setError("");
    if (!otp) return setError("OTP is required");
    if (otp.length !== 6) return setError("OTP must be 6 digits");

    try {
      const res = await axios.post(
        "http://localhost:5001/api/auth/verify-reset-otp",
        { email, otp }
      );
      if (res.data.success) {
        setStep(3); // OTP verified, show reset password fields
      } else {
        setError(res.data.message || "Invalid OTP");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Network error");
    }
  };

  // Step 3: Reset password
  const handleResetPassword = async () => {
    setError("");
    if (!newPassword || !confirmPassword)
      return setError("Password fields are required");
    if (newPassword.length < 6)
      return setError("Password must be at least 6 characters");
    if (newPassword !== confirmPassword)
      return setError("Passwords do not match");

    try {
      const res = await axios.post(
        "http://localhost:5001/api/auth/reset-password",
        { email, otp, newPassword }
      );
      if (res.data.success) {
        alert("Password reset successful! You can now log in.");
        window.location.href = "/login";
      } else {
        setError(res.data.message || "Failed to reset password");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Network error");
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto mt-20">
      <CardHeader>
        <CardTitle>Forgot Password</CardTitle>
        <CardDescription>
          {step === 1
            ? "Enter your email to receive OTP"
            : step === 2
            ? "Enter the OTP sent to your email"
            : "Set your new password"}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {step >= 1 && (
          <div className="grid gap-2">
            <Label>Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={step > 1}
            />
          </div>
        )}

        {step >= 2 && (
          <div className="grid gap-2">
            <Label>OTP</Label>
            <Input value={otp} onChange={(e) => setOtp(e.target.value)} />
          </div>
        )}

        {step === 3 && (
          <>
            <div className="grid gap-2">
              <Label>New Password</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>Confirm Password</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </>
        )}

        {error && <p className="text-red-500 text-sm">{error}</p>}
      </CardContent>

      <CardFooter className="flex flex-col gap-2">
        {step === 1 && (
          <Button
            className="w-full bg-blue-600 hover:bg-blue-800"
            onClick={handleSendOtp}
          >
            Send OTP
          </Button>
        )}
        {step === 2 && (
          <Button
            className="w-full bg-blue-600 hover:bg-blue-800"
            onClick={handleVerifyOtp}
          >
            Verify OTP
          </Button>
        )}
        {step === 3 && (
          <Button
            className="w-full bg-blue-600 hover:bg-blue-800"
            onClick={handleResetPassword}
          >
            Reset Password
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
