"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Shield, ArrowRight, Lock, Mail, Building2 } from "lucide-react";
import { createClient } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("one.schooladmin@example.com");
  const [password, setPassword] = useState("Vikram@575@9044530341");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const { createClient } = await import("@/lib/supabase");
      const supabase = createClient();
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (authError) {
        throw new Error(authError.message);
      }
      
      if (data.session) {
        document.cookie = `access_token=${data.session.access_token}; path=/; max-age=86400`;
      }
      
      const { fetchWithAuth } = await import("@/lib/api");
      const profile = await fetchWithAuth("/auth/me");
      const roleName = profile?.role?.name;

      if (roleName === "SUPER_ADMIN") router.push("/dashboard/super-admin");
      else if (roleName === "SCHOOL_ADMIN") router.push("/dashboard/admin");
      else if (roleName === "PRINCIPAL") router.push("/dashboard/principal");
      else if (roleName === "HR") router.push("/dashboard/hr");
      else if (roleName === "ACCOUNTANT") router.push("/dashboard/accountant");
      else router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 relative overflow-hidden">
      <div className="absolute w-[600px] h-[600px] rounded-full bg-blue-500/10 blur-[100px] -top-32 -left-32 pointer-events-none" />
      <div className="absolute w-[400px] h-[400px] rounded-full bg-purple-500/10 blur-[80px] -bottom-32 -right-32 pointer-events-none" />

      <div className="w-full max-w-md p-8 relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-6 shadow-[0_8px_32px_rgba(59,130,246,0.3)]">
            <Building2 size={32} color="white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">School Portal</h1>
          <p className="text-gray-400">Sign in to manage school activities</p>
        </div>

        <form onSubmit={handleLogin} className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-400 block mb-2">Email Address</label>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
                required
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="text-sm font-medium text-gray-400 block mb-2">Password</label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-10 pr-12 text-white focus:outline-none focus:border-blue-500 transition-colors"
                required
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          
          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm flex items-center gap-2">
              <Shield size={16} /> {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            {loading ? "Signing in..." : (
              <>Sign in to Dashboard <ArrowRight size={18} /></>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
