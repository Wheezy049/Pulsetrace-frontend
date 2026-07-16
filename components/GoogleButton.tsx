"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import Script from "next/script";
import { Loader2 } from "lucide-react";

interface GoogleButtonProps {
  onSuccess: (idToken: string) => void;
  onError: (error: string) => void;
  isLoading?: boolean;
}

interface GoogleCredentialResponse {
  credential?: string;
}

interface GoogleAccountsId {
  initialize: (options: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
  }) => void;
  renderButton: (
    element: HTMLElement,
    options: {
      theme: string;
      size: string;
      width: string;
      text: string;
      shape: string;
      logo_alignment?: "left" | "center";
    }
  ) => void;
}

interface GoogleAccounts {
  id: GoogleAccountsId;
}

declare global {
  interface Window {
    google?: {
      accounts: GoogleAccounts;
    };
  }
}

export default function GoogleButton({ onSuccess, onError, isLoading }: GoogleButtonProps) {
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);

  const handleCredentialResponse = useCallback((response: GoogleCredentialResponse) => {
    if (response.credential) {
      onSuccess(response.credential);
    } else {
      onError("Google Authentication failed: No credential returned");
    }
  }, [onSuccess, onError]);

  const initializeGoogleSignIn = useCallback(() => {
    if (typeof window !== "undefined" && window.google) {
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      if (!clientId) {
        console.error("[Google SDK] Error: NEXT_PUBLIC_GOOGLE_CLIENT_ID environment variable is missing.");
        onError("Google Sign-In configuration error: Missing Client ID");
        return;
      }

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
      });

      if (buttonRef.current) {
        window.google.accounts.id.renderButton(
          buttonRef.current,
          {
            theme: "outline",
            size: "large",
            width: "340", // Match the standard width of standard form cards
            text: "continue_with", // Displays "Continue with Google"
            shape: "rectangular",
            logo_alignment: "center", // Align logo and text close together in the center
          }
        );
      }
    }
  }, [handleCredentialResponse, onError]);

  useEffect(() => {
    let timerId: ReturnType<typeof setTimeout> | undefined;

    // If the script is already loaded (e.g. from visiting previous pages), initialize immediately
    if (typeof window !== "undefined" && window.google) {
      setScriptLoaded(true);
      timerId = setTimeout(() => {
        initializeGoogleSignIn();
      }, 100); // 100ms delay ensures DOM is fully stable after page transitions/redirects
    } else if (scriptLoaded) {
      timerId = setTimeout(() => {
        initializeGoogleSignIn();
      }, 100);
    }

    return () => {
      if (timerId) {
        clearTimeout(timerId);
      }
    };
  }, [scriptLoaded, initializeGoogleSignIn]);

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        onLoad={() => setScriptLoaded(true)}
        strategy="beforeInteractive" // Load script early to display the button instantly
      />
      <div className="relative w-full flex justify-center">
        {isLoading && (
          <div className="absolute inset-0 bg-zinc-950/70 z-10 flex items-center justify-center rounded-md border border-zinc-800">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        )}
        <div ref={buttonRef} className="w-full flex justify-center min-h-[44px]" />
      </div>
    </>
  );
}