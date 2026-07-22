"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "react-toastify";

export default function OAuthToast() {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("from") === "oauth") {
      // Small delay to let the page render before showing the toast
      const timer = setTimeout(() => {
        toast.success("Signed in with Google successfully!", {
          autoClose: 4000,
        });
      }, 500);

      // Clean up the URL param so it doesn't re-trigger on navigation
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, "", cleanUrl);

      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  return null;
}
