"use client";
import { useState, useEffect } from "react";
import { fetchWithAuth } from "@/lib/api";
import { Settings, Building2, BookOpen, Bell, Save, Loader2 } from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"general" | "academic" | "notifications">("general");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Settings Form State
  const [general, setGeneral] = useState({
    schoolName: "Springfield High School",
    address: "123 Education Lane",
    contactEmail: "admin@springfield.edu",
    contactPhone: "+1 (555) 123-4567",
  });
  
  const [academic, setAcademic] = useState({
    currentYear: "2026-2027",
    gradingSystem: "GPA_4",
    termStructure: "SEMESTER",
  });
  
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    smsAlerts: false,
    dailyDigest: true,
  });

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        const data = await fetchWithAuth("/operations/settings");
        if (data) {
          if (data.general) setGeneral(data.general);
          if (data.academic) setAcademic(data.academic);
          if (data.notifications) setNotifications(data.notifications);
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await fetchWithAuth("/operations/settings", {
        method: "PUT",
        body: JSON.stringify({ general, academic, notifications }),
      });
      alert("Settings saved successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-500">
            School Settings
          </h1>
          <p className="text-gray-400 mt-1">Configure global platform settings for your institution.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Navigation */}
        <div className="w-full md:w-64 space-y-2">
          <button
            onClick={() => setActiveTab("general")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
              activeTab === "general"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                : "text-gray-400 hover:text-gray-200 hover:bg-gray-800"
            }`}
          >
            <Building2 className="w-5 h-5" />
            General Profile
          </button>
          
          <button
            onClick={() => setActiveTab("academic")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
              activeTab === "academic"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                : "text-gray-400 hover:text-gray-200 hover:bg-gray-800"
            }`}
          >
            <BookOpen className="w-5 h-5" />
            Academic Setup
          </button>
          
          <button
            onClick={() => setActiveTab("notifications")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
              activeTab === "notifications"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                : "text-gray-400 hover:text-gray-200 hover:bg-gray-800"
            }`}
          >
            <Bell className="w-5 h-5" />
            Notifications
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-lg">
            <form onSubmit={handleSave} className="space-y-6">
              
              {activeTab === "general" && (
                <div className="space-y-4 animate-in fade-in">
                  <h3 className="text-lg font-bold text-white mb-4 border-b border-gray-800 pb-2">General Profile</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">School Name</label>
                    <input
                      required
                      value={general.schoolName}
                      onChange={e => setGeneral({...general, schoolName: e.target.value})}
                      className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Registered Address</label>
                    <textarea
                      required
                      rows={2}
                      value={general.address}
                      onChange={e => setGeneral({...general, address: e.target.value})}
                      className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Contact Email</label>
                      <input
                        required
                        type="email"
                        value={general.contactEmail}
                        onChange={e => setGeneral({...general, contactEmail: e.target.value})}
                        className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Contact Phone</label>
                      <input
                        required
                        value={general.contactPhone}
                        onChange={e => setGeneral({...general, contactPhone: e.target.value})}
                        className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "academic" && (
                <div className="space-y-4 animate-in fade-in">
                  <h3 className="text-lg font-bold text-white mb-4 border-b border-gray-800 pb-2">Academic Setup</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Active Academic Year</label>
                    <select
                      value={academic.currentYear}
                      onChange={e => setAcademic({...academic, currentYear: e.target.value})}
                      className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    >
                      <option value="2025-2026">2025-2026</option>
                      <option value="2026-2027">2026-2027</option>
                      <option value="2027-2028">2027-2028</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Grading System</label>
                    <select
                      value={academic.gradingSystem}
                      onChange={e => setAcademic({...academic, gradingSystem: e.target.value})}
                      className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    >
                      <option value="GPA_4">GPA (4.0 Scale)</option>
                      <option value="PERCENTAGE">Percentage (%)</option>
                      <option value="LETTER">Letter Grades (A-F)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Term Structure</label>
                    <select
                      value={academic.termStructure}
                      onChange={e => setAcademic({...academic, termStructure: e.target.value})}
                      className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    >
                      <option value="SEMESTER">Semesters (2 terms)</option>
                      <option value="TRIMESTER">Trimesters (3 terms)</option>
                      <option value="QUARTER">Quarters (4 terms)</option>
                    </select>
                  </div>
                </div>
              )}

              {activeTab === "notifications" && (
                <div className="space-y-6 animate-in fade-in">
                  <h3 className="text-lg font-bold text-white mb-4 border-b border-gray-800 pb-2">System Notifications</h3>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">Email Alerts</h4>
                      <p className="text-sm text-gray-500">Receive email notifications for critical events.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={notifications.emailAlerts} onChange={() => setNotifications({...notifications, emailAlerts: !notifications.emailAlerts})} />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">SMS Alerts</h4>
                      <p className="text-sm text-gray-500">Receive SMS notifications for emergencies.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={notifications.smsAlerts} onChange={() => setNotifications({...notifications, smsAlerts: !notifications.smsAlerts})} />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">Daily Digest</h4>
                      <p className="text-sm text-gray-500">Receive a daily summary of school activities.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={notifications.dailyDigest} onChange={() => setNotifications({...notifications, dailyDigest: !notifications.dailyDigest})} />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                    </label>
                  </div>
                </div>
              )}

              <div className="pt-6 border-t border-gray-800 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all font-medium shadow-lg shadow-blue-500/25 disabled:opacity-50 flex items-center gap-2"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
