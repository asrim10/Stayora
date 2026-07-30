import { Calendar } from "lucide-react";

export default function EmptyState() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Calendar className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold mb-2 text-gray-900">
        No bookings found
      </h3>
      <p className="text-gray-500">Try adjusting your search or filters</p>
    </div>
  );
}
