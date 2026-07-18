"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  oauthService,
  type OAuthUserData,
  type BackendUserData,
} from "@/lib/oauthService";
import useAuthStore from "@/store/useAuthStore";
import { useNavigate } from "react-router";
import { useToast } from "@/hooks/use-toast";
import { getLandingPathForRole } from "@/lib/auth/redirects";
import { getErrorMessage, getErrorStatus } from "@/lib/errors";

interface OAuthButtonProps {
  provider: "google" | "github";
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onSuccess?: (userData: BackendUserData) => void;
  onError?: (error: string) => void;
}

export function OAuthButton({
  provider,
  children,
  className = "",
  disabled = false,
  onSuccess,
  onError,
}: OAuthButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { oAuthLogin } = useAuthStore();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleOAuthSignIn = async () => {
    setIsLoading(true);

    try {
      let oauthUserData: OAuthUserData | null = null;

      // Sign in with the specified provider
      if (provider === "google") {
        oauthUserData = await oauthService.signInWithGoogle();
      }

      if (!oauthUserData) {
        onError?.("OAuth sign in failed");
        return;
      }

      // Convert to backend format
      const backendUserData = oauthService.convertToBackendUser(oauthUserData);

      // Use the store action for OAuth login
      await oAuthLogin(backendUserData);

      // Success callback
      onSuccess?.(backendUserData);

      toast({
        title: "Sign in successful",
        description: `Successfully signed in with ${provider}`,
      });

      // Navigate to role-appropriate landing page
      const role = useAuthStore.getState().user?.role;
      navigate(getLandingPathForRole(role));
    } catch (error: unknown) {
      console.error(`${provider} OAuth error:`, error);

      let errorTitle = "Sign in failed";
      let errorMessage = getErrorMessage(
        error,
        `Failed to sign in with ${provider}`,
      );
      const toastDuration = 7000;
      const statusCode = getErrorStatus(error);

      if (
        statusCode === 409 &&
        errorMessage.includes("already registered using")
      ) {
        errorTitle = "Account Already Exists";
        errorMessage =
          "This email is already registered with another provider. Please use that to sign in.";
      }

      onError?.(errorMessage);

      toast({
        variant: "destructive",
        title: errorTitle,
        description: errorMessage,
        duration: toastDuration,
      });

      // Sign out from Firebase if backend verification failed
      await oauthService.signOut();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      className={`w-full ${className}`}
      disabled={disabled || isLoading}
      onClick={handleOAuthSignIn}
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <svg
            className="animate-spin h-4 w-4 mr-2"
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
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
          Signing in...
        </div>
      ) : (
        children
      )}
    </Button>
  );
}
