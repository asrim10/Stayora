import Link from "next/link";
import { handleGetAllHotels } from "@/lib/actions/admin/hotel-action";
import HotelCards from "./_components/HotelCard";

export const dynamic = 'force-dynamic';

export default async function Page() {
  const response = await handleGetAllHotels("1", "100");

  if (!response.success) {
    throw new Error(response.message || "Failed to load hotels");
  }

  return (
    <div className="min-h-screen bg-[#faf7f2]">
      <div className="border-b border-gray-200 px-12 py-12 flex items-end justify-between">
        <div>
          <p className="text-[#059669] text-[10px] tracking-[0.22em] uppercase mb-3">
            Admin Panel
          </p>
          <h1 className="text-gray-900 font-bold uppercase leading-tight m-0 text-5xl font-heading">
            Hotels
          </h1>
        </div>
        <Link
          href="/admin/hotels/create"
          className="bg-[#059669] text-white text-[11px] font-bold tracking-[0.18em] uppercase px-8 py-3.5 hover:opacity-90 transition-opacity no-underline"
        >
          + Create Hotel
        </Link>
      </div>
      <HotelCards hotels={response.data || []} />
    </div>
  );
}
