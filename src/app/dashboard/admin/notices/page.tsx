"use client";
import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/api";
import { Megaphone, Plus, Trash2, Loader2, Calendar } from "lucide-react";

export default function NoticesPage() {
  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [newNotice, setNewNotice] = useState({
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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetchWithAuth("/operations/notices", {
        method: "POST",
        body: JSON.stringify(newNotice),
      });
      setShowModal(false);
      setNewNotice({
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
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this notice?")) return;
    try {
      await fetchWithAuth(`/operations/notices/${id}`, { method: "DELETE" });
      loadNotices();
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  if (loading && notices.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500">
            Notice Board
          </h1>
          <p className="text-gray-400 mt-1">Broadcast announcements to students and staff.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600/10 text-purple-400 hover:bg-purple-600/20 rounded-xl transition-all font-medium border border-purple-600/20 shadow-lg"
        >
          <Plus className="w-4 h-4" />
          Create Notice
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {notices.map((notice) => (
          <div key={notice.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-purple-500/50 transition-all flex flex-col group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Megaphone className="w-24 h-24 text-purple-500" />
            </div>
            
            <div className="flex justify-between items-start mb-4 relative z-10">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
                {notice.type}
              </span>
              <button
                onClick={() => handleDelete(notice.id)}
                className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            
            <h3 className="text-xl font-bold text-white mb-2 relative z-10">{notice.title}</h3>
            <p className="text-gray-400 text-sm flex-1 whitespace-pre-wrap relative z-10">{notice.content}</p>
            
            <div className="mt-6 pt-4 border-t border-gray-800 flex items-center justify-between text-xs text-gray-500 relative z-10">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(notice.publishDate).toLocaleDateString()}
              </div>
              <div>
                Target: <span className="font-medium text-gray-300">{notice.targetAudience}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {!loading && notices.length === 0 && (
        <div className="text-center py-16 bg-gray-900 border border-gray-800 rounded-2xl">
          <Megaphone className="w-16 h-16 text-gray-700 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-white mb-2">No Active Notices</h3>
          <p className="text-gray-400 max-w-sm mx-auto">There are currently no announcements. Click 'Create Notice' to broadcast a new message.</p>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 text-white">Create New Notice</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Title</label>
                <input
                  required
                  value={newNotice.title}
                  onChange={e => setNewNotice({...newNotice, title: e.target.value})}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
                  placeholder="e.g. Annual Sports Day"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Type</label>
                  <select
                    value={newNotice.type}
                    onChange={e => setNewNotice({...newNotice, type: e.target.value})}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
                  >
                    <option value="GENERAL">General</option>
                    <option value="EXAM">Exam</option>
                    <option value="HOLIDAY">Holiday</option>
                    <option value="EVENT">Event</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Target Audience</label>
                  <select
                    value={newNotice.targetAudience}
                    onChange={e => setNewNotice({...newNotice, targetAudience: e.target.value})}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
                  >
                    <option value="ALL">All</option>
                    <option value="STAFF">Staff Only</option>
                    <option value="STUDENTS">Students Only</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Content</label>
                <textarea
                  required
                  rows={4}
                  value={newNotice.content}
                  onChange={e => setNewNotice({...newNotice, content: e.target.value})}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all resize-none"
                  placeholder="Write the announcement here..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Publish Date</label>
                  <input
                    required
                    type="date"
                    value={newNotice.publishDate}
                    onChange={e => setNewNotice({...newNotice, publishDate: e.target.value})}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Expiry Date (Optional)</label>
                  <input
                    type="date"
                    value={newNotice.expiryDate}
                    onChange={e => setNewNotice({...newNotice, expiryDate: e.target.value})}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-8 pt-4 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl transition-all font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl transition-all font-medium shadow-lg shadow-purple-500/25 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Broadcast Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
