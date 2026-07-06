"use client";
import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/api";
import { Users, UserCircle, BookOpen, Clock, Loader2 } from "lucide-react";

export default function PrincipalDashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    activeClasses: 0,
    pendingLeaves: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [students, teachers, classes, leaves] = await Promise.all([
          fetchWithAuth("/users?role=STUDENT"),
          fetchWithAuth("/users?role=TEACHER"),
          fetchWithAuth("/academics/classes"),
          fetchWithAuth("/operations/leaves?status=PENDING"),
        ]);
        
        setStats({
          totalStudents: students.length,
          totalTeachers: teachers.length,
          activeClasses: classes.length,
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
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-cyan-500">
            Principal's Office
          </h1>
          <p className="text-gray-400 mt-1">Platform overview and school statistics.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Users className="w-32 h-32 text-indigo-500" />
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-gray-400 font-medium">Total Students</h3>
          </div>
          <p className="text-4xl font-bold text-white">{stats.totalStudents}</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <UserCircle className="w-32 h-32 text-cyan-500" />
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-500">
              <UserCircle className="w-6 h-6" />
            </div>
            <h3 className="text-gray-400 font-medium">Teaching Staff</h3>
          </div>
          <p className="text-4xl font-bold text-white">{stats.totalTeachers}</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <BookOpen className="w-32 h-32 text-purple-500" />
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-gray-400 font-medium">Active Classes</h3>
          </div>
          <p className="text-4xl font-bold text-white">{stats.activeClasses}</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Clock className="w-32 h-32 text-amber-500" />
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-gray-400 font-medium">Pending Leaves</h3>
          </div>
          <p className="text-4xl font-bold text-white">{stats.pendingLeaves}</p>
        </div>
      </div>
      
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center mt-8">
        <h3 className="text-xl font-bold text-white mb-2">Welcome to School OS</h3>
        <p className="text-gray-400 max-w-md mx-auto">Use the sidebar to view academic structures and daily timetables. Your view is optimized for oversight and monitoring.</p>
      </div>
    </div>
  );
}
