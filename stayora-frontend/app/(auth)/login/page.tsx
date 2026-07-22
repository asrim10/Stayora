"use client";

import { Suspense } from "react";
import LoginPageContent from "./LoginPageContent";

export default function Page() {
  return (
    <Suspense fallback={
      <div className="space-y-6 w-full">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">Welcome Back!!!</h1>
          <p className="mt-1 text-sm text-foreground/70">Loading...</p>
        </div>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
}
