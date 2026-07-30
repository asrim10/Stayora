interface StatCardProps {
  label: string;
  value: string | number;
  change?: string;
  positive?: boolean;
  icon: string;
  accent?: string;
  sub?: string;
}

export function StatCard({
  label,
  value,
  change,
  positive = true,
  icon,
  accent = "#059669",
  sub,
}: StatCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 group hover:border-gray-300 transition-all duration-300 shadow-sm">
      <div
        className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-[0.06] blur-2xl group-hover:opacity-[0.1] transition-opacity duration-500"
        style={{ background: accent }}
      />
      <div className="flex items-start justify-between mb-5">
        <span className="text-2xl">{icon}</span>
        {change && (
          <span
            className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${positive ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/10" : "text-red-400 border-red-500/20 bg-red-500/10"}`}
          >
            {positive ? "↑" : "↓"} {change}
          </span>
        )}
      </div>
      <p className="text-[11px] uppercase tracking-[0.15em] text-gray-500 mb-2">
        {label}
      </p>
      <p
        className="text-[42px] font-bold leading-none text-gray-900 mb-1"
        style={{ fontFamily: "'Cormorant Garamond', serif" }}
      >
        {value}
      </p>
      {sub && <p className="text-xs text-gray-500 mt-2">{sub}</p>}
      <div className="mt-4 h-px w-10" style={{ background: accent }} />
    </div>
  );
}

interface OverviewItem {
  label: string;
  value: string | number;
  accent?: string;
  icon?: string;
}

export function OverviewStrip({ items }: { items: OverviewItem[] }) {
  return (
    <div className="rounded-2xl border border-gray-200 overflow-hidden bg-white shadow-sm">
      <div
        className="grid divide-x divide-gray-100"
        style={{ gridTemplateColumns: `repeat(${items.length}, 1fr)` }}
      >
        {items.map((item) => (
          <div key={item.label} className="px-6 py-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] uppercase tracking-[0.15em] text-gray-500">
                {item.label}
              </span>
              {item.icon && (
                <span className="text-gray-400 opacity-60 text-base">
                  {item.icon}
                </span>
              )}
            </div>
            <p
              className="text-[44px] font-bold leading-none text-gray-900"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              {item.value}
            </p>
            <div
              className="mt-3 h-0.5 w-8 rounded-full"
              style={{ background: item.accent || "#059669" }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
