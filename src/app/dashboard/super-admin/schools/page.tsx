"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, Plus, MoreVertical, CheckCircle2, XCircle } from "lucide-react";
import { createClient } from "@/lib/supabase";

export default function SchoolsManagement() {
  const [schools, setSchools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchools = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('School')
        .select('*')
        .order('createdAt', { ascending: false });
      
      if (data) setSchools(data);
      setLoading(false);
    };

    fetchSchools();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Schools</h1>
          <p className="text-gray-400 mt-1">Manage registered schools and their statuses</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors">
          <Plus size={18} /> Add New School
        </button>
      </div>

      <div className="glass-panel overflow-hidden flex flex-col">
        <div className="p-4 border-b border-white/5 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="text" 
              placeholder="Search schools..." 
              className="w-full bg-black/20 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-black/20 border-b border-white/5 text-gray-400 text-sm font-medium">
                <th className="p-4 rounded-tl-lg">School Name</th>
                <th className="p-4">Contact Email</th>
                <th className="p-4">Subdomain</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">Loading schools...</td>
                </tr>
              ) : schools.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">No schools found.</td>
                </tr>
              ) : (
                schools.map((school, i) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={school.id} 
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="p-4">
                      <p className="text-white font-medium">{school.name}</p>
                      <p className="text-xs text-gray-500">ID: {school.id.substring(0, 8)}...</p>
                    </td>
                    <td className="p-4 text-gray-300">{school.contactEmail}</td>
                    <td className="p-4 text-gray-300">{school.subdomain || 'N/A'}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        school.status === 'ACTIVE' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 
                        'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {school.status === 'ACTIVE' ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                        {school.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button className="text-gray-400 hover:text-white transition-colors p-1 rounded hover:bg-white/10">
                        <MoreVertical size={18} />
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
