"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { handleDeleteUser } from "@/lib/actions/admin/user-action";
import { Search, ChevronLeft, ChevronRight, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import UserAvatar from "@/app/_components/UserAvatar";

function ConfirmModal({
  onClose,
  onConfirm,
}: {
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div onClick={onClose} className="absolute inset-0 bg-black/50" />
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="relative bg-white border border-gray-200 w-[90%] max-w-sm p-8 rounded-lg shadow-xl"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 transition-colors cursor-pointer"
        >
          <X size={16} />
        </button>
        <p className="text-[#059669] text-[9px] tracking-[0.2em] uppercase mb-2">
          Confirm Action
        </p>
        <h3 className="text-gray-900 text-lg font-bold uppercase mb-4 font-heading">
          Delete User
        </h3>
        <p className="text-gray-500 text-sm leading-relaxed mb-8">
          Are you sure you want to delete this user? This action cannot be
          undone.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="border border-gray-300 text-gray-500 text-[11px] tracking-[0.14em] uppercase px-6 py-2.5 hover:text-gray-700 hover:border-gray-400 transition-colors cursor-pointer bg-white rounded"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="bg-red-600 border border-red-600 text-white text-[11px] font-bold tracking-[0.14em] uppercase px-6 py-2.5 hover:bg-red-700 transition-colors cursor-pointer rounded"
          >
            Delete
          </button>
        </div>
      </motion.div>
    </div>
  );
}

const UserTable = ({
  users,
  pagination,
  search,
}: {
  users: any[];
  pagination: any;
  search?: string;
}) => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState(search || "");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleSearchChange = () => {
    router.push(
      `/admin/users?page=1&size=${pagination.size}` +
        (searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : ""),
    );
  };

  const onDelete = async () => {
    try {
      await handleDeleteUser(deleteId!);
      toast.success("User deleted successfully");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete user");
    } finally {
      setDeleteId(null);
    }
  };

  const makePageHref = (page: number) =>
    `/admin/users?page=${page}&size=${pagination.size}` +
    (searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : "");

  const { page: currentPage, totalPages } = pagination;

  const pageNumbers = () => {
    const range: number[] = [];
    for (
      let i = Math.max(1, currentPage - 2);
      i <= Math.min(totalPages, currentPage + 2);
      i++
    )
      range.push(i);
    return range;
  };

  return (
    <div>
      <div className="flex gap-3 items-center pb-6 border-b border-gray-200 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearchChange();
            }}
            placeholder="Search users..."
            className="w-full bg-white border border-gray-300 text-gray-900 text-xs pl-9 pr-4 py-2.5 outline-none focus:border-[#059669] transition-colors placeholder:text-gray-400 rounded"
          />
        </div>
        <button
          onClick={handleSearchChange}
          className="border border-gray-300 text-gray-500 text-[11px] tracking-[0.14em] uppercase px-5 py-2.5 hover:border-[#059669] hover:text-[#059669] transition-colors cursor-pointer bg-white mt-4 rounded"
        >
          Search
        </button>
      </div>

      <div className="border border-gray-200 overflow-x-auto rounded-lg shadow-sm">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              {["User", "Email", "Role", "Actions"].map((col) => (
                <th
                  key={col}
                  className="px-6 py-4 text-left text-[9px] text-gray-500 tracking-[0.18em] uppercase font-semibold whitespace-nowrap"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((user, idx) => (
              <motion.tr
                key={user._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.03 }}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full overflow-hidden border border-gray-200 shrink-0">
                      <UserAvatar
                        imageUrl={user.imageUrl}
                        username={user.fullName}
                        size={36}
                      />
                    </div>
                    <div>
                      <p className="text-gray-900 text-sm font-semibold mb-0.5">
                        {user.fullName}
                      </p>
                      <p className="text-gray-500 text-xs">@{user.username}</p>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4 text-gray-500 text-xs">
                  {user.email}
                </td>

                <td className="px-6 py-4">
                  <span
                    className={`text-[9px] font-semibold tracking-[0.14em] uppercase px-2.5 py-1 border rounded ${user.role === "admin" ? "bg-amber-50 text-[#059669] border-[#05966933]" : "bg-gray-50 text-gray-500 border-gray-200"}`}
                  >
                    {user.role}
                  </span>
                </td>

                <td className="px-6 py-4">
                  <div className="flex items-center gap-5">
                    <Link
                      href={`/admin/users/${user._id}`}
                      className="text-[#60a5fa] text-[11px] tracking-widest uppercase hover:opacity-70 transition-opacity"
                    >
                      View
                    </Link>
                    <Link
                      href={`/admin/users/${user._id}/edit`}
                      className="text-[#059669] text-[11px]tracking-widest uppercase hover:opacity-70 transition-opacity"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => setDeleteId(user._id)}
                      className="text-[#f87171] text-[11px] tracking-widest uppercase hover:opacity-70 transition-opacity cursor-pointer bg-transparent border-none p-0"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between pt-5">
        <p className="text-gray-400 text-[10px] tracking-[0.14em] uppercase">
          Page {currentPage} of {totalPages}
        </p>
        <div className="flex items-center gap-1">
          <Link
            href={currentPage === 1 ? "#" : makePageHref(currentPage - 1)}
            className={`flex items-center px-2.5 py-2 border border-gray-300 transition-colors rounded ${currentPage === 1 ? "text-gray-200 pointer-events-none" : "text-gray-500 hover:border-[#059669] hover:text-[#059669]"}`}
          >
            <ChevronLeft size={13} />
          </Link>
          {currentPage > 3 && (
            <>
              <Link
                href={makePageHref(1)}
                className="flex items-center justify-center w-8 h-8 border border-gray-300 text-gray-500 text-xs hover:border-[#059669] hover:text-[#059669] transition-colors rounded"
              >
                1
              </Link>
              <span className="text-gray-300 text-xs px-1">…</span>
            </>
          )}
          {pageNumbers().map((p) => (
            <Link
              key={p}
              href={makePageHref(p)}
              className={`flex items-center justify-center w-8 h-8 border text-xs transition-colors rounded ${p === currentPage ? "border-[#059669] text-[#059669] bg-amber-50 font-bold" : "border-gray-300 text-gray-500 hover:border-[#059669] hover:text-[#059669]"}`}
            >
              {p}
            </Link>
          ))}
          {currentPage < totalPages - 2 && (
            <>
              <span className="text-gray-300 text-xs px-1">…</span>
              <Link
                href={makePageHref(totalPages)}
                className="flex items-center justify-center w-8 h-8 border border-gray-300 text-gray-500 text-xs hover:border-[#059669] hover:text-[#059669] transition-colors rounded"
              >
                {totalPages}
              </Link>
            </>
          )}
          <Link
            href={
              currentPage === totalPages ? "#" : makePageHref(currentPage + 1)
            }
            className={`flex items-center px-2.5 py-2 border border-gray-300 transition-colors rounded ${currentPage === totalPages ? "text-gray-200 pointer-events-none" : "text-gray-500 hover:border-[#059669] hover:text-[#059669]"}`}
          >
            <ChevronRight size={13} />
          </Link>
        </div>
      </div>

      <AnimatePresence>
        {deleteId && (
          <ConfirmModal
            onClose={() => setDeleteId(null)}
            onConfirm={onDelete}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserTable;
