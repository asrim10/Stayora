"use client";

const AMENITY_OPTIONS = [
  "Free Wi-Fi",
  "Free Parking",
  "Swimming Pool",
  "Restaurant",
  "Gym",
  "Spa",
  "Air Conditioning",
];

const selCls =
  "bg-white border border-gray-300 text-gray-500 text-xs px-3 py-2.5 outline-none focus:border-[#059669] transition-colors cursor-pointer rounded";
const inputCls =
  "w-full bg-white border border-gray-300 text-gray-900 text-xs px-3 py-2.5 outline-none focus:border-[#059669] transition-colors placeholder:text-gray-400 rounded";
const labelCls =
  "block text-[#059669] text-[9px] tracking-[0.16em] uppercase mb-2";

export default function HotelFilters({
  filters,
  onChange,
  onClose,
}: {
  filters: any;
  onChange: (f: any) => void;
  onClose: () => void;
}) {
  const toggleAmenity = (a: string) => {
    const current = filters.amenities || [];
    onChange({
      ...filters,
      amenities: current.includes(a)
        ? current.filter((x: string) => x !== a)
        : [...current, a],
    });
  };

  const reset = () =>
    onChange({
      minPrice: "",
      maxPrice: "",
      rating: "",
      amenities: [],
      sortBy: "default",
    });

  return (
    <div className="px-12 py-6 bg-white border-b border-gray-200">
      <div className="grid grid-cols-5 gap-6 items-end">
        {/* Min Price */}
        <div>
          <label className={labelCls}>Min Price (Rs.)</label>
          <input
            type="number"
            placeholder="0"
            value={filters.minPrice}
            onChange={(e) => onChange({ ...filters, minPrice: e.target.value })}
            className={inputCls}
          />
        </div>

        {/* Max Price */}
        <div>
          <label className={labelCls}>Max Price (Rs.)</label>
          <input
            type="number"
            placeholder="Any"
            value={filters.maxPrice}
            onChange={(e) => onChange({ ...filters, maxPrice: e.target.value })}
            className={inputCls}
          />
        </div>

        {/* Rating */}
        <div>
          <label className={labelCls}>Min Rating</label>
          <select
            value={filters.rating}
            onChange={(e) => onChange({ ...filters, rating: e.target.value })}
            className={selCls + " w-full"}
          >
            <option value="">Any Rating</option>
            <option value="3">3+ Stars</option>
            <option value="4">4+ Stars</option>
            <option value="4.5">4.5+ Stars</option>
          </select>
        </div>

        {/* Sort */}
        <div>
          <label className={labelCls}>Sort By</label>
          <select
            value={filters.sortBy}
            onChange={(e) => onChange({ ...filters, sortBy: e.target.value })}
            className={selCls + " w-full"}
          >
            <option value="default">Default</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>

        {/* Reset */}
        <div className="flex gap-2">
          <button
            onClick={reset}
            className="flex-1 border border-gray-300 text-gray-500 text-[10px] tracking-[0.14em] uppercase py-2.5 bg-white cursor-pointer hover:border-gray-400 hover:text-gray-700 transition-colors rounded"
          >
            Reset
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-[#059669] text-white text-[10px] font-bold tracking-[0.14em] uppercase py-2.5 border-none cursor-pointer hover:opacity-90 transition-opacity rounded"
          >
            Apply
          </button>
        </div>
      </div>

      {/* Amenities */}
      <div className="mt-5 pt-5 border-t border-gray-200">
        <label className={labelCls}>Amenities</label>
        <div className="flex gap-2 flex-wrap">
          {AMENITY_OPTIONS.map((a) => (
            <button
              key={a}
              onClick={() => toggleAmenity(a)}
              className={`text-[10px] tracking-[0.12em] uppercase px-4 py-2 border cursor-pointer transition-colors bg-transparent ${
                filters.amenities?.includes(a)
                  ? "border-[#059669] text-[#059669]"
                  : "border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-700"
              }`}
            >
              {a}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
