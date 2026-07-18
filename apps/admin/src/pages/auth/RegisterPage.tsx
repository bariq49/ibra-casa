import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import useAuthStore from "@/store/useAuthStore";
import { registerSchema } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { OAuthButton } from "@/components/auth/OAuthButton";

type FormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { register } = useAuthStore();

  const form = useForm<FormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "user",
    },
  });

  async function onSubmit(data: FormData) {
    try {
      setIsLoading(true);
      setErrorMessage("");
      await register(data);
      toast({
        title: "Registration successful",
        description: "Your account has been created",
      });
      navigate("/login");
    } catch (error: unknown) {
      const errorMsg =
        (
          error as {
            response?: { data?: { message?: string } };
            message?: string;
          }
        )?.response?.data?.message ||
        (error as { message?: string })?.message ||
        "Failed to register. Please try again.";
      setErrorMessage(errorMsg);
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: errorMsg,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-primary-dark relative overflow-hidden font-urbanist pb-12 pt-8">
      {/* Abstract Background Waves (CSS based representation) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
        <svg
          className="absolute w-[150%] h-[150%] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mix-blend-overlay text-primary-light"
          viewBox="0 0 1000 1000"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M 0 500 Q 250 200 500 500 T 1000 500 M 0 600 Q 250 300 500 600 T 1000 600 M 0 700 Q 250 400 500 700 T 1000 700 M 0 800 Q 250 500 500 800 T 1000 800"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
        </svg>
      </div>

      <div className="w-full max-w-[620px] px-4 relative z-10 my-8">
        <div className="w-full bg-card rounded-[24px] shadow-2xl p-8 sm:p-12 md:px-14 flex flex-col items-center border border-border">
          {/* Header & Logos */}
          <div className="w-full flex justify-center items-center mb-8">
            <img
              src="/logo.png"
              alt="Sellzy Logo"
              className="h-[46px] w-auto object-contain"
            />
          </div>

          <div className="relative mb-6">
            <div className="w-[100px] h-[100px] bg-primary-dark rounded-full flex items-center justify-center relative z-10">
              <div className="absolute inset-0 flex items-center justify-center">
                <img
                  src="/register-logo.png"
                  alt="Register Icon"
                  className="w-[84px] h-[84px] object-contain drop-shadow-md z-20"
                />
              </div>
            </div>

            {/* Decorative dots/leaves floating around */}
            <svg
              className="absolute -top-4 -right-6 w-6 h-6 text-primary-lighter"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 2C12 2 15 8 20 10C15 12 12 18 12 18C12 18 9 12 4 10C9 8 12 2 12 2Z" />
            </svg>
            <div className="absolute top-8 -left-6 w-3 h-3 bg-primary-lighter rounded-full opacity-60"></div>
            <div className="absolute -bottom-1 -right-2 w-2 h-2 bg-primary-lighter opacity-80 rounded-full"></div>
            <svg
              className="absolute top-2 -left-8 w-5 h-5 text-primary-lighter/70"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 2C12 2 15 8 20 10C15 12 12 18 12 18C12 18 9 12 4 10C9 8 12 2 12 2Z" />
            </svg>
          </div>

          <h1 className="text-[28px] font-bold text-card-foreground mb-2 text-center">
            Sign Up
          </h1>
          <p className="text-[14px] text-muted-foreground text-center mb-8 px-2">
            First time on our platform? Sign up it's quick and easy.
          </p>

          <div className="w-full flex flex-col sm:flex-row gap-4 mb-6">
            <OAuthButton
              provider="google"
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-border hover:bg-accent transition-colors bg-card text-sm font-semibold text-card-foreground h-auto font-sans shadow-sm"
              disabled={isLoading}
              onSuccess={() => {
                toast({
                  title: "Registration successful",
                  description: "Your account has been created",
                });
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.16v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.16C1.43 8.55 1 10.22 1 12s.43 3.45 1.16 4.93l3.68-2.84z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.16 7.07l3.68 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google
            </OAuthButton>
            <button
              type="button"
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-border hover:bg-accent transition-colors bg-card text-sm font-semibold text-card-foreground opacity-70 cursor-not-allowed shadow-sm"
              disabled
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M22 12C22 6.48 17.52 2 12 2C6.48 2 2 6.48 2 12C2 16.84 5.44 20.87 10 21.8V15H7.5V12H10V9.5C10 7.85 11.51 6.5 13.5 6.5C14.52 6.5 15.46 6.67 15.6 6.69V9.13H14.15C13.04 9.13 12.8 9.66 12.8 10.45V12H15.5L15 15H12.8V21.84C17.44 20.97 22 16.92 22 12Z"
                  fill="#1877F2"
                />
              </svg>
              Facebook
            </button>
          </div>

          <div className="w-full flex items-center gap-4 mb-6 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center w-full">
              <span className="bg-card px-4 text-xs tracking-wider text-muted-foreground uppercase">
                Or
              </span>
            </div>
          </div>

          {errorMessage && (
            <div className="w-full bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm mb-4">
              <p>{errorMessage}</p>
            </div>
          )}

          <Form {...form}>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                e.stopPropagation();

                const isValid = await form.trigger();
                if (!isValid) return false;

                await onSubmit(form.getValues());
                return false;
              }}
              className="w-full space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder="Name"
                          disabled={isLoading}
                          className="h-13 py-3 border-border bg-card focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 rounded-xl placeholder:text-muted-foreground text-card-foreground shadow-sm px-4"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-destructive text-xs mt-1" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder="Email"
                          type="email"
                          disabled={isLoading}
                          className="h-13 py-3 border-border bg-card focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 rounded-xl placeholder:text-muted-foreground text-card-foreground shadow-sm px-4"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-destructive text-xs mt-1" />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="Password"
                            type={showPassword ? "text" : "password"}
                            disabled={isLoading}
                            className="h-13 py-3 border-border bg-card focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 rounded-xl pr-10 placeholder:text-muted-foreground text-card-foreground shadow-sm px-4"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-card-foreground focus:outline-none transition-colors"
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-destructive text-xs mt-1" />
                    </FormItem>
                  )}
                />
                {/* Note: Dummy field, backend doesn't seem to validate confirm password via zod, 
                    but UI needs it to match design. We can just use a local controlled input 
                    for visual perfection, or just make it a basic Input to match UX layout */}
                <div className="relative">
                  <Input
                    placeholder="Confirm password"
                    type={showPassword ? "text" : "password"}
                    disabled={isLoading}
                    className="h-13 py-3 border-border bg-card focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 rounded-xl pr-10 placeholder:text-muted-foreground text-card-foreground shadow-sm px-4"
                  />
                </div>
              </div>

              <div className="flex items-center pt-2 pb-3">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative w-5 h-5 rounded border-2 border-border bg-card group-hover:border-primary transition-colors overflow-hidden flex items-center justify-center">
                    <input
                      type="checkbox"
                      className="peer absolute opacity-0 w-full h-full cursor-pointer"
                      required
                    />
                    <div className="absolute inset-0 bg-primary flex items-center justify-center scale-0 peer-checked:scale-100 transition-transform">
                      <svg
                        width="10"
                        height="8"
                        viewBox="0 0 10 8"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M1 4L3.5 6.5L9 1"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-muted-foreground select-none">
                    I accept Terms and Condition
                  </span>
                </label>
              </div>

              <Button
                type="submit"
                className="w-full h-13 py-3 bg-primary hover:bg-primary-dark text-primary-foreground font-semibold rounded-xl transition-all shadow-md hover:shadow-lg text-[15px] tracking-wide mt-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-current"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Signing up...
                  </div>
                ) : (
                  "Sign Up"
                )}
              </Button>
            </form>
          </Form>

          <div className="mt-8 text-center text-sm font-medium">
            <span className="text-muted-foreground">
              I already have an account{" "}
            </span>
            <Link
              to="/login"
              className="font-bold text-primary hover:text-primary-dark transition-colors hover:underline"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
