"use client";

import { Controller, useForm } from "react-hook-form";
import { HotelData, HotelSchema } from "..//schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRef, useState, useTransition } from "react";
import { toast } from "react-toastify";
import { handleCreateHotel } from "@/lib/actions/admin/hotel-action";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { X } from "lucide-react";

const inputCls =
  "w-full bg-white border border-gray-300 text-gray-900 text-sm px-5 py-3.5 outline-none focus:border-[#059669] transition-colors placeholder:text-gray-400 box-border rounded";
const labelCls =
  "block text-[#059669] text-[9px] tracking-[0.2em] uppercase mb-2.5 pt-3.5";
const errCls = "text-[#f87171] text-[11px] mt-1.5";
const rowCls =
  "grid grid-cols-[1fr_2fr] gap-12 py-8 border-b border-gray-200 items-start";

export default function CreateHotelForm() {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<HotelData>({ resolver: zodResolver(HotelSchema) });
  const [error, setError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (
    file: File | undefined,
    onChange: (f: File | undefined) => void,
  ) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result as string);
      reader.readAsDataURL(file);
    } else setPreviewImage(null);
    onChange(file);
  };

  const handleDismissImage = (onChange?: (f: File | undefined) => void) => {
    setPreviewImage(null);
    onChange?.(undefined);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onSubmit = async (data: HotelData) => {
    setError(null);
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("hotelName", data.hotelName);
        formData.append("address", data.address);
        formData.append("city", data.city);
        formData.append("country", data.country);
        formData.append("price", data.price.toString());
        formData.append("availableRooms", data.availableRooms.toString());
        if (data.rating !== undefined)
          formData.append("rating", data.rating.toString());
        if (data.description) formData.append("description", data.description);
        if (data.image) formData.append("image", data.image);
        const response = await handleCreateHotel(formData);
        if (!response.success)
          throw new Error(response.message || "Create hotel failed");
        reset();
        handleDismissImage();
        toast.success("Hotel created successfully");
        router.push("/admin/hotels");
      } catch (err: any) {
        toast.error(err.message || "Create hotel failed");
        setError(err.message || "Create hotel failed");
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#faf7f2]">


      <div className="border-b border-gray-200 px-12 py-12 flex items-end justify-between">
        <div>
          <p className="text-[#059669] text-[10px] tracking-[0.22em] uppercase mb-3">
            Admin Panel
          </p>
          <h1 className="text-gray-900 text-4xl font-bold uppercase leading-tight m-0 font-heading">
            Create Hotel
          </h1>
        </div>
        <Link
          href="/admin/hotels"
          className="border border-gray-300 text-gray-500 text-[11px] tracking-[0.14em] uppercase px-6 py-3 hover:border-gray-400 hover:text-gray-700 transition-colors no-underline rounded"
        >
          ← Back
        </Link>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="px-12 py-12">
        <div className="mb-12">
          <p className="text-gray-400 text-[9px] tracking-[0.2em] uppercase mb-6">
            Hotel Image
          </p>
          <div className="relative w-full h-50 bg-gray-100 border border-gray-200 overflow-hidden mb-4 rounded">
            {previewImage ? (
              <>
                <img
                  src={previewImage}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <Controller
                  name="image"
                  control={control}
                  render={({ field: { onChange } }) => (
                    <button
                      type="button"
                      onClick={() => handleDismissImage(onChange)}
                      className="absolute top-3 right-3 bg-white border border-gray-200 text-gray-500 w-7 h-7 flex items-center justify-center cursor-pointer hover:border-gray-300 transition-colors rounded"
                    >
                      <X size={12} />
                    </button>
                  )}
                />
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <p className="text-gray-400 text-[10px] tracking-[0.2em] uppercase">
                  No Image Selected
                </p>
              </div>
            )}
          </div>
          <Controller
            name="image"
            control={control}
            render={({ field: { onChange } }) => (
              <input
                ref={fileInputRef}
                type="file"
                onChange={(e) =>
                  handleImageChange(e.target.files?.[0], onChange)
                }
                accept=".jpg,.jpeg,.png,.webp"
                className="text-gray-500 text-xs"
              />
            )}
          />
          {errors.image && <p className={errCls}>{errors.image.message}</p>}
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
                placeholder="Grand Plaza Hotel"
                className={inputCls}
              />
              {errors.hotelName?.message && (
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
                placeholder="123 Main Street"
                className={inputCls}
              />
              {errors.address?.message && (
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
                {errors.city?.message && (
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
                {errors.country?.message && (
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
                {errors.price?.message && (
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
                {errors.availableRooms?.message && (
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
              {errors.rating?.message && (
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
                placeholder="Describe the hotel amenities, location, and features..."
                className={`${inputCls} resize-y leading-relaxed`}
              />
              {errors.description?.message && (
                <p className={errCls}>{errors.description.message}</p>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-8 px-5 py-4 border border-[#7f1d1d] bg-[#1a0a0a] text-[#f87171] text-sm">
            {error}
          </div>
        )}

        <div className="mt-12 flex justify-end gap-4">
          <Link
            href="/admin/hotels"
            className="border border-gray-300 text-gray-500 text-[11px] tracking-[0.14em] uppercase px-7 py-3.5 hover:border-gray-400 hover:text-gray-700 transition-colors no-underline rounded"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting || pending}
            className="bg-[#059669] text-white text-[11px] font-bold tracking-[0.18em] uppercase px-10 py-3.5 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer border-none rounded"
          >
            {isSubmitting || pending ? "Creating..." : "Create Hotel"}
          </button>
        </div>
      </form>
    </div>
  );
}
