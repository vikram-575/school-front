"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LayoutDashboard, Users, Calendar, Megaphone, Settings, LogOut, Loader2, BookOpen, UserCircle, Briefcase, FileText, Building2 } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { fetchWithAuth } from "@/lib/api";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push("/login");
      } else {
        fetchWithAuth("/auth/me")
          .then((profile) => {
            setRole(profile?.role?.name || "");
            setLoading(false);
          })
          .catch(() => {
            router.push("/login");
          });
      }
    });
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
        <p className="text-gray-400">Loading School Dashboard...</p>
      </div>
    );
  }

  const getNavLinks = () => {
    switch (role) {
      case "SUPER_ADMIN":
        return [
          { name: "Platform Overview", icon: LayoutDashboard, href: "/dashboard/super-admin" },
          { name: "Schools", icon: Building2, href: "/dashboard/super-admin/schools" },
          { name: "Subscriptions", icon: FileText, href: "/dashboard/super-admin/subscriptions" },
          { name: "Audit Logs", icon: Settings, href: "/dashboard/super-admin/logs" },
        ];
      case "SCHOOL_ADMIN":
        return [
          { name: "Overview", icon: LayoutDashboard, href: "/dashboard/admin" },
          { name: "Academics", icon: BookOpen, href: "/dashboard/admin/academics" },
          { name: "Staff", icon: Briefcase, href: "/dashboard/admin/staff" },
          { name: "Students", icon: Users, href: "/dashboard/admin/students" },
          { name: "Attendance", icon: Calendar, href: "/dashboard/admin/attendance" },
          { name: "Timetable", icon: Calendar, href: "/dashboard/admin/timetable" },
          { name: "Leaves", icon: UserCircle, href: "/dashboard/admin/leaves" },
          { name: "Notices", icon: Megaphone, href: "/dashboard/admin/notices" },
          { name: "Finance", icon: FileText, href: "/dashboard/admin/finance" },
          { name: "Exams", icon: FileText, href: "/dashboard/admin/exams" },
          { name: "Reports", icon: FileText, href: "/dashboard/admin/reports" },
          { name: "Settings", icon: Settings, href: "/dashboard/admin/settings" },
        ];
      case "PRINCIPAL":
        return [
          { name: "Overview", icon: LayoutDashboard, href: "/dashboard/principal" },
          { name: "Academics", icon: BookOpen, href: "/dashboard/principal/academics" },
          { name: "Timetable", icon: Calendar, href: "/dashboard/principal/timetable" },
        ];
      case "HR":
        return [
          { name: "Overview", icon: LayoutDashboard, href: "/dashboard/hr" },
          { name: "Staff Directory", icon: Users, href: "/dashboard/hr/staff" },
          { name: "Leave Management", icon: Calendar, href: "/dashboard/hr/leaves" },
        ];
      case "ACCOUNTANT":
        return [
          { name: "Overview", icon: LayoutDashboard, href: "/dashboard/accountant" },
          { name: "Finance Dashboard", icon: FileText, href: "/dashboard/accountant/finance" },
        ];
      default:
        return [
          { name: "Overview", icon: LayoutDashboard, href: "/dashboard" },
        ];
    }
  };

  const navLinks = getNavLinks();

  return (
    <div className="min-h-screen flex bg-[#0B1120] text-gray-100 font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 bg-[#0B1120] flex flex-col">
        <div className="p-6 border-b border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <BookOpen size={20} color="white" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight">School OS</h1>
            <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold">{role.replace("_", " ")} Portal</p>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {navLinks.map((link, i) => (
            <a key={i} href={link.href} className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-gray-100 hover:bg-white/5 transition-colors font-medium">
              <link.icon size={18} />
              {link.name}
            </a>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-gray-100 hover:bg-white/5 transition-colors font-medium">
            <UserCircle size={18} />
            My Profile
          </button>
          <button 
            onClick={() => {
              createClient().auth.signOut().then(() => router.push("/login"));
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors font-medium"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-20 border-b border-white/10 flex items-center justify-between px-10 bg-white/5 backdrop-blur-md">
          <h2 className="text-xl font-bold tracking-tight">Dashboard Overview</h2>
          
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/30 ring-2 ring-white/10 cursor-pointer">
              U
            </div>
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto p-10 bg-[#060a13]">
          {children}
        </div>
      </main>
    </div>
  );
}
