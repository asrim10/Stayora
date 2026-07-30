"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useState, useRef } from "react";
import { toast } from "react-toastify";
import { handleUpdateProfile } from "@/lib/actions/auth-action";
import { UpdateUserData, updateUserSchema } from "../schema";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import Link from "next/link";
import UserAvatar from "@/app/_components/UserAvatar";

export default function UpdateUserForm({ user }: { user: any }) {
  const router = useRouter();
  const { checkAuth } = useAuth();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<UpdateUserData>({
    resolver: zodResolver(updateUserSchema),
    values: {
      fullName: user?.fullName || "",
      email: user?.email || "",
      username: user?.username || "",
    },
  });

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
    } else {
      setPreviewImage(null);
    }
    onChange(file);
  };

  const handleDismissImage = (onChange?: (f: File | undefined) => void) => {
    setPreviewImage(null);
    onChange?.(undefined);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onSubmit = async (data: UpdateUserData) => {
    setError(null);
    try {
      const formData = new FormData();
      formData.append("fullName", data.fullName);
      formData.append("email", data.email);
      formData.append("username", data.username);
      if (data.image) formData.append("image", data.image);

      const response = await handleUpdateProfile(formData);
      if (!response.success)
        throw new Error(response.message || "Update profile failed");

      await checkAuth();
      handleDismissImage();
      toast.success("Profile updated successfully");
      router.push("/user/profile");
    } catch (err: any) {
      toast.error(err.message || "Profile update failed");
      setError(err.message || "Profile update failed");
    }
  };

  const currentImage = previewImage
    ? previewImage
    : null;

  return (
    <>
      <div className="min-h-screen bg-[#faf7f2] text-gray-900">
        {/*  Hero  */}
        <div className="relative h-[38vh] min-h-65 border-b border-gray-200 px-10 flex flex-col justify-end pb-10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-white/60 to-transparent pointer-events-none" />

          {/* Top row */}
          <div className="flex items-start justify-between mb-8">
            <p className="text-[11px] uppercase tracking-[0.18em] text-[#059669]">
              Your Account
            </p>
            <Link
              href="/user/profile"
              className="text-[11px] uppercase tracking-[0.18em] text-gray-400 hover:text-gray-600 transition-colors no-underline"
            >
              ← Back to Profile
            </Link>
          </div>

          {/* Avatar + title */}
          <div className="flex items-end gap-6">
            {/* Avatar with dismiss button */}
            <div className="relative shrink-0">
              <div className="w-18 h-18 rounded-full overflow-hidden border-2 border-gray-200">
                {currentImage ? (
                  <img
                    src={currentImage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserAvatar
                    imageUrl={user?.imageUrl}
                    username={user?.username}
                    size={72}
                  />
                )}
              </div>
              {previewImage && (
                <Controller
                  name="image"
                  control={control}
                  render={({ field: { onChange } }) => (
                    <button
                      type="button"
                      onClick={() => handleDismissImage(onChange)}
                      className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 border-none text-white text-[9px] flex items-center justify-center cursor-pointer hover:bg-red-600 transition-colors"
                    >
                      ✕
                    </button>
                  )}
                />
              )}
            </div>

            {/* Title + file input */}
            <div className="flex-1 min-w-0">
              <h1 className="text-[42px] font-bold leading-none text-gray-900 uppercase mb-4 font-heading">
                Edit Profile
              </h1>
              {/* Profile picture upload in hero stats area */}
              <div>
                <p className="text-[10px] uppercase tracking-[0.15em] text-gray-500 mb-1.5">
                  Profile Picture
                </p>
                <Controller
                  name="image"
                  control={control}
                  render={({ field: { onChange } }) => (
                    <div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        onChange={(e) =>
                          handleImageChange(e.target.files?.[0], onChange)
                        }
                        accept=".jpg,.jpeg,.png,.webp"
                        className="text-[13px] text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border file:border-gray-300 file:bg-gray-50 file:text-xs file:text-gray-600 file:cursor-pointer file:uppercase file:tracking-wider hover:file:border-gray-400 hover:file:text-gray-800 file:transition-all font-heading"
                      />
                      {errors.image && (
                        <p className="mt-1 text-xs text-red-400">
                          {errors.image.message}
                        </p>
                      )}
                    </div>
                  )}
                />
              </div>
            </div>
          </div>
        </div>

        {/*  Body  */}
        <div className="max-w-215 mx-auto px-10 py-14">
          {/* Section header */}
          <div className="mb-8">
            <p className="text-[10px] uppercase tracking-[0.15em] text-gray-500 mb-1.5">
              Update Details
            </p>              <h2 className="text-[32px] font-bold text-gray-900 font-heading">
              Personal Info
            </h2>
            <div className="mt-4 h-px bg-gray-200" />
          </div>

          {/* Error banner */}
          {error && (
            <div className="mb-8 px-5 py-4 border border-red-200 bg-red-50 text-red-600 text-sm rounded-lg">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="border-t border-gray-200">
              {/* Full Name */}
              <div className="flex items-baseline gap-8 py-5 border-b border-gray-200">
                <label
                  htmlFor="fullName"
                  className="w-44 shrink-0 text-[10px] uppercase tracking-[0.15em] text-gray-500 pt-0.5"
                >
                  Full Name
                </label>
                <div className="flex-1">
                  <input
                    id="fullName"
                    placeholder="Enter your full name"
                    {...register("fullName")}
                    className="w-full bg-gray-50 border-b border-gray-300 text-sm text-gray-900 placeholder:text-gray-400 py-2 outline-none focus:border-[#059669]/40 transition-colors"
                  />
                  {errors.fullName && (
                    <p className="mt-1.5 text-xs text-red-500">
                      {errors.fullName.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Username */}
              <div className="flex items-baseline gap-8 py-5 border-b border-gray-200">
                <label
                  htmlFor="username"
                  className="w-44 shrink-0 text-[10px] uppercase tracking-[0.15em] text-gray-500 pt-0.5"
                >
                  Username
                </label>
                <div className="flex-1">
                  <input
                    id="username"
                    placeholder="Enter your username"
                    {...register("username")}
                    className="w-full bg-gray-50 border-b border-gray-300 text-sm text-gray-900 placeholder:text-gray-400 py-2 outline-none focus:border-[#059669]/40 transition-colors"
                  />
                  {errors.username && (
                    <p className="mt-1.5 text-xs text-red-500">
                      {errors.username.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div className="flex items-baseline gap-8 py-5 border-b border-gray-200">
                <label
                  htmlFor="email"
                  className="w-44 shrink-0 text-[10px] uppercase tracking-[0.15em] text-gray-500 pt-0.5"
                >
                  Email Address
                </label>
                <div className="flex-1">
                  <input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    {...register("email")}
                    className="w-full bg-gray-50 border-b border-gray-300 text-sm text-gray-900 placeholder:text-gray-400 py-2 outline-none focus:border-[#059669]/40 transition-colors"
                  />
                  {errors.email && (
                    <p className="mt-1.5 text-xs text-red-500">
                      {errors.email.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Footer actions */}
            <div className="mt-12 flex justify-end gap-3">
              <Link
                href="/user/profile"
                className="px-5 py-2.5 rounded-lg border border-gray-300 bg-white text-sm text-gray-600 uppercase tracking-widest hover:border-gray-400 hover:text-gray-800 transition-all no-underline"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-lg bg-[#059669] text-white text-sm font-semibold uppercase tracking-widest hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer border-none"
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
