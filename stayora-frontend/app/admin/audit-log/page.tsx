import {
  handleGetAllAuditLogs,
} from "@/lib/actions/admin/audit-log-action";

function formatTimestamp(ts: string) {
  const d = new Date(ts);
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function actionBadge(action: string) {
  const styles: Record<string, string> = {
    login_success: "bg-emerald-100 text-emerald-700",
    login_failed: "bg-red-100 text-red-700",
    password_changed: "bg-amber-100 text-amber-700",
    password_reset: "bg-amber-100 text-amber-700",
    password_set: "bg-blue-100 text-blue-700",
    profile_updated: "bg-purple-100 text-purple-700",
  };
  const cls = styles[action] || "bg-gray-100 text-gray-600";
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-semibold ${cls}`}>
      {action.replace(/_/g, " ")}
    </span>
  );
}

export default async function AdminAuditLogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; size?: string; action?: string }>;
}) {
  const params = await searchParams;
  const page = params.page || "1";
  const size = params.size || "25";
  const actionFilter = params.action || "";

  const result = await handleGetAllAuditLogs(page, size, actionFilter);
  const logs = result.success ? (result as any).data || [] : [];
  const pagination = result.success ? (result as any).pagination : null;

  return (
    <div className="w-full min-h-screen bg-[#faf7f2] text-gray-900 px-8 py-10">
      <div className="max-w-370 mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-end justify-between pb-6 border-b border-gray-200">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-gray-500 mb-2">
              Admin Panel
            </p>
            <h1 className="text-[54px] font-bold leading-none uppercase text-gray-900 font-heading">
              Audit Logs
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Security activity log for all user actions
            </p>
          </div>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-3">
          <span className="text-[10px] uppercase tracking-[0.15em] text-gray-500">
            Filter by action:
          </span>
          {["", "login_success", "login_failed", "password_changed", "profile_updated"].map((a) => (
            <a
              key={a}
              href={`/admin/audit-log?action=${a}`}
              className={`px-3 py-1.5 rounded text-[10px] uppercase tracking-wider font-semibold transition-all ${
                actionFilter === a
                  ? "bg-[#059669] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {a || "All"}
            </a>
          ))}
          {actionFilter && actionFilter !== "" && !["", "login_success", "login_failed", "password_changed", "profile_updated"].includes(actionFilter) && (
            <a
              href="/admin/audit-log"
              className="px-3 py-1.5 rounded text-[10px] uppercase tracking-wider font-semibold bg-[#059669] text-white"
            >
              {actionFilter.replace(/_/g, " ")}
            </a>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-5 py-4 text-[10px] uppercase tracking-[0.15em] text-gray-500 font-semibold">
                    Timestamp
                  </th>
                  <th className="px-5 py-4 text-[10px] uppercase tracking-[0.15em] text-gray-500 font-semibold">
                    User ID
                  </th>
                  <th className="px-5 py-4 text-[10px] uppercase tracking-[0.15em] text-gray-500 font-semibold">
                    Action
                  </th>
                  <th className="px-5 py-4 text-[10px] uppercase tracking-[0.15em] text-gray-500 font-semibold">
                    Details
                  </th>
                  <th className="px-5 py-4 text-[10px] uppercase tracking-[0.15em] text-gray-500 font-semibold">
                    IP
                  </th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-sm text-gray-400">
                      No audit logs found.
                    </td>
                  </tr>
                ) : (
                  logs.map((log: any) => (
                    <tr
                      key={log._id}
                      className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-5 py-3.5 text-[12px] text-gray-700 font-mono whitespace-nowrap">
                        {formatTimestamp(log.timestamp)}
                      </td>
                      <td className="px-5 py-3.5 text-[12px] text-gray-700 font-mono">
                        {log.userId?.length > 20
                          ? log.userId.slice(0, 20) + "..."
                          : log.userId}
                      </td>
                      <td className="px-5 py-3.5">
                        {actionBadge(log.action)}
                      </td>
                      <td className="px-5 py-3.5 text-[12px] text-gray-600 max-w-[300px] truncate">
                        {log.details || "—"}
                      </td>
                      <td className="px-5 py-3.5 text-[12px] text-gray-500 font-mono">
                        {log.ip || "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
              <p className="text-[11px] text-gray-500">
                Page {pagination.page} of {pagination.totalPages} ({pagination.totalItems} total)
              </p>
              <div className="flex gap-2">
                {pagination.page > 1 && (
                  <a
                    href={`/admin/audit-log?page=${pagination.page - 1}&size=${size}&action=${actionFilter}`}
                    className="px-3 py-1.5 rounded text-[11px] bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all"
                  >
                    ← Previous
                  </a>
                )}
                {pagination.page < pagination.totalPages && (
                  <a
                    href={`/admin/audit-log?page=${pagination.page + 1}&size=${size}&action=${actionFilter}`}
                    className="px-3 py-1.5 rounded text-[11px] bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all"
                  >
                    Next →
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
