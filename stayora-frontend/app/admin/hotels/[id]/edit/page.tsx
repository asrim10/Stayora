"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";
import {
  handleGetOneHotel,
  handleUpdateHotel,
} from "@/lib/actions/admin/hotel-action";
import { HotelEditData, HotelEditSchema } from "../../schema";
import Link from "next/link";

const inputCls =
  "w-full bg-white border border-gray-300 text-gray-900 text-sm px-5 py-3.5 outline-none focus:border-[#059669] transition-colors placeholder:text-gray-400 box-border rounded";
const labelCls =
  "block text-[#059669] text-[9px] tracking-[0.2em] uppercase mb-2.5 pt-3.5";
const errCls = "text-[#f87171] text-[11px] mt-1.5";
const rowCls =
  "grid grid-cols-[1fr_2fr] gap-12 py-8 border-b border-gray-200 items-start";

export default function EditHotelPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<HotelEditData>({
    resolver: zodResolver(HotelEditSchema),
    defaultValues: {
      hotelName: "",
      address: "",
      city: "",
      country: "",
      rating: 0,
      description: "",
      price: 0,
      availableRooms: 0,
      image: undefined,
    },
  });

  const watchedImage = watch("image");

  useEffect(() => {
    if (watchedImage instanceof File) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(watchedImage);
    }
  }, [watchedImage]);

  useEffect(() => {
    const fetchHotel = async () => {
      try {
        setFetching(true);
        const response = await handleGetOneHotel(id);
        if (response.success) {
          const hotel = response.data;
          setValue("hotelName", hotel?.hotelName || "");
          setValue("address", hotel?.address || "");
          setValue("city", hotel?.city || "");
          setValue("country", hotel?.country || "");
          setValue("rating", hotel?.rating || 0);
          setValue("description", hotel?.description || "");
          setValue("price", hotel?.price || 0);
          setValue("availableRooms", hotel?.availableRooms || 0);
          if (hotel?.imageUrl)
            setImagePreview(
              (process.env.NEXT_PUBLIC_API_BASE_URL || "") + hotel.imageUrl,
            );
        } else toast.error(response.message || "Failed to fetch hotel");
      } catch (err: any) {
        toast.error(err.message || "Something went wrong");
      } finally {
        setFetching(false);
      }
    };
    if (id) fetchHotel();
  }, [id, setValue]);

  const onSubmit = async (data: HotelEditData) => {
    try {
      setLoading(true);
      const formData = new FormData();
      if (data.hotelName) formData.append("hotelName", data.hotelName);
      if (data.address) formData.append("address", data.address);
      if (data.city) formData.append("city", data.city);
      if (data.country) formData.append("country", data.country);
      if (data.rating !== undefined)
        formData.append("rating", String(data.rating));
      if (data.description) formData.append("description", data.description);
      if (data.price !== undefined)
        formData.append("price", String(data.price));
      if (data.availableRooms !== undefined)
        formData.append("availableRooms", String(data.availableRooms));
      if (data.image) formData.append("image", data.image);
      const response = await handleUpdateHotel(id, formData);
      if (response.success) {
        toast.success("Hotel updated!");
        router.push("/admin/hotels");
      } else toast.error(response.message || "Update failed");
    } catch (err: any) {
      toast.error(err.message || "Update hotel failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf7f2]">


      <div className="border-b border-gray-200 px-12 py-12 flex items-end justify-between">
        <div>
          <p className="text-[#059669] text-[10px] tracking-[0.22em] uppercase mb-3">
            Admin Panel
          </p>
          <h1 className="text-gray-900 text-4xl font-bold uppercase leading-tight m-0 font-heading">
            Edit Hotel
          </h1>
        </div>
        <Link
          href="/admin/hotels"
          className="border border-gray-300 text-gray-500 text-[11px] tracking-[0.14em] uppercase px-6 py-3 hover:border-gray-400 hover:text-gray-700 transition-colors no-underline rounded"
        >
          ← Back
        </Link>
      </div>

      {fetching ? (
        <div className="flex items-center justify-center py-32">
          <p className="text-[#3a3a3a] text-[10px] tracking-[0.2em] uppercase">
            Loading hotel details...
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="px-12 py-12">
          <div className="mb-12">
            <p className="text-gray-400 text-[9px] tracking-[0.2em] uppercase mb-6">
              Hotel Image
            </p>
            <div className="w-full h-50 bg-gray-100 border border-gray-200 overflow-hidden mb-4 relative rounded">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <p className="text-gray-400 text-[10px] tracking-[0.2em] uppercase">
                    No Image
                  </p>
                </div>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setValue("image", file);
              }}
              className="text-gray-500 text-xs"
            />
            {errors.image && (
              <p className={errCls}>{errors.image.message as string}</p>
            )}
          </div>

          <div className="border-t border-gray-200">
            <div className={rowCls}>
              <label className={labelCls} htmlFor="hotelName">
                Hotel Name
              </label>
              <div>
                <input
                  id="hotelName"
                  type="text"
                  {...register("hotelName")}
                  placeholder="Enter hotel name"
                  className={inputCls}
                />
                {errors.hotelName && (
                  <p className={errCls}>{errors.hotelName.message}</p>
                )}
              </div>
            </div>

            <div className={rowCls}>
              <label className={labelCls} htmlFor="address">
                Address
              </label>
              <div>
                <input
                  id="address"
                  type="text"
                  {...register("address")}
                  placeholder="Enter hotel address"
                  className={inputCls}
                />
                {errors.address && (
                  <p className={errCls}>{errors.address.message}</p>
                )}
              </div>
            </div>

            <div className={rowCls}>
              <label className={labelCls}>City & Country</label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <input
                    id="city"
                    type="text"
                    {...register("city")}
                    placeholder="Kathmandu"
                    className={inputCls}
                  />
                  {errors.city && (
                    <p className={errCls}>{errors.city.message}</p>
                  )}
                </div>
                <div>
                  <input
                    id="country"
                    type="text"
                    {...register("country")}
                    placeholder="Nepal"
                    className={inputCls}
                  />
                  {errors.country && (
                    <p className={errCls}>{errors.country.message}</p>
                  )}
                </div>
              </div>
            </div>

            <div className={rowCls}>
              <label className={labelCls}>Price & Rooms</label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#059669] text-xs pointer-events-none">
                      Rs.
                    </span>
                    <input
                      id="price"
                      type="number"
                      step="0.01"
                      {...register("price", { valueAsNumber: true })}
                      placeholder="5000"
                      className={`${inputCls} pl-11`}
                    />
                  </div>
                  {errors.price && (
                    <p className={errCls}>{errors.price.message}</p>
                  )}
                </div>
                <div>
                  <input
                    id="availableRooms"
                    type="number"
                    {...register("availableRooms", { valueAsNumber: true })}
                    placeholder="25"
                    className={inputCls}
                  />
                  {errors.availableRooms && (
                    <p className={errCls}>{errors.availableRooms.message}</p>
                  )}
                </div>
              </div>
            </div>

            <div className={rowCls}>
              <label className={labelCls} htmlFor="rating">
                Rating (0–5)
              </label>
              <div>
                <input
                  id="rating"
                  type="number"
                  step="0.1"
                  {...register("rating", { valueAsNumber: true })}
                  placeholder="4.5"
                  className={inputCls}
                />
                {errors.rating && (
                  <p className={errCls}>{errors.rating.message}</p>
                )}
              </div>
            </div>

            <div className={rowCls}>
              <label className={labelCls} htmlFor="description">
                Description
              </label>
              <div>
                <textarea
                  id="description"
                  rows={4}
                  {...register("description")}
                  placeholder="Enter description"
                  className={`${inputCls} resize-y leading-relaxed`}
                />
                {errors.description && (
                  <p className={errCls}>{errors.description.message}</p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-12 flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.push("/admin/hotels")}
              className="border border-gray-300 text-gray-500 text-[11px] tracking-[0.14em] uppercase px-7 py-3.5 hover:border-gray-400 hover:text-gray-700 transition-colors cursor-pointer bg-white rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-[#059669] text-white text-[11px] font-bold tracking-[0.18em] uppercase px-10 py-3.5 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer border-none rounded"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
