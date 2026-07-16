"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Eye, EyeOff, AlertCircle } from "lucide-react";
import GoogleButton from "@/components/GoogleButton";

const registerSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const { registerAsync, isRegistering, googleLoginAsync, isGoogleLoggingIn } = useAuth();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (data: RegisterFormValues) => {
        setErrorMsg(null);
        try {
            await registerAsync(data);
            router.push("/dashboard");
        } catch (err) {
            setErrorMsg(err instanceof Error ? err.message : "Failed to create account. Please try again.");
        }
    };

    const handleGoogleSuccess = async (idToken: string) => {
        setErrorMsg(null);
        try {
            await googleLoginAsync({ idToken });
            router.push("/dashboard");
        } catch (err) {
            setErrorMsg(err instanceof Error ? err.message : "Google authentication failed");
        }
    };

    const isLoading = isRegistering || isGoogleLoggingIn;

    return (
        <>
            <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-white mb-2">Create an account</h1>
                <p className="text-sm text-muted-foreground">Start monitoring your APIs in seconds</p>
            </div>
            {errorMsg && (
                <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{errorMsg}</span>
                </div>
            )}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email" className="text-zinc-300">Email Address</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="name@company.com"
                        {...register("email")}
                        className="bg-zinc-950/50 border-zinc-800 focus-visible:ring-primary text-white px-4 py-5"
                    />
                    {errors.email && (
                        <p className="text-xs text-red-400">{errors.email.message}</p>
                    )}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password" className="text-zinc-300">Password</Label>
                    <div className="relative">
                        <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            {...register("password")}
                            className="bg-zinc-950/50 border-zinc-800 focus-visible:ring-primary text-white px-4 py-5"
                        />
                        <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors flex items-center justify-center p-2 rounded-md hover:bg-white/5"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                    {errors.password && (
                        <p className="text-xs text-red-400">{errors.password.message}</p>
                    )}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-zinc-300">Confirm Password</Label>
                    <div className="relative">
                        <Input
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="••••••••"
                            {...register("confirmPassword")}
                            className="bg-zinc-950/50 border-zinc-800 focus-visible:ring-primary text-white px-4 py-5"
                        />
                        <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors flex items-center justify-center p-2 rounded-md hover:bg-white/5"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                    {errors.confirmPassword && (
                        <p className="text-xs text-red-400">{errors.confirmPassword.message}</p>
                    )}
                </div>
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white mt-6 px-4 py-5" disabled={isLoading}>
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating account...
                        </>
                    ) : (
                        "Sign Up"
                    )}
                </Button>
            </form>
            <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-zinc-800" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-zinc-950 px-2 text-zinc-500 font-medium">OR</span>
                </div>
            </div>
            <GoogleButton 
                onSuccess={handleGoogleSuccess}
                onError={(err) => setErrorMsg(err)}
                isLoading={isGoogleLoggingIn}
            />
            <div className="mt-6 text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="text-primary hover:underline font-medium">
                    Sign in
                </Link>
            </div>
        </>
    );
}