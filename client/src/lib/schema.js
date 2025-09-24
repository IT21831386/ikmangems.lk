import { z } from "zod";

export const signinSchema = z.object({
  name: z.string().min(2, "Name should be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password should be at least 8 characters"),
});


// Signup schema
export const signupSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm Password is required"),
    userType: z.enum(["seller", "bidder"], "Select a user type"),
    nicImage: z
      .any()
      .refine((file) => !file || file.length > 0, "NIC image is required for sellers")
      .optional(),
    businessImage: z
      .any()
      .refine((file) => !file || file.length > 0, "Business registration image is required for sellers")
      .optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

/*

import { z } from "zod";

export const signinSchema = z.object({
  name: z.string().min(2, "Name should be at least 2 characters"),
  email: z.string().email("Invalid email address"),  // corrected
  password: z.string().min(6, "Password should be at least 6 characters"),
});

*/