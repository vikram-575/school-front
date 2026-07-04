"use client";
import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/api";
import { Wallet, IndianRupee, FileWarning, TrendingUp, Loader2, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

// Mock data to visualize income vs expenses
const mockFinanceData = [
  { name: 'Jan', income: 125000, expense: 45000 },
  { name: 'Feb', income: 110000, expense: 42000 },
  { name: 'Mar', income: 150000, expense: 50000 },
  { name: 'Apr', income: 180000, expense: 48000 },
  { name: 'May', income: 90000,  expense: 40000 },
  { name: 'Jun', income: 130000, expense: 52000 },
];

export default function AccountantDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWithAuth("/dashboard/accountant")
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
    { title: "Total Revenue (YTD)", value: `₹${(stats?.totalCollected || 0).toLocaleString()}`, icon: Wallet, color: "text-blue-400", bg: "bg-blue-500/20", border: "border-blue-500/30" },
    { title: "Monthly Collection", value: `₹${(stats?.monthlyCollected || 0).toLocaleString()}`, icon: IndianRupee, color: "text-emerald-400", bg: "bg-emerald-500/20", border: "border-emerald-500/30" },
    { title: "Pending Dues", value: `₹${(stats?.pendingDues || 0).toLocaleString()}`, icon: FileWarning, color: "text-rose-400", bg: "bg-rose-500/20", border: "border-rose-500/30" },
    { title: "Active Defaulters", value: stats?.activeDefaulters || 0, icon: TrendingUp, color: "text-amber-400", bg: "bg-amber-500/20", border: "border-amber-500/30" },
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
          <h3 className="text-lg font-bold mb-6">Income vs Expenses</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockFinanceData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis dataKey="name" stroke="#4b5563" tick={{fill: '#9ca3af'}} />
                <YAxis stroke="#4b5563" tick={{fill: '#9ca3af'}} tickFormatter={(val) => `₹${val/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#f3f4f6' }}
                  cursor={{fill: '#1f2937'}}
                  formatter={(value: any) => [`₹${(value || 0).toLocaleString()}`, '']}
                />
                <Legend />
                <Bar name="Income" dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar name="Expense" dataKey="expense" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
          <h3 className="text-lg font-bold mb-6">Recent Transactions</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-black/20 border border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <ArrowDownRight size={20} />
                </div>
                <div>
                  <p className="text-sm font-medium">Term 1 Fee - John D.</p>
                  <p className="text-xs text-gray-500">Today, 10:42 AM</p>
                </div>
              </div>
              <p className="text-emerald-400 font-bold text-sm">+₹12,500</p>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-xl bg-black/20 border border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center">
                  <ArrowUpRight size={20} />
                </div>
                <div>
                  <p className="text-sm font-medium">Electricity Bill</p>
                  <p className="text-xs text-gray-500">Yesterday, 04:15 PM</p>
                </div>
              </div>
              <p className="text-rose-400 font-bold text-sm">-₹4,200</p>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-black/20 border border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <ArrowDownRight size={20} />
                </div>
                <div>
                  <p className="text-sm font-medium">Bus Fee - Class X</p>
                  <p className="text-xs text-gray-500">Oct 12, 09:30 AM</p>
                </div>
              </div>
              <p className="text-emerald-400 font-bold text-sm">+₹8,000</p>
            </div>
          </div>
          <button className="w-full mt-4 py-2 text-sm text-blue-400 font-medium hover:text-blue-300">View All Transactions</button>
        </div>
      </div>
    </div>
  );
}
