"use client";
import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/api";
import { Megaphone, Plus, Trash2, Loader2, Calendar } from "lucide-react";

export default function NoticesPage() {
  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    type: "GENERAL",
    targetAudience: "ALL",
    publishDate: new Date().toISOString().split("T")[0],
    expiryDate: "",
  });

  const loadNotices = async () => {
    setLoading(true);
    try {
      const data = await fetchWithAuth("/operations/notices");
      setNotices(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotices();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchWithAuth("/operations/notices", {
        method: "POST",
        body: JSON.stringify({
          ...formData,
          publishDate: new Date(formData.publishDate).toISOString(),
          expiryDate: formData.expiryDate ? new Date(formData.expiryDate).toISOString() : null,
        }),
      });
      setShowModal(false);
      setFormData({
        title: "",
        content: "",
        type: "GENERAL",
        targetAudience: "ALL",
        publishDate: new Date().toISOString().split("T")[0],
        expiryDate: "",
      });
      loadNotices();
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this notice?")) return;
    try {
      await fetchWithAuth(`/operations/notices/${id}`, {
        method: "DELETE",
      });
      loadNotices();
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-fuchsia-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-500 to-pink-600">
            Notice Board
          </h1>
          <p className="text-gray-400 mt-1">Broadcast announcements to students and staff.</p>
        </div>
        
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-fuchsia-600/10 text-fuchsia-400 hover:bg-fuchsia-600/20 rounded-xl transition-all font-medium border border-fuchsia-600/20"
        >
          <Plus className="w-4 h-4" />
          Create Notice
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {notices.length === 0 ? (
          <div className="col-span-full p-12 text-center text-gray-500 bg-gray-900 border border-gray-800 rounded-2xl">
            No notices published yet.
          </div>
        ) : (
          notices.map((notice) => (
            <div key={notice.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-fuchsia-500/50 transition-all relative group overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Megaphone className="w-24 h-24 text-fuchsia-500" />
              </div>
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex gap-2 mb-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider ${
                        notice.type === 'GENERAL' ? 'bg-blue-500/10 text-blue-400' :
                        notice.type === 'ACADEMIC' ? 'bg-purple-500/10 text-purple-400' :
                        'bg-red-500/10 text-red-400'
                      }`}>
                        {notice.type}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider bg-gray-800 text-gray-400">
                        TO: {notice.targetAudience}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-white">{notice.title}</h3>
                  </div>
                  <button
                    onClick={() => handleDelete(notice.id)}
                    className="p-2 bg-gray-800 hover:bg-red-500/20 hover:text-red-400 text-gray-500 rounded-lg transition-all"
                    title="Delete Notice"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <p className="text-gray-400 text-sm whitespace-pre-wrap mb-6 line-clamp-3">
                  {notice.content}
                </p>
                
                <div className="flex items-center gap-4 text-xs text-gray-500 pt-4 border-t border-gray-800">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Published: {new Date(notice.publishDate).toLocaleDateString()}
                  </div>
                  {notice.expiryDate && (
                    <div className="flex items-center gap-1 text-red-500/70">
                      <Calendar className="w-3.5 h-3.5" />
                      Expires: {new Date(notice.expiryDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-2xl shadow-2xl overflow-y-auto max-h-[90vh]">
            <h2 className="text-2xl font-bold mb-6">Create New Notice</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Title</label>
                <input
                  required
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 focus:border-fuchsia-500 transition-all"
                  placeholder="e.g. Annual Sports Day Announcement"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Notice Type</label>
                  <select
                    required
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value})}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 focus:border-fuchsia-500 transition-all"
                  >
                    <option value="GENERAL">General</option>
                    <option value="ACADEMIC">Academic</option>
                    <option value="HOLIDAY">Holiday</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Target Audience</label>
                  <select
                    required
                    value={formData.targetAudience}
                    onChange={e => setFormData({...formData, targetAudience: e.target.value})}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 focus:border-fuchsia-500 transition-all"
                  >
                    <option value="ALL">Everyone</option>
                    <option value="STUDENTS">Students Only</option>
                    <option value="TEACHERS">Teachers Only</option>
                    <option value="PARENTS">Parents Only</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Publish Date</label>
                  <input
                    required
                    type="date"
                    value={formData.publishDate}
                    onChange={e => setFormData({...formData, publishDate: e.target.value})}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 focus:border-fuchsia-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Expiry Date (Optional)</label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={e => setFormData({...formData, expiryDate: e.target.value})}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 focus:border-fuchsia-500 transition-all"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Content</label>
                <textarea
                  required
                  rows={5}
                  value={formData.content}
                  onChange={e => setFormData({...formData, content: e.target.value})}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 focus:border-fuchsia-500 transition-all resize-none"
                  placeholder="Write the notice content here..."
                />
              </div>
              
              <div className="flex gap-3 mt-8 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl transition-all font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded-xl transition-all font-medium shadow-lg shadow-fuchsia-500/25"
                >
                  Publish Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
