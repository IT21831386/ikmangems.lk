import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from "axios";

export default function ResetPasswordForm() {
  const location = useLocation();
  const email = location.state?.email || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");

  const handleReset = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      setMessage("Passwords do not match");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5001/api/auth/reset-password", {
        email,
        password,
      });
      if (res.status === 200) {
        setMessage("Password successfully reset. You can now log in.");
      }
    } catch (err) {
      setMessage("Error resetting password.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <form
        onSubmit={handleReset}
        className="w-full max-w-sm space-y-4 bg-white shadow-md rounded-2xl p-6"
      >
        <h2 className="text-xl font-semibold">Reset Password</h2>
        <p className="text-sm text-gray-500">for {email}</p>
        <Input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="Confirm Password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />
        {message && <p className="text-sm">{message}</p>}
        <Button type="submit" className="w-full">
          Reset Password
        </Button>
      </form>
    </div>
  );
}
