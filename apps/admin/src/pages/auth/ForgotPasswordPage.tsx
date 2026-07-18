import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Key, Mail, ShieldCheck } from "lucide-react";
import api from "@/lib/api";

type ResetStep = "email" | "otp" | "reset";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<ResetStep>("email");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  // Form States
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [resetToken, setResetToken] = useState(""); // Internal token received after verifying OTP
  const [otpStringVal, setOtpStringVal] = useState(""); 

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMessage("Please enter your email address.");
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage("");
      // Call endpoint. It checks if user exists.
      await api.post("/auth/forgot-password", { email });
      toast({
        title: "OTP Sent",
        description: "Please check your inbox for the 6-digit code.",
      });
      setStep("otp");
    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.message || "Failed to send reset email. Verify your email is correct."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value[0];
    const newOtp = [...otpCode];
    newOtp[index] = value;
    setOtpCode(newOtp);

    // Auto focus next input
    if (value !== "" && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otpCode[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpString = otpCode.join("");
    if (otpString.length < 6) {
      setErrorMessage("Please complete the 6-digit OTP.");
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage("");
      // Call verify endpoint passing the token mapped variable natively
      const response = await api.post("/auth/verify-otp", {
        token: otpString,
      });
      
      // Assume success returns a temporary token to proceed
      if (response.data.success) {
        setResetToken(response.data.resetToken);
        setOtpStringVal(otpString); // sometimes APIs just require passing the OTP string back
        toast({
          title: "OTP Verified",
          description: "You may now set a new password.",
        });
        setStep("reset");
      }
    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.message || "Invalid or expired OTP."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage("");
      
      await api.post("/auth/reset-password", {
        token: resetToken || otpStringVal, // pass whichever backend validates mapped from verify endpoint
        password: newPassword,
      });

      toast({
        title: "Password Reset Successful",
        description: "You can now log in with your new password.",
      });
      navigate("/login");
    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.message || "Failed to reset password."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-primary-dark relative overflow-hidden font-urbanist">
      {/* Abstract Background Waves (from LoginPage) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
        <svg
          className="absolute w-[150%] h-[150%] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mix-blend-overlay text-primary-light"
          viewBox="0 0 1000 1000"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g fill="none" stroke="currentColor" strokeWidth="1">
            <path d="M-500,500 C0,200 500,800 1500,500" strokeWidth="2" opacity="0.3" />
            <path d="M-500,450 C0,150 500,750 1500,450" opacity="0.4" />
            <path d="M-500,550 C0,250 500,850 1500,550" opacity="0.5" />
            <path d="M-500,600 C0,300 500,900 1500,600" opacity="0.6" />
            <path d="M-500,650 C0,350 500,950 1500,650" opacity="0.7" />
            <path d="M-500,700 C0,400 500,1000 1500,700" opacity="0.8" />
            <path d="M-500,750 C0,450 500,1050 1500,750" opacity="0.9" />
            <path d="M-500,800 C0,500 500,1100 1500,800" opacity="1" />
          </g>
        </svg>
      </div>

      <div className="w-full max-w-[540px] px-4 relative z-10 my-8">
        <div className="w-full bg-card rounded-[24px] shadow-2xl p-8 sm:p-12 md:px-14 flex flex-col items-center border border-border transition-all duration-500">
          
          <div className="w-full flex justify-center items-center mb-6">
            <img src="/logo.png" alt="Sellzy Logo" className="h-[46px] w-auto object-contain" />
          </div>

          <div className="relative mb-6">
            <div className="w-[100px] h-[100px] bg-primary-dark/5 rounded-full flex items-center justify-center relative z-10 border border-primary/20">
              {step === "email" && <Mail className="size-10 text-primary" />}
              {step === "otp" && <ShieldCheck className="size-10 text-primary" />}
              {step === "reset" && <Key className="size-10 text-primary" />}
            </div>
            {/* Decorative dots/leaves */}
            <svg className="absolute -top-4 -right-6 w-6 h-6 text-primary-lighter" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C12 2 15 8 20 10C15 12 12 18 12 18C12 18 9 12 4 10C9 8 12 2 12 2Z"/></svg>
            <div className="absolute top-8 -left-6 w-3 h-3 bg-primary-lighter rounded-full opacity-60"></div>
          </div>

          <h1 className="text-[28px] font-bold text-card-foreground mb-2 text-center">
            {step === "email" && "Forgot Password"}
            {step === "otp" && "Verify OTP"}
            {step === "reset" && "Set New Password"}
          </h1>
          <p className="text-[14px] text-muted-foreground text-center mb-8 px-2 leading-relaxed">
            {step === "email" && "Enter your registered email address and we'll send you a 6-digit security code."}
            {step === "otp" && `We've sent a 6-digit confirmation code to ${email}. Please enter it below.`}
            {step === "reset" && "Your identity has been verified. Please create a strong new password."}
          </p>

          {errorMessage && (
            <div className="w-full bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm mb-6 animate-in fade-in zoom-in-95">
              <p className="flex items-center gap-2">
                <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {errorMessage}
              </p>
            </div>
          )}

          <div className="w-full">
            {/* STEP 1: EMAIL */}
            {step === "email" && (
              <form onSubmit={handleEmailSubmit} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-2">
                  <Input
                    placeholder="Admin Email Address"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    className="h-13 py-3 border-border bg-card focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 rounded-xl placeholder:text-muted-foreground text-card-foreground shadow-sm px-4"
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full h-13 bg-primary hover:bg-primary-dark text-primary-foreground font-semibold rounded-xl transition-all shadow-md mt-6"
                >
                  {isLoading ? "Checking Status..." : "Send Reset Code"}
                </Button>
              </form>
            )}

            {/* STEP 2: OTP */}
            {step === "otp" && (
              <form onSubmit={handleOtpSubmit} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex justify-between gap-2 max-w-sm mx-auto">
                  {otpCode.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (otpRefs.current[index] = el)}
                      className="w-12 h-14 text-center border border-border bg-card focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary rounded-xl text-xl font-bold shadow-sm transition-all text-card-foreground"
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      disabled={isLoading}
                    />
                  ))}
                </div>
                <Button 
                  type="submit" 
                  disabled={isLoading || otpCode.join("").length < 6}
                  className="w-full h-13 bg-primary hover:bg-primary-dark text-primary-foreground font-semibold rounded-xl transition-all shadow-md"
                >
                  {isLoading ? "Verifying..." : "Verify Code"}
                </Button>
                <div className="text-center">
                  <button 
                    type="button" 
                    onClick={() => setStep("email")}
                    className="text-sm text-primary hover:underline font-semibold"
                  >
                    Change Email Address
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: RESET */}
            {step === "reset" && (
              <form onSubmit={handleResetSubmit} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="relative">
                  <Input
                    placeholder="New Password"
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={isLoading}
                    className="h-13 py-3 border-border bg-card focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 rounded-xl pr-12 placeholder:text-muted-foreground text-card-foreground shadow-sm px-4"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-card-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                  </button>
                </div>
                <div className="relative">
                  <Input
                    placeholder="Confirm New Password"
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                    className="h-13 py-3 border-border bg-card focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 rounded-xl pr-12 placeholder:text-muted-foreground text-card-foreground shadow-sm px-4"
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full h-13 bg-primary hover:bg-primary-dark text-primary-foreground font-semibold rounded-xl transition-all shadow-md mt-6"
                >
                  {isLoading ? "Saving changes..." : "Save Password"}
                </Button>
              </form>
            )}
          </div>

          <div className="w-full flex items-center gap-4 mb-6 mt-8 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center w-full">
              <span className="bg-card px-4 text-xs tracking-wider text-muted-foreground uppercase">
                Return
              </span>
            </div>
          </div>

          <div className="text-center text-sm font-medium">
            <Link to="/login" className="font-bold text-primary hover:text-primary-dark transition-colors hover:underline flex items-center justify-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
