"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { X, Eye, EyeOff, Loader2 } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useHeaderStore } from "@/store/useHeaderStore";

import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import API_ENDPOINTS from "@/constants/endpoints";
import Image from "next/image";
import { toast } from "sonner";

// Helper to safely extract error messages from unknown catch values
interface ApiError {
  code?: string;
  message?: string;
  data?: { message?: string };
  response?: { data?: { message?: string } };
}
function toApiError(err: unknown): ApiError {
  return err && typeof err === "object" ? (err as ApiError) : {};
}

export type AuthView =
  | "login"
  | "register"
  | "forgot-password"
  | "reset-password"
  | "otp";

const AuthSidebar = () => {
  const { isAuthOpen, onAuthClose, authView } = useHeaderStore();
  const { login } = useAuthStore();
  const [currentView, setCurrentView] = useState<AuthView>(authView);
  const [isLoading, setIsLoading] = useState(false);

  // Password visibility states
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Login state
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  // Registration state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Forgot password flow state
  const [forgotEmail, setForgotEmail] = useState("");
  const [otpValues, setOtpValues] = useState<string[]>(Array(6).fill(""));
  const [resetPasswordState, setResetPasswordState] = useState({
    password: "",
    confirmPassword: "",
  });

  // Sync currentView with the store's authView when the sidebar opens
  useEffect(() => {
    if (isAuthOpen) {
      setCurrentView(authView);
      // Reset form data when sidebar opens
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
      setLoginData({
        email: "",
        password: "",
      });
      setForgotEmail("");
      setOtpValues(Array(6).fill(""));
      setResetPasswordState({ password: "", confirmPassword: "" });
    }
  }, [isAuthOpen, authView]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    // Map ids to state keys
    const keyMap: Record<string, string> = {
      "first-name": "firstName",
      "last-name": "lastName",
      "register-email": "email",
      "register-password": "password",
      "confirm-password": "confirmPassword",
    };

    const key = keyMap[id];
    if (key) {
      setFormData((prev) => ({ ...prev, [key]: value }));
    }
  };

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    if (id === "login-email") {
      setLoginData((prev) => ({ ...prev, email: value }));
    } else if (id === "login-password") {
      setLoginData((prev) => ({ ...prev, password: value }));
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, loginData);
      const data = response.data;

      // The API returns the user object with the token inside it
      // Standardize: extract token and user
      const token = data.token;
      if (!token) {
        throw new Error("Invalid response from server: missing token");
      }

      // data IS the user object (plus the token)
      login(data, token);
      toast.success("Login successful!");

      // Close sidebar after a short delay
      setTimeout(() => {
        onAuthClose();
        setIsLoading(false);
      }, 500);

      // Reset form
      setLoginData({ email: "", password: "" });
    } catch (error: unknown) {
      const err = toApiError(error);
      const message =
        err.data?.message || err.response?.data?.message || err.message || "Invalid credentials";
      toast.error(message);
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.post(API_ENDPOINTS.AUTH.REGISTER, {
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        password: formData.password,
      });

      toast.success("Registration successful! Please login.");
      setCurrentView("login");
      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
      setShowRegisterPassword(false);
      setShowConfirmPassword(false);
    } catch (error: unknown) {
      const err = toApiError(error);
      const message =
        err.data?.message || err.response?.data?.message || err.message || "Registration failed";
      toast.error(message);
      setIsLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setIsLoading(true);
    try {
      await api.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, {
        email: forgotEmail,
      });
      toast.success("Verification code sent to your email!");
      setCurrentView("otp");
    } catch (error: unknown) {
      const err = toApiError(error);
      toast.error(
        err.data?.message || err.response?.data?.message || "Failed to send verification code.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const pastedData = value.slice(0, 6).split("");
      const newOtp = [...otpValues];
      for (let i = 0; i < pastedData.length; i++) {
        if (index + i < 6) newOtp[index + i] = pastedData[i];
      }
      setOtpValues(newOtp);
      const nextIndex = Math.min(index + pastedData.length, 5);
      const nextInput = document.getElementById(
        `otp-${nextIndex}`,
      ) as HTMLInputElement;
      if (nextInput) nextInput.focus();
    } else {
      const newOtp = [...otpValues];
      // Only digits
      if (value && !/^\\d+$/.test(value)) return;
      newOtp[index] = value;
      setOtpValues(newOtp);
      if (value !== "" && index < 5) {
        const nextInput = document.getElementById(
          `otp-${index + 1}`,
        ) as HTMLInputElement;
        if (nextInput) nextInput.focus();
      }
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && otpValues[index] === "" && index > 0) {
      const prevInput = document.getElementById(
        `otp-${index - 1}`,
      ) as HTMLInputElement;
      if (prevInput) prevInput.focus();
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = otpValues.join("");
    if (token.length !== 6) {
      toast.error("Please enter a valid 6-digit code.");
      return;
    }
    setIsLoading(true);
    try {
      await api.post(API_ENDPOINTS.AUTH.VERIFY_OTP, { token });
      toast.success("Code verified successfully!");
      setCurrentView("reset-password");
    } catch (error: unknown) {
      const err = toApiError(error);
      toast.error(err.data?.message || err.response?.data?.message || "Invalid or expired code.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (resetPasswordState.password !== resetPasswordState.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (resetPasswordState.password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    setIsLoading(true);
    try {
      const token = otpValues.join("");
      await api.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
        token,
        password: resetPasswordState.password,
      });
      toast.success("Password reset successful! Please login.");
      setCurrentView("login");
      setForgotEmail("");
      setOtpValues(Array(6).fill(""));
      setResetPasswordState({ password: "", confirmPassword: "" });
    } catch (error: unknown) {
      const err = toApiError(error);
      toast.error(err.data?.message || err.response?.data?.message || "Failed to reset password.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderHeader = () => {
    let title = "";
    switch (currentView) {
      case "login":
        title = "Log in";
        break;
      case "register":
        title = "Create Account";
        break;
      case "forgot-password":
        title = "Forgot Password";
        break;
      case "reset-password":
        title = "Set Password";
        break;
      case "otp":
        title = "OTP Verification";
        break;
    }

    return (
      <SheetHeader className="flex flex-row items-center justify-between px-6 py-5 border-b border-border bg-background sticky top-0 z-10 space-y-0">
        <SheetTitle className="text-lg font-bold text-foreground">
          {title}
        </SheetTitle>
        <button
          onClick={onAuthClose}
          className="inline-flex items-center justify-center size-10 rounded-full bg-muted hover:bg-muted/80 transition-colors"
        >
          <X className="size-5 text-foreground" />
        </button>
      </SheetHeader>
    );
  };

  const renderLoginView = () => (
    <div
      key="login"
      className="flex flex-col gap-y-8 animate-in fade-in slide-in-from-right-4 duration-300 w-full"
    >
      <div className="flex justify-center">
        <Image
          src="/images/authentication/login-illustration.png"
          alt="login"
          className="max-w-[200px] mx-auto"
          width={200}
          height={200}
        />
      </div>
      <div className="flex flex-col gap-y-6 w-full">
        <form onSubmit={handleLogin} className="flex flex-col gap-y-4">
          <div className="relative">
            <input
              type="email"
              className="w-full px-5 py-3.5 rounded-full border border-border focus:border-primary outline-none transition-colors peer placeholder-transparent"
              placeholder="Email"
              id="login-email"
              value={loginData.email}
              onChange={handleLoginChange}
              required
              disabled={isLoading}
            />
            <label
              htmlFor="login-email"
              className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground transition-all peer-placeholder-shown:text-base peer-focus:text-xs peer-focus:top-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:top-2 bg-background px-1"
            >
              Email *
            </label>
          </div>
          <div className="relative">
            <input
              type={showLoginPassword ? "text" : "password"}
              className="w-full px-5 py-3.5 rounded-full border border-border focus:border-primary outline-none transition-colors peer placeholder-transparent pr-12"
              placeholder="Password"
              id="login-password"
              value={loginData.password}
              onChange={handleLoginChange}
              required
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowLoginPassword(!showLoginPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showLoginPassword ? (
                <EyeOff className="size-5" />
              ) : (
                <Eye className="size-5" />
              )}
            </button>
            <label
              htmlFor="login-password"
              className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground transition-all peer-placeholder-shown:text-base peer-focus:text-xs peer-focus:top-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:top-2 bg-background px-1"
            >
              Password *
            </label>
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setCurrentView("forgot-password")}
              className="text-primary font-semibold text-sm hover:underline"
              disabled={isLoading}
            >
              Forgot Your Password?
            </button>
          </div>
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-14 rounded-full font-bold bg-primary text-primary-foreground hover:bg-primary-dark shadow-lg shadow-primary/20 active:scale-[0.98] mt-2"
          >
            {isLoading ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              "Sign In"
            )}
          </Button>
        </form>
        <div className="text-center mt-4 text-sm font-medium">
          Don&apos;t have an account?{" "}
          <button
            onClick={() => setCurrentView("register")}
            className="text-primary font-bold hover:underline"
            disabled={isLoading}
          >
            Create Account
          </button>
        </div>
      </div>
    </div>
  );

  const renderRegisterView = () => (
    <div
      key="register"
      className="flex flex-col gap-y-8 animate-in fade-in slide-in-from-right-4 duration-300 w-full"
    >
      <div className="flex justify-center">
        <img
          src="/images/authentication/register-illustration.png"
          alt="register"
          className="max-w-[200px] mx-auto"
        />
      </div>
      <div className="flex flex-col gap-y-6 w-full">
        <form onSubmit={handleRegister} className="flex flex-col gap-y-4">
          <div className="grid grid-cols-2 gap-x-4">
            <div className="relative">
              <input
                type="text"
                className="w-full px-5 py-3.5 rounded-full border border-border focus:border-primary outline-none transition-colors peer placeholder-transparent"
                placeholder="First Name"
                id="first-name"
                value={formData.firstName}
                onChange={handleInputChange}
                required
                disabled={isLoading}
              />
              <label
                htmlFor="first-name"
                className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground transition-all peer-placeholder-shown:text-base peer-focus:text-xs peer-focus:top-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:top-2 bg-background px-1"
              >
                First Name *
              </label>
            </div>
            <div className="relative">
              <input
                type="text"
                className="w-full px-5 py-3.5 rounded-full border border-border focus:border-primary outline-none transition-colors peer placeholder-transparent"
                placeholder="Last Name"
                id="last-name"
                value={formData.lastName}
                onChange={handleInputChange}
                required
                disabled={isLoading}
              />
              <label
                htmlFor="last-name"
                className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground transition-all peer-placeholder-shown:text-base peer-focus:text-xs peer-focus:top-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:top-2 bg-background px-1"
              >
                Last Name *
              </label>
            </div>
          </div>
          <div className="relative">
            <input
              type="email"
              className="w-full px-5 py-3.5 rounded-full border border-border focus:border-primary outline-none transition-colors peer placeholder-transparent"
              placeholder="Email"
              id="register-email"
              value={formData.email}
              onChange={handleInputChange}
              required
              disabled={isLoading}
            />
            <label
              htmlFor="register-email"
              className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground transition-all peer-placeholder-shown:text-base peer-focus:text-xs peer-focus:top-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:top-2 bg-background px-1"
            >
              Email *
            </label>
          </div>
          <div className="relative">
            <input
              type={showRegisterPassword ? "text" : "password"}
              className="w-full px-5 py-3.5 rounded-full border border-border focus:border-primary outline-none transition-colors peer placeholder-transparent pr-12"
              placeholder="Password"
              id="register-password"
              value={formData.password}
              onChange={handleInputChange}
              required
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowRegisterPassword(!showRegisterPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showRegisterPassword ? (
                <EyeOff className="size-5" />
              ) : (
                <Eye className="size-5" />
              )}
            </button>
            <label
              htmlFor="register-password"
              className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground transition-all peer-placeholder-shown:text-base peer-focus:text-xs peer-focus:top-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:top-2 bg-background px-1"
            >
              Password *
            </label>
          </div>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              className="w-full px-5 py-3.5 rounded-full border border-border focus:border-primary outline-none transition-colors peer placeholder-transparent pr-12"
              placeholder="Confirm Password"
              id="confirm-password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showConfirmPassword ? (
                <EyeOff className="size-5" />
              ) : (
                <Eye className="size-5" />
              )}
            </button>
            <label
              htmlFor="confirm-password"
              className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground transition-all peer-placeholder-shown:text-base peer-focus:text-xs peer-focus:top-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:top-2 bg-background px-1"
            >
              Confirm Password *
            </label>
          </div>
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-14 rounded-full font-bold bg-primary text-primary-foreground hover:bg-primary-dark shadow-lg shadow-primary/20 active:scale-[0.98] mt-2"
          >
            {isLoading ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              "Create Account"
            )}
          </Button>
        </form>
        <div className="text-center mt-4 text-sm font-medium">
          Already have an account?{" "}
          <button
            onClick={() => setCurrentView("login")}
            className="text-primary font-bold hover:underline"
            disabled={isLoading}
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );

  const renderForgotPasswordView = () => (
    <div
      key="forgot-password"
      className="flex flex-col gap-y-8 animate-in fade-in slide-in-from-right-4 duration-300"
    >
      <div className="flex justify-center">
        <img
          src="/images/authentication/forgot-password-illustration.png"
          alt="forgot-password"
          className="max-w-[200px]"
        />
      </div>
      <div className="flex flex-col gap-y-6">
        <div className="text-center">
          {/* <p className="text-muted-foreground">
            Enter your email and we&apos;ll send you a code to reset your
            password.
          </p> */}
        </div>
        <form
          className="flex flex-col gap-y-4"
          onSubmit={handleForgotPasswordSubmit}
        >
          <div className="relative">
            <input
              type="email"
              className="w-full px-5 py-3.5 rounded-full border border-border focus:border-primary outline-none transition-colors peer placeholder-transparent"
              placeholder="Email"
              id="forgot-email"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              required
              disabled={isLoading}
            />
            <label
              htmlFor="forgot-email"
              className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground transition-all peer-placeholder-shown:text-base peer-focus:text-xs peer-focus:top-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:top-2 bg-background px-1"
            >
              Email *
            </label>
          </div>
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-14 rounded-full font-bold bg-primary text-primary-foreground hover:bg-primary-dark shadow-lg shadow-primary/20 active:scale-[0.98] mt-2"
          >
            {isLoading ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              "Send Verification Code"
            )}
          </Button>
        </form>
        <div className="mt-4">
          <button
            onClick={() => setCurrentView("login")}
            className="text-primary font-semibold text-sm hover:underline hoverEffect"
            disabled={isLoading}
          >
            Back to Sign in
          </button>
        </div>
      </div>
    </div>
  );

  const renderOtpView = () => (
    <div
      key="otp"
      className="flex flex-col gap-y-8 animate-in fade-in slide-in-from-right-4 duration-300"
    >
      <div className="flex justify-center">
        <img
          src="/images/authentication/otp-verification-illustration.png"
          alt="otp"
          className="max-w-[200px]"
        />
      </div>
      <div className="flex flex-col gap-y-6">
        <div className="text-center">
          <h6 className="font-bold text-lg mb-1">
            Enter the verification code
          </h6>
          <p className="text-muted-foreground text-sm">
            Enter the 6-digit code sent to your email address
          </p>
        </div>
        <div className="flex justify-between gap-x-2">
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <input
              key={index}
              id={`otp-${index}`}
              type="text"
              placeholder="-"
              maxLength={6}
              value={otpValues[index]}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleOtpKeyDown(index, e)}
              disabled={isLoading}
              className="w-full h-14 border border-border rounded-2xl text-center text-xl font-bold focus:border-primary outline-none transition-colors"
            />
          ))}
        </div>
        <div className="text-right">
          <button
            type="button"
            onClick={handleForgotPasswordSubmit}
            disabled={isLoading}
            className="text-primary text-sm font-semibold hover:underline"
          >
            Resend The Code
          </button>
        </div>
        <Button
          onClick={handleOtpSubmit}
          disabled={isLoading || otpValues.join("").length !== 6}
          className="w-full h-14 text-white rounded-full font-bold shadow-lg shadow-primary/20 active:scale-[0.98] mt-2"
        >
          {isLoading ? <Loader2 className="size-5 animate-spin" /> : "Verify"}
        </Button>
        <div className="mt-4">
          <button
            onClick={() => setCurrentView("forgot-password")}
            className="text-primary font-semibold text-sm hover:underline"
          >
            Back to Forgot Password
          </button>
        </div>
      </div>
    </div>
  );

  const renderResetPasswordView = () => (
    <div
      key="reset-password"
      className="flex flex-col gap-y-8 animate-in fade-in slide-in-from-right-4 duration-300"
    >
      <div className="flex justify-center">
        <img
          src="/images/authentication/reset-illustration.png"
          alt="reset"
          className="max-w-[200px]"
        />
      </div>
      <div className="flex flex-col gap-y-6">
        <form
          className="flex flex-col gap-y-4"
          onSubmit={handleResetPasswordSubmit}
        >
          <div className="relative">
            <input
              type="password"
              className="w-full px-5 py-3.5 rounded-full border border-border focus:border-primary outline-none transition-colors peer placeholder-transparent"
              placeholder="New Password"
              id="new-password"
              value={resetPasswordState.password}
              onChange={(e) =>
                setResetPasswordState((prev) => ({
                  ...prev,
                  password: e.target.value,
                }))
              }
              required
              disabled={isLoading}
            />
            <label
              htmlFor="new-password"
              className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground transition-all peer-placeholder-shown:text-base peer-focus:text-xs peer-focus:top-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:top-2 bg-background px-1"
            >
              New Password *
            </label>
          </div>
          <div className="relative">
            <input
              type="password"
              className="w-full px-5 py-3.5 rounded-full border border-border focus:border-primary outline-none transition-colors peer placeholder-transparent"
              placeholder="Confirm Password"
              id="confirm-reset-password"
              value={resetPasswordState.confirmPassword}
              onChange={(e) =>
                setResetPasswordState((prev) => ({
                  ...prev,
                  confirmPassword: e.target.value,
                }))
              }
              required
              disabled={isLoading}
            />
            <label
              htmlFor="confirm-reset-password"
              className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground transition-all peer-placeholder-shown:text-base peer-focus:text-xs peer-focus:top-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:top-2 bg-background px-1"
            >
              Confirm Password *
            </label>
          </div>
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-14 rounded-full font-bold bg-primary text-primary-foreground hover:bg-primary-dark shadow-lg shadow-primary/20 active:scale-[0.98] mt-2"
          >
            {isLoading ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              "Change Password"
            )}
          </Button>
        </form>
        <div className="text-center mt-4">
          <button
            onClick={() => setCurrentView("login")}
            className="text-primary font-bold text-sm hover:underline"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (currentView) {
      case "login":
        return renderLoginView();
      case "register":
        return renderRegisterView();
      case "forgot-password":
        return renderForgotPasswordView();
      case "otp":
        return renderOtpView();
      case "reset-password":
        return renderResetPasswordView();
      default:
        return renderLoginView();
    }
  };

  return (
    <Sheet open={isAuthOpen} onOpenChange={onAuthClose}>
      <SheetContent
        side="right"
        className="flex flex-col w-full sm:max-w-[550px] p-0 border-none rounded-2xl overflow-hidden inset-y-2.5 right-2.5 h-[calc(100vh-20px)] shadow-2xl"
        showCloseButton={false}
      >
        {renderHeader()}
        <div className="flex-1 overflow-y-auto p-8 lg:p-10 flex flex-col">
          <div className="my-auto w-full flex flex-col items-center">
            <div className="w-full max-w-md">{renderContent()}</div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AuthSidebar;
