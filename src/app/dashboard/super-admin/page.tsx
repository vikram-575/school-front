"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Building2, Users, CreditCard, Activity, ArrowUpRight } from "lucide-react";
import { createClient } from "@/lib/supabase";

export default function SuperAdminOverview() {
  const [stats, setStats] = useState({
    schools: 0,
    students: 0,
    revenue: 0,
    activeSubscriptions: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const supabase = createClient();
        
        const { count: schoolsCount, error } = await supabase
          .from('School')
          .select('*', { count: 'exact', head: true });

        if (error) {
          console.error("Supabase Error:", error);
        }

        setStats({
          schools: schoolsCount || 0,
          students: 12500, // Placeholder for MVP
          revenue: 45000,  // Placeholder for MVP
          activeSubscriptions: schoolsCount || 0,
        });
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      }
    };

    fetchStats();
  }, []);

  const cards = [
    { title: "Total Schools", value: stats.schools.toString(), icon: Building2, color: "text-blue-400" },
    { title: "Total Students", value: stats.students.toLocaleString(), icon: Users, color: "text-purple-400" },
    { title: "Active Subscriptions", value: stats.activeSubscriptions.toString(), icon: Activity, color: "text-green-400" },
    { title: "Monthly Revenue", value: `$${stats.revenue.toLocaleString()}`, icon: CreditCard, color: "text-yellow-400" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Platform Overview</h1>
          <p className="text-gray-400 mt-1">Monitor your entire SaaS ecosystem</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass-panel p-6 relative overflow-hidden group hover:border-blue-500/50 transition-colors"
          >
            <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-4 ${card.color}`}>
              <card.icon size={24} />
            </div>
            <p className="text-sm font-medium text-gray-400">{card.title}</p>
            <h3 className="text-3xl font-bold text-white mt-1">{card.value}</h3>
            
            <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowUpRight size={20} className="text-gray-500" />
            </div>
          </motion.div>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-panel p-6 lg:col-span-2"
        >
          <h2 className="text-lg font-bold text-white mb-4">Revenue Growth</h2>
          <div className="h-[300px] flex items-center justify-center border border-white/5 rounded-xl bg-black/20">
            <p className="text-gray-500">Chart rendering...</p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-panel p-6"
        >
          <h2 className="text-lg font-bold text-white mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <div className="flex-1">
                  <p className="text-sm text-gray-300">New school registered</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
