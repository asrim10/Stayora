"use client";

import { Download } from "lucide-react";
import { exportUserData } from "@/lib/api/auth";
import { useState } from "react";

export default function DataExportButton() {
  const [exporting, setExporting] = useState<"json" | "csv" | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleExport = async (format: "json" | "csv") => {
    setExporting(format);
    setMessage(null);

    try {
      const response = await exportUserData(format);

      // Trigger browser download from the blob response
      const blob = new Blob([response.data], {
        type:
          format === "csv"
            ? "text/csv"
            : "application/json",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `stayora-my-data.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      setMessage("Download started!");
    } catch (error: any) {
      setMessage(error.message || "Export failed");
    }

    setExporting(null);
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className="relative inline-flex items-center gap-2">
      <div className="flex rounded-lg border border-gray-300 overflow-hidden">
        <button
          onClick={() => handleExport("json")}
          disabled={exporting !== null}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white text-sm text-gray-500 uppercase tracking-widest hover:bg-gray-50 hover:text-gray-700 transition-all disabled:opacity-50 disabled:cursor-wait border-r border-gray-300"
        >
          <Download size={14} />
          {exporting === "json" ? "..." : "JSON"}
        </button>
        <button
          onClick={() => handleExport("csv")}
          disabled={exporting !== null}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white text-sm text-gray-500 uppercase tracking-widest hover:bg-gray-50 hover:text-gray-700 transition-all disabled:opacity-50 disabled:cursor-wait"
        >
          <Download size={14} />
          {exporting === "csv" ? "..." : "CSV"}
        </button>
      </div>

      {message && (
        <span className="absolute -bottom-6 left-0 text-xs text-green-600 whitespace-nowrap animate-fadeIn">
          {message}
        </span>
      )}
    </div>
  );
}
