"use client";
import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/api";
import { Users, UserSquare2, IndianRupee, FileWarning, Loader2 } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from "framer-motion";

// Mock data for the chart to make it look active
const mockChartData = [
  { name: 'Jan', students: 400, teachers: 24 },
  { name: 'Feb', students: 410, teachers: 24 },
  { name: 'Mar', students: 425, teachers: 25 },
  { name: 'Apr', students: 440, teachers: 26 },
  { name: 'May', students: 450, teachers: 26 },
  { name: 'Jun', students: 480, teachers: 28 },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWithAuth("/dashboard/admin")
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

  const totals = stats?.totals || { students: 0, teachers: 0, collectedAmount: 0, pendingFees: 0 };

  const cards = [
    { title: "Total Students", value: totals.students, icon: Users, color: "text-blue-400", bg: "bg-blue-500/20", border: "border-blue-500/30" },
    { title: "Total Teachers", value: totals.teachers, icon: UserSquare2, color: "text-purple-400", bg: "bg-purple-500/20", border: "border-purple-500/30" },
    { title: "Fees Collected", value: `₹${totals.collectedAmount.toLocaleString()}`, icon: IndianRupee, color: "text-emerald-400", bg: "bg-emerald-500/20", border: "border-emerald-500/30" },
    { title: "Pending Invoices", value: totals.pendingFees, icon: FileWarning, color: "text-rose-400", bg: "bg-rose-500/20", border: "border-rose-500/30" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={i} 
            className="glass-panel p-6 relative overflow-hidden group hover:border-blue-500/50 transition-colors"
          >
            <div className={`absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity`}>
              <card.icon size={80} />
            </div>
            <div className={`w-12 h-12 rounded-xl ${card.bg} ${card.color} flex items-center justify-center mb-4 border ${card.border}`}>
              <card.icon size={24} />
            </div>
            <p className="text-gray-400 font-medium text-sm">{card.title}</p>
            <h3 className="text-3xl font-bold mt-1 text-white">{card.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 glass-panel p-6"
        >
          <h3 className="text-lg font-bold mb-6 text-white">Enrollment Growth</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#4b5563" tick={{fill: '#9ca3af'}} />
                <YAxis stroke="#4b5563" tick={{fill: '#9ca3af'}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#f3f4f6' }}
                  itemStyle={{ color: '#60a5fa' }}
                />
                <Area type="monotone" dataKey="students" stroke="#3b82f6" fillOpacity={1} fill="url(#colorStudents)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-panel p-6"
        >
          <h3 className="text-lg font-bold mb-6 text-white">Recent Activity</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
              <div>
                <p className="text-sm font-medium">New student enrolled in Class VI</p>
                <p className="text-xs text-gray-500">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2"></div>
              <div>
                <p className="text-sm font-medium">Term fees collected (₹24,500)</p>
                <p className="text-xs text-gray-500">5 hours ago</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-2 h-2 rounded-full bg-purple-500 mt-2"></div>
              <div>
                <p className="text-sm font-medium">Staff meeting scheduled</p>
                <p className="text-xs text-gray-500">Yesterday</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
