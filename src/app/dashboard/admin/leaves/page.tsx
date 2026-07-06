"use client";
import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/api";
import { Calendar, CheckCircle, XCircle, Clock, Loader2, User } from "lucide-react";

export default function LeavesPage() {
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("PENDING");

  const loadLeaves = async () => {
    setLoading(true);
    try {
      const data = await fetchWithAuth(`/operations/leaves?status=${statusFilter}`);
      setLeaves(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaves();
  }, [statusFilter]);

  const updateLeaveStatus = async (id: string, newStatus: string) => {
    try {
      await fetchWithAuth(`/operations/leaves/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
      loadLeaves();
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><CheckCircle className="w-3.5 h-3.5" /> Approved</span>;
      case "REJECTED":
        return <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20"><XCircle className="w-3.5 h-3.5" /> Rejected</span>;
      default:
        return <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20"><Clock className="w-3.5 h-3.5" /> Pending</span>;
    }
  };

  if (loading && leaves.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-500">
            Leave Requests
          </h1>
          <p className="text-gray-400 mt-1">Manage and approve staff and student leaves.</p>
        </div>
      </div>

      <div className="flex gap-4 border-b border-gray-800 pb-px">
        {["PENDING", "APPROVED", "REJECTED"].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors border-b-2 -mb-px ${
              statusFilter === status
                ? "border-blue-500 text-blue-400 bg-blue-500/10"
                : "border-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-800/50"
            }`}
          >
            {status.charAt(0) + status.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {leaves.map((leave) => (
          <div key={leave.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-lg hover:border-blue-500/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {leave.user?.firstName} {leave.user?.lastName}
                  </h3>
                  <p className="text-sm text-gray-400">{leave.user?.email}</p>
                </div>
                <div className="ml-auto md:ml-4">
                  {getStatusBadge(leave.status)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-gray-950 rounded-xl p-4 border border-gray-800">
                <div>
                  <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Leave Type</span>
                  <p className="text-sm text-gray-300 mt-1">{leave.type.replace('_', ' ')}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Duration</span>
                  <p className="text-sm text-gray-300 mt-1 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="col-span-2">
                  <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Reason</span>
                  <p className="text-sm text-gray-300 mt-1">{leave.reason}</p>
                </div>
              </div>
            </div>

            {leave.status === "PENDING" && (
              <div className="flex md:flex-col gap-3 min-w-[140px]">
                <button
                  onClick={() => updateLeaveStatus(leave.id, "APPROVED")}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600/10 text-emerald-400 hover:bg-emerald-600/20 border border-emerald-600/20 rounded-xl transition-all font-medium"
                >
                  <CheckCircle className="w-4 h-4" />
                  Approve
                </button>
                <button
                  onClick={() => updateLeaveStatus(leave.id, "REJECTED")}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600/10 text-red-400 hover:bg-red-600/20 border border-red-600/20 rounded-xl transition-all font-medium"
                >
                  <XCircle className="w-4 h-4" />
                  Reject
                </button>
              </div>
            )}
          </div>
        ))}

        {!loading && leaves.length === 0 && (
          <div className="text-center py-12 bg-gray-900 border border-gray-800 rounded-2xl">
            <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-1">No Leave Requests</h3>
            <p className="text-gray-400">There are no {statusFilter.toLowerCase()} leave requests at this time.</p>
          </div>
        )}
      </div>
    </div>
  );
}
