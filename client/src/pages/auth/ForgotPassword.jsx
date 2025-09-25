import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

// Step 1: Email schema
const emailSchema = z.object({
  email: z.string().email("Invalid email address"),
});

// Step 2: OTP schema
const otpSchema = z.object({
  email: z.string(),
  otp: z.string().length(6, "OTP must be 6 digits"),
});

// Step 3: Reset password schema
const resetSchema = z
  .object({
    email: z.string(),
    otp: z.string(),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default function ForgotPasswordFlow() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [serverError, setServerError] = useState("");

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(step === 1 ? emailSchema : step === 2 ? otpSchema : resetSchema),
    defaultValues: { email, otp: "", newPassword: "", confirmPassword: "" },
  });

  // Step 1: Send OTP
  const onSendOtp = async (data) => {
    setServerError("");
    try {
      const response = await axios.post("http://localhost:5001/api/auth/send-reset-otp", { email: data.email });
      if (response.data.success) {
        setEmail(data.email);
        setStep(2);
      } else {
        setServerError(response.data.message || "Failed to send OTP");
      }
    } catch (err) {
      setServerError(err.response?.data?.message || "Network error");
    }
  };

  // Step 2: Verify OTP
  const onVerifyOtp = async (data) => {
    setServerError("");
    // Backend does not have a separate verify endpoint; we can just proceed to reset
    setStep(3);
  };

  // Step 3: Reset Password
  const onResetPassword = async (data) => {
    setServerError("");
    try {
      const response = await axios.post("http://localhost:5001/api/auth/reset-password", {
        email: data.email,
        otp: data.otp,
        newPassword: data.newPassword,
      });
      if (response.data.success) {
        alert("Password reset successful! You can now log in.");
        window.location.href = "/login"; // navigate to login
      } else {
        setServerError(response.data.message || "Failed to reset password");
      }
    } catch (err) {
      setServerError(err.response?.data?.message || "Network error");
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto mt-20">
      <CardHeader>
        <CardTitle>Forgot Password</CardTitle>
        <CardDescription>
          {step === 1 ? "Enter your email to receive OTP" : step === 2 ? "Enter the OTP sent to your email" : "Set your new password"}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(step === 1 ? onSendOtp : step === 2 ? onVerifyOtp : onResetPassword)} className="flex flex-col gap-4">
          
          {step >= 1 && (
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} defaultValue={email} disabled={step > 1} />
              {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
            </div>
          )}

          {step >= 2 && (
            <div className="grid gap-2">
              <Label htmlFor="otp">OTP</Label>
              <Input id="otp" {...register("otp")} />
              {errors.otp && <p className="text-red-500 text-sm">{errors.otp.message}</p>}
            </div>
          )}

          {step === 3 && (
            <>
              <div className="grid gap-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input id="newPassword" type="password" {...register("newPassword")} />
                {errors.newPassword && <p className="text-red-500 text-sm">{errors.newPassword.message}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input id="confirmPassword" type="password" {...register("confirmPassword")} />
                {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>}
              </div>
            </>
          )}

          {serverError && <p className="text-red-500 text-sm">{serverError}</p>}

          <CardFooter className="flex flex-col gap-2">
            <Button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-800">
              {step === 1 ? "Send OTP" : step === 2 ? "Verify OTP" : "Reset Password"}
            </Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  );
}
