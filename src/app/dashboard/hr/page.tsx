"use client";
import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/api";
import { Users, UserCheck, CalendarOff, Clock, Loader2, MoreHorizontal } from "lucide-react";

export default function HrDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWithAuth("/dashboard/hr")
      .then(setStats)
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const cards = [
    { title: "Total Staff", value: stats?.totalStaff || 0, icon: Users, color: "text-blue-400", bg: "bg-blue-500/20", border: "border-blue-500/30" },
    { title: "Present Today", value: stats?.presentToday || 0, icon: UserCheck, color: "text-emerald-400", bg: "bg-emerald-500/20", border: "border-emerald-500/30" },
    { title: "On Leave", value: stats?.onLeave || 0, icon: CalendarOff, color: "text-rose-400", bg: "bg-rose-500/20", border: "border-rose-500/30" },
    { title: "Pending Leaves", value: stats?.pendingLeaves || 0, icon: Clock, color: "text-amber-400", bg: "bg-amber-500/20", border: "border-amber-500/30" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden group">
            <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity`}>
              <card.icon size={64} />
            </div>
            <div className={`w-12 h-12 rounded-xl ${card.bg} ${card.color} flex items-center justify-center mb-4 border ${card.border}`}>
              <card.icon size={24} />
            </div>
            <p className="text-gray-400 font-medium">{card.title}</p>
            <h3 className="text-3xl font-bold mt-1">{card.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold">Departments Overview</h3>
            <button className="text-blue-400 text-sm font-medium hover:text-blue-300">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10 text-gray-400 text-sm">
                  <th className="pb-3 font-medium">Department</th>
                  <th className="pb-3 font-medium">Head of Dept</th>
                  <th className="pb-3 font-medium">Members</th>
                  <th className="pb-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {(stats?.departments || []).map((dept: any, i: number) => (
                  <tr key={i} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                    <td className="py-4 font-medium">{dept.name}</td>
                    <td className="py-4 text-gray-300">{dept.head}</td>
                    <td className="py-4">
                      <span className="inline-flex items-center justify-center px-2 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-semibold border border-blue-500/20">
                        {dept.members} Staff
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <button className="text-gray-400 hover:text-white transition-colors">
                        <MoreHorizontal size={18} className="inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
          <h3 className="text-lg font-bold mb-6">Pending Leave Requests</h3>
          <div className="space-y-4">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="p-4 rounded-xl bg-black/20 border border-white/5">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium text-sm">John Doe</h4>
                    <p className="text-xs text-gray-400">Teacher - Mathematics</p>
                  </div>
                  <span className="px-2 py-1 bg-amber-500/10 text-amber-400 text-xs rounded border border-amber-500/20">Sick Leave</span>
                </div>
                <p className="text-xs text-gray-300 mb-3">Oct 12 - Oct 14 (3 days)</p>
                <div className="flex gap-2">
                  <button className="flex-1 py-1.5 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30 rounded-lg text-xs font-medium transition-colors">Approve</button>
                  <button className="flex-1 py-1.5 bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 border border-rose-500/30 rounded-lg text-xs font-medium transition-colors">Reject</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
