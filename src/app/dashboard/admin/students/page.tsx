"use client";
import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/api";
import { GraduationCap, UserPlus, Loader2, Edit, Trash2, Filter } from "lucide-react";

export default function StudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Filters
  const [filterClassId, setFilterClassId] = useState("");
  const [filterSectionId, setFilterSectionId] = useState("");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    role: "STUDENT",
    admissionNumber: "",
    sectionId: "",
  });

  const loadData = async () => {
    setLoading(true);
    try {
      let url = "/users?role=STUDENT";
      if (filterSectionId) {
        url += `&sectionId=${filterSectionId}`;
      }
      
      const [studentsData, classesData, sectionsData] = await Promise.all([
        fetchWithAuth(url),
        fetchWithAuth("/academics/classes"),
        fetchWithAuth("/academics/sections")
      ]);
      setStudents(studentsData);
      setClasses(classesData);
      setSections(sectionsData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filterSectionId]);

  const openCreate = () => {
    setEditingId(null);
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      role: "STUDENT",
      admissionNumber: "",
      sectionId: "",
    });
    setShowModal(true);
  };

  const openEdit = (student: any) => {
    setEditingId(student.id);
    setFormData({
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email || "",
      phone: student.phone || "",
      password: "",
      role: "STUDENT",
      admissionNumber: student.studentProfile?.admissionNumber || "",
      sectionId: student.studentProfile?.currentSectionId || "",
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      await fetchWithAuth(`/users/${id}`, { method: "DELETE" });
      loadData();
    } catch (err: any) {
      alert("Error deleting student: " + err.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await fetchWithAuth(`/users/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(formData),
        });
      } else {
        await fetchWithAuth("/users", {
          method: "POST",
          body: JSON.stringify(formData),
        });
      }
      setShowModal(false);
      loadData();
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  if (loading && students.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  // Derived filtered sections based on selected class
  const availableSections = formData.sectionId 
    ? sections // For simplicity in edit mode, show all or fetch by class
    : sections;
    
  const filterAvailableSections = filterClassId 
    ? sections.filter((s: any) => s.classId === filterClassId)
    : sections;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
            Student Roster
          </h1>
          <p className="text-gray-400 mt-1">Manage enrollments and student records.</p>
        </div>
        
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600/20 rounded-xl transition-all font-medium border border-indigo-600/20"
        >
          <UserPlus className="w-4 h-4" />
          Enroll Student
        </button>
      </div>

      <div className="flex gap-4 p-4 bg-gray-900 border border-gray-800 rounded-2xl">
        <div className="flex items-center gap-2 text-gray-400">
          <Filter className="w-4 h-4" />
          <span className="text-sm font-medium">Filters:</span>
        </div>
        <select 
          value={filterClassId}
          onChange={(e) => {
            setFilterClassId(e.target.value);
            setFilterSectionId(""); // Reset section when class changes
          }}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500"
        >
          <option value="">All Classes</option>
          {classes.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        
        <select 
          value={filterSectionId}
          onChange={(e) => setFilterSectionId(e.target.value)}
          disabled={!filterClassId && sections.length > 0} // Optional constraint
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500 disabled:opacity-50"
        >
          <option value="">All Sections</option>
          {filterAvailableSections.map((s: any) => (
            <option key={s.id} value={s.id}>{s.name} ({s.class?.name || 'Unknown Class'})</option>
          ))}
        </select>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="relative">
          {loading && (
            <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm z-10 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-800/50 border-b border-gray-800 text-gray-400">
                <tr>
                  <th className="px-6 py-4 font-medium">Student Name</th>
                  <th className="px-6 py-4 font-medium">Admission No.</th>
                  <th className="px-6 py-4 font-medium">Class & Section</th>
                  <th className="px-6 py-4 font-medium">Email</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {students.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No students found for the selected criteria.
                    </td>
                  </tr>
                ) : (
                  students.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-800/25 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold">
                            {student.firstName[0]}
                          </div>
                          <div>
                            <div className="font-medium text-white">
                              {student.firstName} {student.lastName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-gray-400">
                        {student.studentProfile?.admissionNumber || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-gray-400">
                        {student.studentProfile?.currentSection ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
                            {student.studentProfile.currentSection.class?.name} - {student.studentProfile.currentSection.name}
                          </span>
                        ) : (
                          <span className="text-gray-500 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-400">{student.email}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => openEdit(student)}
                            className="p-2 text-gray-400 hover:text-indigo-400 hover:bg-indigo-400/10 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(student.id, student.firstName)}
                            className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-2xl shadow-2xl overflow-y-auto max-h-[90vh]">
            <h2 className="text-2xl font-bold mb-6">{editingId ? 'Edit Student' : 'Enroll New Student'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">First Name</label>
                  <input
                    required
                    value={formData.firstName}
                    onChange={e => setFormData({...formData, firstName: e.target.value})}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Last Name</label>
                  <input
                    required
                    value={formData.lastName}
                    onChange={e => setFormData({...formData, lastName: e.target.value})}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Student Email</label>
                  <input
                    required={!editingId}
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                  />
                </div>
                {!editingId && (
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Temporary Password</label>
                    <input
                      required
                      type="password"
                      value={formData.password}
                      onChange={e => setFormData({...formData, password: e.target.value})}
                      className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Admission Number</label>
                  <input
                    required
                    value={formData.admissionNumber}
                    onChange={e => setFormData({...formData, admissionNumber: e.target.value})}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                    placeholder="e.g. ADM2026-001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Assign Section</label>
                  <select
                    value={formData.sectionId}
                    onChange={e => setFormData({...formData, sectionId: e.target.value})}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                  >
                    <option value="">-- Unassigned --</option>
                    {sections.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.class?.name} - {s.name}
                      </option>
                    ))}
                  </select>
                </div>
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
                  className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all font-medium shadow-lg shadow-indigo-500/25"
                >
                  {editingId ? 'Save Changes' : 'Enroll Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
