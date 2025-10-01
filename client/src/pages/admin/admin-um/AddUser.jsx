import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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


const createUserSchema = z
  .object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    phone: z
      .string()
      .min(10, "Phone number must be at least 10 digits")
      .max(12, "Phone number cannot exceed 12 digits")
      .regex(/^\d+$/, "Phone number must contain only digits"),
    role: z.enum(["user", "seller"], {
      required_error: "Please select a role",
    }),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm Password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default function AddUser() {
  const [serverError, setServerError] = useState("");
  const [serverSuccess, setServerSuccess] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      role: "user",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data) => {
    setServerError("");
    setServerSuccess("");
    try {
      const response = await axios.post(
        "http://localhost:5001/api/auth/register",
        {
          firstName: data.firstName,
          lastName: data.lastName,
          name: `${data.firstName} ${data.lastName}`,
          email: data.email,
          phone: data.phone,
          password: data.password,
          role: data.role,
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        setServerSuccess("User created successfully");
        reset();
      } else {
        setServerError(response.data.message || "User creation failed");
      }
    } catch (error) {
      console.error(error);
      setServerError(
        error.response?.data?.message || "Network error, please try again."
      );
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto mt-10">
      <CardHeader>
        <CardTitle>Create New User</CardTitle>
        <CardDescription>Fill out the form to add a new user</CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="grid gap-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input id="firstName" {...register("firstName")} />
            {errors.firstName && (
              <p className="text-red-500 text-sm">{errors.firstName.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input id="lastName" {...register("lastName")} />
            {errors.lastName && (
              <p className="text-red-500 text-sm">{errors.lastName.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("email")} />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" type="tel" {...register("phone")} />
            {errors.phone && (
              <p className="text-red-500 text-sm">{errors.phone.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="role">Role</Label>
            <select
              id="role"
              className="border rounded-md p-2"
              {...register("role")}
            >
              <option value="user">User</option>
              <option value="seller">Seller</option>
            </select>
            {errors.role && (
              <p className="text-red-500 text-sm">{errors.role.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" {...register("password")} />
            {errors.password && (
              <p className="text-red-500 text-sm">{errors.password.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {serverError && <p className="text-red-500 text-sm">{serverError}</p>}
          {serverSuccess && (
            <p className="text-green-600 text-sm">{serverSuccess}</p>
          )}

          <CardFooter className="flex flex-col gap-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full hover:bg-blue-800 bg-blue-600"
            >
              {isSubmitting ? "Creating..." : "Create User"}
            </Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  );
}
