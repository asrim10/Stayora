interface BookingTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const TABS = [
  { key: "all", label: "All Bookings" },
  { key: "upcoming", label: "Upcoming" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

export default function BookingTabs({
  activeTab,
  onTabChange,
}: BookingTabsProps) {
  return (
    <div className="flex border-b border-gray-200 mb-8">
      {TABS.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          className={`text-[10px] tracking-[0.16em] uppercase px-6 py-4 border-none bg-transparent cursor-pointer transition-colors whitespace-nowrap border-b-2 ${
            activeTab === tab.key
              ? "text-[#059669] border-[#059669]"
              : "text-gray-400 border-transparent hover:text-gray-600"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
