type BadgeVariant = "default" | "gold" | "success" | "danger";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-gray-100 text-gray-600 border-gray-200",
  gold: "bg-amber-50 text-[#059669] border-[#059669]/30",
  success: "bg-green-50 text-emerald-600 border-emerald-200",
  danger: "bg-red-50 text-red-600 border-red-200",
};

const Badge = ({ children, variant = "default" }: BadgeProps) => (
  <span
    className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-medium border whitespace-nowrap tracking-wide ${variantClasses[variant]}`}
  >
    {children}
  </span>
);

export default Badge;
