import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// Zod schema for signup
const signupSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm Password is required"),
    userType: z.enum(["seller", "bidder"], "Select a user type"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default function Signup() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");

  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      userType: "bidder",
    },
  });

  const onSubmit = async (data) => {
    setServerError("");
    try {
      const response = await axios.post(
        "http://localhost:5001/api/auth/register", // replace with your backend URL
        {
          name: data.name,
          email: data.email,
          password: data.password,
          userType: data.userType,
        }
      );

      if (response.data.success) {
        navigate("/login"); // redirect after successful signup
      } else {
        setServerError(response.data.message || "Signup failed");
      }
    } catch (error) {
      console.error(error);
      setServerError(
        error.response?.data?.message || "Network error, please try again."
      );
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto mt-10 mb-10">
      <CardHeader>
        <CardTitle>Sign Up</CardTitle>
        <CardDescription>Create your account</CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {/* Name */}
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...register("name")} placeholder="Your name" />
            {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
          </div>

          {/* Email */}
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("email")} placeholder="you@example.com" />
            {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
          </div>

          {/* Password */}
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" {...register("password")} />
            {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
          </div>

          {/* Confirm Password */}
          <div className="grid gap-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input id="confirmPassword" type="password" {...register("confirmPassword")} />
            {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>}
          </div>

          {/* User Type */}
          <div className="grid gap-2">
            <Label>Register As</Label>
            <Controller
              control={control}
              name="userType"
              render={({ field }) => (
                <RadioGroup {...field} className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="bidder" id="bidder" />
                    <Label htmlFor="bidder">Bidder</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="seller" id="seller" />
                    <Label htmlFor="seller">Seller</Label>
                  </div>
                </RadioGroup>
              )}
            />
            {errors.userType && <p className="text-red-500 text-sm">{errors.userType.message}</p>}
          </div>

          {serverError && <p className="text-red-500 text-sm">{serverError}</p>}

          <CardFooter className="flex flex-col gap-2">
            <Button type="submit" disabled={isSubmitting} className="w-full  hover:bg-blue-800 bg-blue-600">
              {isSubmitting ? "Signing up..." : "Sign Up"}
            </Button>

            <div className="text-center text-sm mt-2">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-500 hover:text-blue-800">
                Login
              </Link>
            </div>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  );
}
