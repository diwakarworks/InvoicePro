"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { handleRedirectCallback } from "@auth0/auth0-react";

export default function CallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        await handleRedirectCallback();
        router.push("/dashboard"); // or wherever you want after login
      } catch (error) {
        console.error("Auth0 callback error:", error);
        router.push("/error");
      }
    };

    handleCallback();
  }, []);

  return <div>Processing login...</div>;
}
