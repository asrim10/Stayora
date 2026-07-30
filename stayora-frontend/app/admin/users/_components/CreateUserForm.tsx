"use client";

import { Controller, useForm } from "react-hook-form";
import { UserData, UserSchema } from "@/app/admin/users/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import { handleCreateUser } from "@/lib/actions/admin/user-action";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

const inputCls =
  "w-full bg-white border border-gray-300 text-gray-900 text-sm px-5 py-3.5 outline-none focus:border-[#059669] transition-colors placeholder:text-gray-400 rounded";
const labelCls =
  "block text-[#059669] text-[9px] tracking-[0.2em] uppercase mb-2.5 pt-3.5";
const errCls = "text-[#f87171] text-[11px] mt-1.5";

export default function CreateUserForm() {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UserData>({ resolver: zodResolver(UserSchema) });
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

  const onSubmit = async (data: UserData) => {
    setError(null);
    startTransition(async () => {
      try {
        const formData = new FormData();
        if (data.fullName) formData.append("fullName", data.fullName);
        formData.append("email", data.email);
        formData.append("username", data.username);
        formData.append("password", data.password);
        formData.append("confirmPassword", data.confirmPassword);
        if (data.image) formData.append("image", data.image);
        const response = await handleCreateUser(formData);
        if (!response.success)
          throw new Error(response.message || "Create profile failed");
        reset();
        handleDismissImage();
        toast.success("User created successfully");
        router.push("/admin/users");
      } catch (err: any) {
        toast.error(err.message || "Create profile failed");
        setError(err.message || "Create profile failed");
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
          <h1 className="text-gray-900 text-4xl font-bold uppercase leading-tight font-heading">
            Create User
          </h1>
        </div>
        <Link
          href="/admin/users"
          className="border border-gray-300 text-gray-500 text-[11px] tracking-[0.14em] uppercase px-6 py-3 hover:border-gray-400 hover:text-gray-700 transition-colors rounded"
        >
          ← Back
        </Link>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="px-12 py-12">
        <div className="mb-12">
          <p className="text-gray-400 text-[9px] tracking-[0.2em] uppercase mb-6">
            Profile Image
          </p>
          <div className="flex items-center gap-8">
            <div className="w-20 h-20 rounded-full overflow-hidden border border-gray-200 shrink-0 relative flex items-center justify-center bg-gray-100">
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
                        className="absolute top-0 right-0 bg-white text-gray-500 w-5 h-5 flex items-center justify-center cursor-pointer border-none rounded"
                      >
                        <X size={10} />
                      </button>
                    )}
                  />
                </>
              ) : (
                <p className="text-gray-400 text-[9px] tracking-widest uppercase text-center">
                  None
                </p>
              )}
            </div>
            <div>
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
          </div>
        </div>

        <div className="border-t border-gray-200">
          <div className="grid grid-cols-[1fr_2fr] gap-12 py-8 border-b border-gray-200 items-start">
            <label className={labelCls} htmlFor="fullName">
              Full Name
            </label>
            <div>
              <input
                id="fullName"
                type="text"
                autoComplete="given-name"
                {...register("fullName")}
                placeholder="Jane Doe"
                className={inputCls}
              />
              {errors.fullName?.message && (
                <p className={errCls}>{errors.fullName.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-[1fr_2fr] gap-12 py-8 border-b border-gray-200 items-start">
            <label className={labelCls} htmlFor="email">
              Email
            </label>
            <div>
              <input
                id="email"
                type="email"
                autoComplete="email"
                {...register("email")}
                placeholder="you@example.com"
                className={inputCls}
              />
              {errors.email?.message && (
                <p className={errCls}>{errors.email.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-[1fr_2fr] gap-12 py-8 border-b border-gray-200 items-start">
            <label className={labelCls} htmlFor="username">
              Username
            </label>
            <div>
              <input
                id="username"
                type="text"
                autoComplete="username"
                {...register("username")}
                placeholder="janedoe"
                className={inputCls}
              />
              {errors.username?.message && (
                <p className={errCls}>{errors.username.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-[1fr_2fr] gap-12 py-8 border-b border-gray-200 items-start">
            <label className={labelCls}>Password</label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  {...register("password")}
                  placeholder="••••••"
                  className={inputCls}
                />
                {errors.password?.message && (
                  <p className={errCls}>{errors.password.message}</p>
                )}
              </div>
              <div>
                <input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  {...register("confirmPassword")}
                  placeholder="Confirm ••••••"
                  className={inputCls}
                />
                {errors.confirmPassword?.message && (
                  <p className={errCls}>{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-8 px-5 py-4 border border-red-300 bg-red-50 text-red-600 text-sm rounded">
            {error}
          </div>
        )}

        <div className="mt-12 flex justify-end gap-4">
          <Link
            href="/admin/users"
            className="border border-gray-300 text-gray-500 text-[11px] tracking-[0.14em] uppercase px-7 py-3.5 hover:border-gray-400 hover:text-gray-700 transition-colors rounded"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting || pending}
            className="bg-[#059669] text-white text-[11px] font-bold tracking-[0.18em] uppercase px-10 py-3.5 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer border-none rounded"
          >
            {isSubmitting || pending ? "Creating..." : "Create User"}
          </button>
        </div>
      </form>
    </div>
  );
}
