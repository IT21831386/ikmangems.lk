import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const signinSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password should be at least 6 characters"),
});

export default function Signin() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");
  const { setUser } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(signinSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data) => {
    setServerError("");
    try {
      const response = await axios.post(
        "http://localhost:5001/api/auth/login",
        data,
        { withCredentials: true }
      );

      if (response.data.success) {
        const loggedInUser = response.data.user; // user object with role
        setUser(loggedInUser);
        localStorage.setItem("user", JSON.stringify(loggedInUser));

        // Role-based navigation
        if (loggedInUser.role === "buyer") {
          navigate("/", { replace: true });
        } else if (loggedInUser.role === "seller") {
          navigate("/seller-dashboard", { replace: true });
        } else if (loggedInUser.role === "admin") {
          navigate("/admin-dashboard", { replace: true });
        } else {
          navigate("/", { replace: true });
        }
      } else {
        setServerError(response.data.message || "Login failed");
      }
    } catch (error) {
      setServerError(
        error.response?.data?.message || "Network error, please try again."
      );
    }
  };

  return (
    <Card className="w-full max-w-sm mx-auto mt-20">
      <CardHeader>
        <CardTitle>Login to your account</CardTitle>
        <CardDescription className="mb-2">
          Enter your email and password below to login
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
          {/* Email */}
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                to="/forgot-password"
                className="text-sm underline text-blue-500 hover:text-blue-800"
              >
                Forgot your password?
              </Link>
            </div>
            <Input id="password" type="password" {...register("password")} />
            {errors.password && (
              <p className="text-red-500 text-sm">{errors.password.message}</p>
            )}
          </div>

          {/* Server error */}
          {serverError && <p className="text-red-500 text-sm">{serverError}</p>}

          <CardFooter className="flex flex-col gap-2">
            <Button
              type="submit"
              className="w-full hover:bg-blue-800 bg-blue-600"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Logging in..." : "Login"}
            </Button>
            <Button variant="outline" className="w-full" disabled>
              Login with Google
            </Button>

            <div className="text-center text-sm mt-2">
              Dont have a accont?{" "}
              <Link to="/signup" className="text-blue-500 hover:text-blue-800">
                Sign Up
              </Link>
            </div>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  );
}
