"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, MoreVertical, CheckCircle2, XCircle, Building2, User, Mail, Lock, Loader2 } from "lucide-react";
import { fetchWithAuth } from "@/lib/api";

export default function SchoolsManagement() {
  const [schools, setSchools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    contactEmail: "",
    subdomain: "",
    adminFirstName: "",
    adminLastName: "",
    adminEmail: "",
    adminPassword: "",
  });

  const fetchSchools = async () => {
    try {
      const data = await fetchWithAuth('/superadmin/schools');
      if (Array.isArray(data)) setSchools(data);
    } catch (error) {
      console.error("Failed to fetch schools:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchools();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await fetchWithAuth('/superadmin/schools', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      setIsModalOpen(false);
      setFormData({ name: "", contactEmail: "", subdomain: "", adminFirstName: "", adminLastName: "", adminEmail: "", adminPassword: "" });
      fetchSchools();
    } catch (error: any) {
      alert("Error creating school: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Schools</h1>
          <p className="text-gray-400 mt-1">Manage registered schools and their statuses</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
        >
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
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-500" />
                  </td>
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

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }} 
              className="glass-panel p-6 w-full max-w-2xl relative z-10 shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Register New School</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <Building2 size={16} /> School Details
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">School Name</label>
                      <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-blue-500 focus:outline-none transition-colors" placeholder="St. Mary's High School" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Subdomain</label>
                      <input value={formData.subdomain} onChange={e => setFormData({...formData, subdomain: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-blue-500 focus:outline-none transition-colors" placeholder="stmarys" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-300 mb-1">Contact Email</label>
                      <input required type="email" value={formData.contactEmail} onChange={e => setFormData({...formData, contactEmail: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-blue-500 focus:outline-none transition-colors" placeholder="contact@stmarys.edu" />
                    </div>
                  </div>
                </div>

                <div className="w-full h-px bg-white/10" />

                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <User size={16} /> Admin Allocation
                  </h3>
                  <p className="text-xs text-gray-500">This will automatically create a School Admin login for this school.</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Admin First Name</label>
                      <input required value={formData.adminFirstName} onChange={e => setFormData({...formData, adminFirstName: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-blue-500 focus:outline-none transition-colors" placeholder="John" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Admin Last Name</label>
                      <input value={formData.adminLastName} onChange={e => setFormData({...formData, adminLastName: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-blue-500 focus:outline-none transition-colors" placeholder="Doe" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Admin Email (Login ID)</label>
                      <div className="relative">
                        <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input required type="email" value={formData.adminEmail} onChange={e => setFormData({...formData, adminEmail: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-white focus:border-blue-500 focus:outline-none transition-colors" placeholder="admin@stmarys.edu" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Temporary Password</label>
                      <div className="relative">
                        <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input required type="text" value={formData.adminPassword} onChange={e => setFormData({...formData, adminPassword: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-white focus:border-blue-500 focus:outline-none transition-colors" placeholder="SecurePassword123!" />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors font-medium">
                    Cancel
                  </button>
                  <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors font-medium flex justify-center items-center gap-2">
                    {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : 'Register School & Create Admin'}
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
