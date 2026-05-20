import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  PackageSearch,
  RefreshCw,
  Search,
  XCircle,
} from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { apiFetch } from "../api/clientApi";

const ITEMS_PER_PAGE = 5;

function PartRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [actioningId, setActioningId] = useState(null); // Renamed from approvingId to handle both actions

  async function loadRequests() {
    try {
      setLoading(true);
      const data = await apiFetch("/requests");
      setRequests(Array.isArray(data) ? data : data?.items || data?.requests || []);
    } catch (err) {
      alert(err.message || "Failed to load part requests.");
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(requestId) {
    try {
      setActioningId(requestId);
      await apiFetch(`/requests/${requestId}/approve`, {
        method: "PUT",
      });
      await loadRequests();
    } catch (err) {
      alert(err.message || "Failed to approve request.");
    } finally {
      setActioningId(null);
    }
  }

  async function handleReject(requestId) {
    try {
      setActioningId(requestId);
      await apiFetch(`/requests/${requestId}/reject`, {
        method: "PUT",
      });
      await loadRequests();
    } catch (err) {
      alert(err.message || "Failed to reject request.");
    } finally {
      setActioningId(null);
    }
  }

  useEffect(() => {
    loadRequests();
  }, []);

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      const partsText = (request.parts || [])
        .map((part) => part.partName)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        String(request.requestId).includes(search) ||
        String(request.bookingId).includes(search) ||
        String(request.vehicleName || "")
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        partsText.includes(search.toLowerCase());

      const status = getRequestStatusLabel(request.requestStatusId);
      const matchesStatus = statusFilter === "All" || status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [requests, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredRequests.length / ITEMS_PER_PAGE));
  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((page) => page + 1);
  };

  const goToPrevPage = () => {
    if (currentPage > 1) setCurrentPage((page) => page - 1);
  };

  const pendingCount = requests.filter((r) => Number(r.requestStatusId) === 1).length;
  const approvedCount = requests.filter((r) => Number(r.requestStatusId) === 2).length;
  const rejectedCount = requests.filter((r) => Number(r.requestStatusId) === 3).length;

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Loading part requests...</div>;
  }

  return (
    <div>
      <div className="bg-white -mt-4 sm:-mt-6 lg:-mt-8 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-0 mb-8">
        <PageHeader
          title="Part Requests"
          description="Review unavailable part requests submitted by customers."
        />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Requests" value={requests.length} icon={PackageSearch} />
        <StatCard label="Pending" value={pendingCount} icon={Clock} tone="warning" />
        <StatCard label="Approved" value={approvedCount} icon={CheckCircle} tone="success" />
        <StatCard label="Rejected" value={rejectedCount} icon={XCircle} tone="danger" />
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-border bg-surface/30 flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              placeholder="Search by request, booking, vehicle or part..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-10 pr-3 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3 rounded-md border border-input bg-background"
          >
            <option>All</option>
            <option>Pending</option>
            <option>Approved</option>
            <option>Rejected</option>
          </select>

          <button
            onClick={loadRequests}
            className="px-4 h-10 rounded-md border border-border font-medium flex items-center justify-center gap-2 hover:bg-surface"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-6 py-4">Request</th>
                <th className="text-left px-6 py-4">Vehicle</th>
                <th className="text-left px-6 py-4">Requested Parts</th>
                <th className="text-left px-6 py-4">Status</th>
                <th className="text-right px-6 py-4">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border">
              {paginatedRequests.map((request) => {
                const status = getRequestStatusLabel(request.requestStatusId);
                const isPending = Number(request.requestStatusId) === 1;
                const isActioning = actioningId === request.requestId;

                return (
                  <tr key={request.requestId} className="hover:bg-surface/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium">Request #{request.requestId}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Booking #{request.bookingId}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-muted-foreground">
                      {request.vehicleName || "N/A"}
                    </td>

                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {(request.parts || []).length > 0 ? (
                          request.parts.map((part) => (
                            <div key={`${request.requestId}-${part.partId}`}>
                              <span className="font-medium">{part.partName}</span>
                              <span className="text-muted-foreground">
                                {" "}
                                — Qty {part.requestQuantity}
                              </span>
                            </div>
                          ))
                        ) : (
                          <span className="text-muted-foreground">No parts listed</span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${statusBadgeClass(
                          status,
                        )}`}
                      >
                        {status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      {isPending ? (
                        <div className="flex items-center justify-end gap-2">
                          {/* Approve Button */}
                          <button
                            onClick={() => handleApprove(request.requestId)}
                            disabled={isActioning}
                            className="group relative inline-flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium 
                                       transition-all duration-200 ease-out
                                       bg-gradient-to-r from-emerald-500 to-emerald-600 
                                       hover:from-emerald-600 hover:to-emerald-700
                                       shadow-sm hover:shadow
                                       text-white
                                       disabled:opacity-60 disabled:cursor-not-allowed
                                       focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                          >
                            {isActioning ? (
                              <>
                                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                <span>Approving...</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle className="h-3.5 w-3.5 transition-transform group-hover:scale-110" />
                                <span>Approve</span>
                              </>
                            )}
                          </button>

                          {/* Reject Button */}
                          <button
                            onClick={() => handleReject(request.requestId)}
                            disabled={isActioning}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium
                                       text-red-600 hover:text-red-700 hover:bg-red-50
                                       dark:text-red-400 dark:hover:bg-red-950/30
                                       transition-all duration-200
                                       disabled:opacity-50 disabled:cursor-not-allowed
                                       focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                            title="Reject request"
                          >
                            <XCircle className="h-4 w-4" />
                            <span className="hidden sm:inline">Reject</span>
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end">
                          <span
                            className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full ${
                              status === "Rejected"
                                ? "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400"
                                : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                            }`}
                          >
                            {status === "Rejected" ? (
                              <XCircle className="h-3 w-3" />
                            ) : (
                              <CheckCircle className="h-3 w-3" />
                            )}
                            {status}
                          </span>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}

              {filteredRequests.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-muted-foreground italic">
                    No part requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="p-4 border-t border-border flex items-center justify-center gap-4">
            <button
              onClick={goToPrevPage}
              disabled={currentPage === 1}
              className={`h-8 w-8 rounded-md flex items-center justify-center transition-colors ${
                currentPage === 1
                  ? "text-muted-foreground cursor-not-allowed opacity-50"
                  : "hover:bg-surface text-foreground"
              }`}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className={`h-8 w-8 rounded-md flex items-center justify-center transition-colors ${
                currentPage === totalPages
                  ? "text-muted-foreground cursor-not-allowed opacity-50"
                  : "hover:bg-surface text-foreground"
              }`}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, tone }) {
  const toneClass =
    tone === "success"
      ? "text-green-600"
      : tone === "danger"
        ? "text-red-600"
        : tone === "warning"
          ? "text-yellow-600"
          : "text-black";

  return (
    <div className="stat-card group transition-all hover:shadow-md border border-border bg-card p-5">
      <div className="flex justify-between items-start">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
            {label}
          </div>
          <div className={`font-display text-2xl font-bold mt-2 ${toneClass}`}>{value}</div>
        </div>
        <div className="pt-1">
          <Icon className={`h-6 w-6 ${toneClass}`} />
        </div>
      </div>
    </div>
  );
}

function getRequestStatusLabel(statusId) {
  const status = Number(statusId);
  if (status === 2 || status === 4) return "Approved";
  if (status === 3) return "Rejected";
  return "Pending";
}

function statusBadgeClass(status) {
  if (status === "Approved") {
    return "bg-success/15 text-success";
  }
  if (status === "Rejected") {
    return "bg-destructive/15 text-destructive";
  }
  return "bg-warning/20 text-warning-foreground";
}

export default PartRequestsPage;
