"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  organizationName: z.string().min(2),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true);
    setError("");
    try {
      await axios.post("/api/auth/register", data);
      window.location.href = "/dashboard";
    } catch (err: any) {
      setError(err.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md p-8 bg-card border rounded-lg shadow-sm">
        <h1 className="text-3xl font-bold text-center text-primary mb-2">FinanceFlow</h1>
        <p className="text-center text-muted-foreground mb-8">Register your organization</p>

        {error && (
          <div className="p-3 mb-6 text-sm text-red-500 bg-red-100 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Your Name</label>
            <input
              {...register("name")}
              className="w-full px-3 py-2 border rounded-md bg-background focus:ring-2 focus:ring-primary outline-none"
              placeholder="John Doe"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Organization Name</label>
            <input
              {...register("organizationName")}
              className="w-full px-3 py-2 border rounded-md bg-background focus:ring-2 focus:ring-primary outline-none"
              placeholder="StartupFlow Inc."
            />
            {errors.organizationName && (
              <p className="mt-1 text-xs text-red-500">{errors.organizationName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              {...register("email")}
              type="email"
              className="w-full px-3 py-2 border rounded-md bg-background focus:ring-2 focus:ring-primary outline-none"
              placeholder="john@startupflow.com"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              {...register("password")}
              type="password"
              className="w-full px-3 py-2 border rounded-md bg-background focus:ring-2 focus:ring-primary outline-none"
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 font-semibold text-primary-foreground bg-primary rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}
