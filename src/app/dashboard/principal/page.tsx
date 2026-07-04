"use client";
import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/api";
import { Users, GraduationCap, Building2, UserX, Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function PrincipalDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWithAuth("/dashboard/principal")
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
    { title: "Overall Attendance", value: `${stats?.overallAttendance || 0}%`, icon: Users, color: "text-blue-400", bg: "bg-blue-500/20", border: "border-blue-500/30" },
    { title: "Academic Avg Score", value: `${stats?.academicScoreAvg || 0}%`, icon: GraduationCap, color: "text-emerald-400", bg: "bg-emerald-500/20", border: "border-emerald-500/30" },
    { title: "Fee Collection", value: stats?.feeCollectionStr || "₹0", icon: Building2, color: "text-purple-400", bg: "bg-purple-500/20", border: "border-purple-500/30" },
    { title: "Staff on Leave", value: stats?.staffOnLeave || 0, icon: UserX, color: "text-rose-400", bg: "bg-rose-500/20", border: "border-rose-500/30" },
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
          <h3 className="text-lg font-bold mb-6">Class Performance</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.classPerformance || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis dataKey="class" stroke="#4b5563" tick={{fill: '#9ca3af'}} />
                <YAxis stroke="#4b5563" tick={{fill: '#9ca3af'}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#f3f4f6' }}
                  itemStyle={{ color: '#60a5fa' }}
                  cursor={{fill: '#1f2937'}}
                />
                <Bar dataKey="avg" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
          <h3 className="text-lg font-bold mb-6">Teacher Subject Performance</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.teacherPerformance || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis dataKey="subject" stroke="#4b5563" tick={{fill: '#9ca3af'}} />
                <YAxis stroke="#4b5563" tick={{fill: '#9ca3af'}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#f3f4f6' }}
                  itemStyle={{ color: '#a78bfa' }}
                  cursor={{fill: '#1f2937'}}
                />
                <Bar dataKey="performance" fill="#a78bfa" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
