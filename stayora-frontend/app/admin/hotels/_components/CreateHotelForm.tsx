"use client";

import { useForm } from "react-hook-form";
import { HotelData, HotelSchema } from "..//schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRef, useState, useTransition } from "react";
import { toast } from "react-toastify";
import { handleCreateHotel } from "@/lib/actions/admin/hotel-action";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { X, ImagePlus } from "lucide-react";

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
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<HotelData>({ resolver: zodResolver(HotelSchema) });
  const [error, setError] = useState<string | null>(null);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedImages = watch("images") || [];

  const handleFilesSelected = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newFiles = Array.from(files);
    const currentFiles = selectedImages;
    const total = currentFiles.length + newFiles.length;

    if (total > 10) {
      toast.error(`Maximum 10 images allowed. You can add ${10 - currentFiles.length} more.`);
      return;
    }

    // Generate previews using object URLs
    const newPreviews = newFiles.map((file) => URL.createObjectURL(file));

    setPreviews((prev) => [...prev, ...newPreviews]);
    setValue("images", [...currentFiles, ...newFiles]);
  };

  const removeImage = (index: number) => {
    const currentFiles = [...selectedImages];
    const currentPreviews = [...previews];
    currentFiles.splice(index, 1);
    currentPreviews.splice(index, 1);
    setValue("images", currentFiles);
    setPreviews(currentPreviews);
  };

  const handleDismissAll = () => {
    setPreviews([]);
    setValue("images", []);
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

        // Append multiple images
        if (data.images && data.images.length > 0) {
          data.images.forEach((file) => {
            formData.append("images", file);
          });
        }

        const response = await handleCreateHotel(formData);
        if (!response.success)
          throw new Error(response.message || "Create hotel failed");

        handleDismissAll();
        toast.success("Hotel created successfully");
        if (response.geocodingWarning) {
          toast.warning(response.geocodingWarning, { autoClose: 8000 });
        }
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
        {/* ── MULTI IMAGE UPLOAD ── */}
        <div className="mb-12">
          <div className="flex items-end justify-between mb-6">
            <div>
              <p className="text-gray-400 text-[9px] tracking-[0.2em] uppercase mb-1">
                Hotel Images
              </p>
              <p className="text-gray-400 text-[10px]">
                Upload up to 10 images. First image will be the cover.
              </p>
            </div>
            {previews.length > 0 && (
              <button
                type="button"
                onClick={handleDismissAll}
                className="text-gray-400 text-[10px] tracking-[0.14em] uppercase border border-gray-300 px-3 py-1.5 hover:border-gray-400 hover:text-gray-600 transition-colors bg-transparent cursor-pointer rounded"
              >
                Remove all
              </button>
            )}
          </div>

          {/* Gallery grid */}
          {previews.length > 0 && (
            <div className="grid grid-cols-5 gap-3 mb-4">
              {previews.map((src, i) => (
                <div
                  key={i}
                  className="relative aspect-[4/3] bg-gray-100 border border-gray-200 overflow-hidden group rounded"
                >
                  <img
                    src={src}
                    alt={`Preview ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {/* Order badge */}
                  <div className="absolute top-2 left-2 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded">
                    {i === 0 ? "Cover" : `#${i + 1}`}
                  </div>
                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-2 right-2 bg-white/90 border border-gray-200 text-gray-500 w-6 h-6 flex items-center justify-center cursor-pointer hover:bg-white hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 rounded"
                  >
                    <X size={11} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Drop zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="relative w-full border-2 border-dashed border-gray-300 hover:border-[#059669] transition-colors cursor-pointer p-8 flex flex-col items-center justify-center gap-2 bg-white rounded"
          >
            <ImagePlus size={28} className="text-gray-300" />
            <p className="text-gray-400 text-[10px] tracking-[0.16em] uppercase">
              Click to upload images
            </p>
            <p className="text-gray-300 text-[9px]">JPG, PNG, WEBP — Max 5MB each</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".jpg,.jpeg,.png,.webp"
            onChange={(e) => handleFilesSelected(e.target.files)}
            className="hidden"
          />
          {errors.images && (
            <p className={errCls}>{errors.images.message || errors.images.root?.message}</p>
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
