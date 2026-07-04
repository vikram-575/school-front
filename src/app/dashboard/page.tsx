"use client";
import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/api";
import { Activity, Bell, CalendarCheck, Clock, FileText, UserPlus, GraduationCap, Users, Megaphone } from "lucide-react";

type ActivityItem = {
  id: string;
  type: string;
  title: string;
  timestamp: string;
  user: string;
};

export default function DashboardPage() {
  // Using mock data for the UI since there's no backend endpoint for the generic "activities" feed yet
  const metrics = [
    { label: "Students Present", value: "85%", icon: Users, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    { label: "Classes Active", value: "24", icon: GraduationCap, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
    { label: "Pending Leaves", value: "7", icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
    { label: "Upcoming Events", value: "2", icon: CalendarCheck, color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20" },
  ];

  const recentActivities: ActivityItem[] = [
    { id: "1", type: "notice", title: "Term 1 Examination Schedule Published", timestamp: "10 mins ago", user: "Admin" },
    { id: "2", type: "attendance", title: "Class 10-A Attendance Submitted", timestamp: "1 hour ago", user: "John Doe (Teacher)" },
    { id: "3", type: "leave", title: "New Leave Request from Sarah Smith", timestamp: "2 hours ago", user: "System" },
    { id: "4", type: "fee", title: "Payment Received: Student #1042", timestamp: "3 hours ago", user: "Accountant" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Quick Stats Grid */}
      <div className="grid grid-cols-4 gap-6">
        {metrics.map((m, i) => (
          <div key={i} className={`p-6 rounded-2xl border ${m.border} bg-white/[0.02] hover:bg-white/[0.04] transition-colors relative overflow-hidden group`}>
            <div className={`absolute top-0 right-0 w-32 h-32 ${m.bg} rounded-full blur-3xl -mr-10 -mt-10 transition-opacity opacity-50 group-hover:opacity-100`} />
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className={`p-3 rounded-xl ${m.bg} ${m.color}`}>
                <m.icon size={20} />
              </div>
            </div>
            <div className="relative z-10">
              <p className="text-3xl font-bold text-white mb-1">{m.value}</p>
              <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">{m.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main Feed */}
        <div className="col-span-2 space-y-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Activity className="text-blue-400" size={20} /> 
              Live Activity Feed
            </h3>
            <button className="text-sm text-blue-400 hover:text-blue-300 font-medium">View All</button>
          </div>
          
          <div className="space-y-4">
            {recentActivities.map((activity, i) => (
              <div key={activity.id} className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex gap-4 hover:border-white/10 transition-colors">
                <div className="mt-1">
                  {activity.type === 'notice' && <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400"><Bell size={18} /></div>}
                  {activity.type === 'attendance' && <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400"><UserPlus size={18} /></div>}
                  {activity.type === 'leave' && <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400"><Clock size={18} /></div>}
                  {activity.type === 'fee' && <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-400"><FileText size={18} /></div>}
                </div>
                <div className="flex-1">
                  <h4 className="text-gray-100 font-semibold mb-1 text-base">{activity.title}</h4>
                  <div className="flex items-center gap-3 text-xs font-medium text-gray-500">
                    <span className="text-blue-400">{activity.user}</span>
                    <span className="w-1 h-1 rounded-full bg-gray-600" />
                    <span>{activity.timestamp}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="col-span-1">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-900/40 to-purple-900/40 border border-blue-500/20 backdrop-blur-xl sticky top-6">
            <h3 className="text-lg font-bold mb-6 text-white flex items-center gap-2">
              Quick Actions
            </h3>
            
            <div className="space-y-3">
              {[
                { title: "Broadcast Notice", icon: Megaphone, color: "text-blue-400", bg: "bg-blue-500/10" },
                { title: "Review Leaves", icon: CalendarCheck, color: "text-amber-400", bg: "bg-amber-500/10" },
                { title: "Update Timetable", icon: Clock, color: "text-purple-400", bg: "bg-purple-500/10" },
                { title: "Add New User", icon: UserPlus, color: "text-green-400", bg: "bg-green-500/10" }
              ].map((action, i) => (
                <button key={i} className="w-full flex items-center gap-4 p-4 rounded-xl bg-black/20 border border-white/5 hover:bg-white/5 hover:border-white/10 transition-all group">
                  <div className={`p-2 rounded-lg ${action.bg} ${action.color} group-hover:scale-110 transition-transform`}>
                    <action.icon size={18} />
                  </div>
                  <span className="font-semibold text-sm text-gray-200">{action.title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
}
