// app/user/booking/verify/page.tsx
"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { handleVerifyKhaltiPayment } from "@/lib/actions/payment-action";

function VerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "failed">(
    "loading",
  );

  useEffect(() => {
    const pidx = searchParams.get("pidx");
    const paymentStatus = searchParams.get("status");
    const transactionId = searchParams.get("transaction_id");

    console.log("pidx:", pidx);
    console.log("paymentStatus:", paymentStatus);
    console.log("transactionId:", transactionId);

    // User cancelled
    if (paymentStatus === "User canceled") {
      setStatus("failed");
      return;
    }

    if (!pidx) {
      setStatus("failed");
      return;
    }

    const verify = async () => {
      try {
        const data = await handleVerifyKhaltiPayment(pidx);
        console.log("Verify response:", data);

        if (data.success) {
          setStatus("success");
          setTimeout(() => router.push("/user/booking/history"), 2500);
        } else {
          setStatus("failed");
        }
      } catch (err) {
        console.error("Verify error:", err);
        setStatus("failed");
      }
    };

    verify();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-[#faf7f2] flex items-center justify-center font-heading"
    >
      {status === "loading" && (
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-2 border-[#059669] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-[#6b7280] text-sm tracking-[0.1em] uppercase">
            Verifying payment...
          </p>
        </div>
      )}

      {status === "success" && (
        <div className="text-center space-y-3">
          <p className="text-[#059669] text-[9px] tracking-[0.2em] uppercase">
            Payment Confirmed
          </p>
          <h2 className="text-white text-3xl font-bold uppercase">
            Booking Successful 🎉
          </h2>
          <p className="text-[#6b7280] text-sm">
            Redirecting to your bookings...
          </p>
        </div>
      )}

      {status === "failed" && (
        <div className="text-center space-y-3">
          <p className="text-[#059669] text-[9px] tracking-[0.2em] uppercase">
            Payment Failed
          </p>
          <h2 className="text-white text-3xl font-bold uppercase">
            Something Went Wrong
          </h2>
          <p className="text-[#6b7280] text-sm mb-4">
            Your payment was not completed.
          </p>
          <button
            onClick={() => router.back()}
            className="border border-[#059669] text-[#059669] text-[11px] tracking-[0.18em] uppercase px-6 py-3 hover:bg-[#059669] hover:text-white transition-all rounded"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#faf7f2] flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-[#059669] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}
