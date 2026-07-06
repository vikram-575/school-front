"use client";
import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/api";
import { Users, UserCircle, Briefcase, Calendar, Loader2 } from "lucide-react";

export default function HROverviewPage() {
  const [stats, setStats] = useState({
    totalStaff: 0,
    teachers: 0,
    admins: 0,
    pendingLeaves: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [teachers, admins, hrs, accountants, leaves] = await Promise.all([
          fetchWithAuth("/users?role=TEACHER"),
          fetchWithAuth("/users?role=SCHOOL_ADMIN"),
          fetchWithAuth("/users?role=HR"),
          fetchWithAuth("/users?role=ACCOUNTANT"),
          fetchWithAuth("/operations/leaves?status=PENDING"),
        ]);
        
        setStats({
          totalStaff: teachers.length + admins.length + hrs.length + accountants.length,
          teachers: teachers.length,
          admins: admins.length + hrs.length + accountants.length,
          pendingLeaves: leaves.length,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-rose-500">
            Human Resources
          </h1>
          <p className="text-gray-400 mt-1">Staff overview and HR operations.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Users className="w-32 h-32 text-pink-500" />
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-500">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-gray-400 font-medium">Total Staff</h3>
          </div>
          <p className="text-4xl font-bold text-white">{stats.totalStaff}</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Briefcase className="w-32 h-32 text-purple-500" />
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
              <Briefcase className="w-6 h-6" />
            </div>
            <h3 className="text-gray-400 font-medium">Teaching Staff</h3>
          </div>
          <p className="text-4xl font-bold text-white">{stats.teachers}</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <UserCircle className="w-32 h-32 text-blue-500" />
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
              <UserCircle className="w-6 h-6" />
            </div>
            <h3 className="text-gray-400 font-medium">Admin / Other</h3>
          </div>
          <p className="text-4xl font-bold text-white">{stats.admins}</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Calendar className="w-32 h-32 text-amber-500" />
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-gray-400 font-medium">Pending Leaves</h3>
          </div>
          <p className="text-4xl font-bold text-white">{stats.pendingLeaves}</p>
        </div>
      </div>
    </div>
  );
}
