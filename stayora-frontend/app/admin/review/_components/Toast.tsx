interface ToastProps {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}

const Toast = ({ message, type, onClose }: ToastProps) => (
  <div
    className={`fixed bottom-6 right-6 z-9999 flex items-center gap-3 px-5 py-3.5 rounded-xl border shadow-2xl
      ${
        type === "success"
          ? "bg-green-50 border-emerald-500/30 text-emerald-600"
          : "bg-red-50 border-red-500/30 text-red-600"
      }`}
    style={{ animation: "slideInToast 0.3s ease" }}
  >
    <span className="font-bold text-base">
      {type === "success" ? "✓" : "✕"}
    </span>
    <span className="text-sm text-gray-700">{message}</span>
    <button
      onClick={onClose}
      className="ml-2 text-gray-300 hover:text-gray-600 transition-colors cursor-pointer bg-transparent border-none text-lg leading-none"
    >
      ×
    </button>
  </div>
);

export default Toast;
