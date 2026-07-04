"use client";
import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/api";
import { BookOpen, Layers, Users, Plus, Loader2 } from "lucide-react";

export default function AcademicsPage() {
  const [activeTab, setActiveTab] = useState<"classes" | "sections" | "subjects">("classes");
  const [classes, setClasses] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [showClassModal, setShowClassModal] = useState(false);
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [showSubjectModal, setShowSubjectModal] = useState(false);

  // Forms state
  const [newClass, setNewClass] = useState({ name: "", order: 1 });
  const [newSection, setNewSection] = useState({ name: "", classId: "" });
  const [newSubject, setNewSubject] = useState({ name: "", code: "" });

  const loadData = async () => {
    setLoading(true);
    try {
      const [cls, sec, sub] = await Promise.all([
        fetchWithAuth("/academics/classes"),
        fetchWithAuth("/academics/sections"),
        fetchWithAuth("/academics/subjects"),
      ]);
      setClasses(cls);
      setSections(sec);
      setSubjects(sub);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchWithAuth("/academics/classes", {
        method: "POST",
        body: JSON.stringify(newClass),
      });
      setShowClassModal(false);
      setNewClass({ name: "", order: 1 });
      loadData();
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const handleCreateSection = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchWithAuth("/academics/sections", {
        method: "POST",
        body: JSON.stringify(newSection),
      });
      setShowSectionModal(false);
      setNewSection({ name: "", classId: "" });
      loadData();
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchWithAuth("/academics/subjects", {
        method: "POST",
        body: JSON.stringify(newSubject),
      });
      setShowSubjectModal(false);
      setNewSubject({ name: "", code: "" });
      loadData();
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
            Academics Structure
          </h1>
          <p className="text-gray-400 mt-1">Manage classes, sections, and subjects.</p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={() => setShowClassModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600/10 text-purple-400 hover:bg-purple-600/20 rounded-xl transition-all font-medium border border-purple-600/20"
          >
            <Plus className="w-4 h-4" />
            Add Class
          </button>
          <button
            onClick={() => setShowSectionModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600/10 text-blue-400 hover:bg-blue-600/20 rounded-xl transition-all font-medium border border-blue-600/20"
          >
            <Plus className="w-4 h-4" />
            Add Section
          </button>
          <button
            onClick={() => setShowSubjectModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600/10 text-emerald-400 hover:bg-emerald-600/20 rounded-xl transition-all font-medium border border-emerald-600/20"
          >
            <Plus className="w-4 h-4" />
            Add Subject
          </button>
        </div>
      </div>

      <div className="flex gap-4 border-b border-gray-800 pb-px">
        {[
          { id: "classes", label: "Classes", icon: Layers },
          { id: "sections", label: "Sections", icon: Users },
          { id: "subjects", label: "Subjects", icon: BookOpen },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors border-b-2 -mb-px ${
              activeTab === tab.id
                ? "border-purple-500 text-purple-400 bg-purple-500/10"
                : "border-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-800/50"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeTab === "classes" &&
          classes.map((cls: any) => (
            <div key={cls.id} className="p-6 rounded-2xl bg-gray-900 border border-gray-800 hover:border-purple-500/50 transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Layers className="w-16 h-16 text-purple-500" />
              </div>
              <h3 className="text-xl font-semibold text-white">{cls.name}</h3>
              <p className="text-gray-400 text-sm mt-1">Order: {cls.order}</p>
              
              <div className="mt-4 pt-4 border-t border-gray-800 flex justify-between text-sm">
                <span className="text-gray-500">{cls.sections?.length || 0} Sections</span>
              </div>
            </div>
          ))}

        {activeTab === "sections" &&
          sections.map((sec: any) => (
            <div key={sec.id} className="p-6 rounded-2xl bg-gray-900 border border-gray-800 hover:border-blue-500/50 transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Users className="w-16 h-16 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold text-white">{sec.name}</h3>
              <p className="text-gray-400 text-sm mt-1">Class: {sec.class?.name}</p>
            </div>
          ))}

        {activeTab === "subjects" &&
          subjects.map((sub: any) => (
            <div key={sub.id} className="p-6 rounded-2xl bg-gray-900 border border-gray-800 hover:border-emerald-500/50 transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <BookOpen className="w-16 h-16 text-emerald-500" />
              </div>
              <h3 className="text-xl font-semibold text-white">{sub.name}</h3>
              <p className="text-gray-400 text-sm mt-1">Code: {sub.code}</p>
            </div>
          ))}
      </div>

      {/* Class Modal */}
      {showClassModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-bold mb-6">Create New Class</h2>
            <form onSubmit={handleCreateClass} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Class Name</label>
                <input
                  required
                  value={newClass.name}
                  onChange={e => setNewClass({...newClass, name: e.target.value})}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
                  placeholder="e.g. Class 10"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Display Order</label>
                <input
                  required
                  type="number"
                  value={newClass.order}
                  onChange={e => setNewClass({...newClass, order: parseInt(e.target.value)})}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
                />
              </div>
              <div className="flex gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => setShowClassModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl transition-all font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl transition-all font-medium shadow-lg shadow-purple-500/25"
                >
                  Create Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Section Modal */}
      {showSectionModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-bold mb-6">Create New Section</h2>
            <form onSubmit={handleCreateSection} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Select Class</label>
                <select
                  required
                  value={newSection.classId}
                  onChange={e => setNewSection({...newSection, classId: e.target.value})}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                >
                  <option value="">Select a class...</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Section Name</label>
                <input
                  required
                  value={newSection.name}
                  onChange={e => setNewSection({...newSection, name: e.target.value})}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                  placeholder="e.g. Section A"
                />
              </div>
              <div className="flex gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => setShowSectionModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl transition-all font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all font-medium shadow-lg shadow-blue-500/25"
                >
                  Create Section
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Subject Modal */}
      {showSubjectModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-bold mb-6">Create New Subject</h2>
            <form onSubmit={handleCreateSubject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Subject Name</label>
                <input
                  required
                  value={newSubject.name}
                  onChange={e => setNewSubject({...newSubject, name: e.target.value})}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                  placeholder="e.g. Mathematics"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Subject Code (Optional)</label>
                <input
                  value={newSubject.code}
                  onChange={e => setNewSubject({...newSubject, code: e.target.value})}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                  placeholder="e.g. MATH101"
                />
              </div>
              <div className="flex gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => setShowSubjectModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl transition-all font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-all font-medium shadow-lg shadow-emerald-500/25"
                >
                  Create Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
