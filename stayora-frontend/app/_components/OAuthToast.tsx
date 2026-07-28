"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "react-toastify";

function OAuthToastContent() {
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

export default function OAuthToast() {
  return (
    <Suspense fallback={null}>
      <OAuthToastContent />
    </Suspense>
  );
}
