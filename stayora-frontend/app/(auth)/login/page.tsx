"use client";

import { Suspense } from "react";
import LoginPageContent from "./LoginPageContent";

export default function Page() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-10">
        <div className="w-8 h-8 border-2 border-[#059669] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
}
