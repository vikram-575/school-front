"use client";
import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/api";
import { GraduationCap, UserPlus, Loader2, Edit, Trash2, Filter, X, Mail, Phone, Calendar, BookOpen, Award } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend
} from "recharts";

export default function StudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);

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

  const openEdit = (student: any, e: any) => {
    e.stopPropagation();
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

  const handleDelete = async (id: string, name: string, e: any) => {
    e.stopPropagation();
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
  const availableSections = formData.sectionId ? sections : sections;
  const filterAvailableSections = filterClassId 
    ? sections.filter((s: any) => s.classId === filterClassId)
    : sections;

  // Mock data for charts
  const performanceData = [
    { term: 'Term 1', Math: 85, Science: 78, English: 92 },
    { term: 'Term 2', Math: 88, Science: 82, English: 90 },
    { term: 'Mid-Term', Math: 92, Science: 89, English: 94 },
    { term: 'Finals', Math: 95, Science: 94, English: 96 },
  ];

  const attendanceData = [
    { month: 'Aug', present: 20, absent: 2 },
    { month: 'Sep', present: 21, absent: 1 },
    { month: 'Oct', present: 19, absent: 3 },
    { month: 'Nov', present: 22, absent: 0 },
    { month: 'Dec', present: 15, absent: 2 },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
            Student Directory & Insights
          </h1>
          <p className="text-gray-400 mt-1">Manage enrollments and view deep academic analytics.</p>
        </div>
        
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all font-medium shadow-lg shadow-indigo-500/25"
        >
          <UserPlus className="w-4 h-4" />
          Enroll Student
        </button>
      </div>

      {/* Class Filtering */}
      <div className="flex gap-4 p-4 bg-gray-900 border border-gray-800 rounded-2xl">
        <div className="flex items-center gap-2 text-gray-400">
          <Filter className="w-4 h-4" />
          <span className="text-sm font-medium">Browse By Class:</span>
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
          disabled={!filterClassId && sections.length > 0} 
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500 disabled:opacity-50"
        >
          <option value="">All Sections</option>
          {filterAvailableSections.map((s: any) => (
            <option key={s.id} value={s.id}>{s.name} ({s.class?.name})</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Student List */}
        <div className="lg:col-span-1 bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-lg flex flex-col h-[70vh]">
          <div className="p-4 border-b border-gray-800 bg-gray-900/50">
            <h3 className="font-semibold text-white">Student Roster</h3>
            <p className="text-xs text-gray-400">{students.length} students found</p>
          </div>
          <div className="overflow-y-auto flex-1 p-2 space-y-1">
            {students.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">No students found.</div>
            ) : (
              students.map((student) => (
                <div 
                  key={student.id}
                  onClick={() => setSelectedStudent(student)}
                  className={`p-3 rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                    selectedStudent?.id === student.id 
                      ? 'bg-indigo-600/20 border border-indigo-500/30 shadow-inner'
                      : 'hover:bg-gray-800 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                      selectedStudent?.id === student.id ? 'bg-indigo-500 text-white' : 'bg-gray-800 text-gray-300'
                    }`}>
                      {student.firstName[0]}
                    </div>
                    <div>
                      <div className={`font-medium text-sm ${selectedStudent?.id === student.id ? 'text-white' : 'text-gray-200'}`}>
                        {student.firstName} {student.lastName}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-2">
                        <span>{student.studentProfile?.admissionNumber || 'No ID'}</span>
                        {student.studentProfile?.currentSection && (
                          <span className="text-indigo-400 font-medium">
                            {student.studentProfile.currentSection.class?.name}-{student.studentProfile.currentSection.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={(e) => openEdit(student, e)} className="p-1.5 text-gray-500 hover:text-indigo-400 transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={(e) => handleDelete(student.id, student.firstName, e)} className="p-1.5 text-gray-500 hover:text-red-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Side: Detailed Profile & Charts */}
        <div className="lg:col-span-2">
          {selectedStudent ? (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Profile Header */}
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-lg flex items-start gap-6">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-4xl text-white font-bold shadow-lg shadow-indigo-500/25">
                  {selectedStudent.firstName[0]}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white">
                      {selectedStudent.firstName} {selectedStudent.lastName}
                    </h2>
                    <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-bold uppercase tracking-wider">
                      Active Student
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-300">
                      <Mail className="w-4 h-4 text-gray-500" />
                      {selectedStudent.email || "No email provided"}
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <Phone className="w-4 h-4 text-gray-500" />
                      {selectedStudent.phone || "No phone provided"}
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <Award className="w-4 h-4 text-gray-500" />
                      Admission ID: <span className="font-mono text-indigo-400">{selectedStudent.studentProfile?.admissionNumber || "N/A"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <BookOpen className="w-4 h-4 text-gray-500" />
                      Class: {selectedStudent.studentProfile?.currentSection ? 
                        <span className="text-white font-medium">{selectedStudent.studentProfile.currentSection.class?.name} - {selectedStudent.studentProfile.currentSection.name}</span>
                      : "Unassigned"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Dynamic Charts Area */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Academic Performance Chart */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-lg">
                  <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-indigo-500" />
                    Academic Progression
                  </h3>
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={performanceData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                        <XAxis dataKey="term" stroke="#9CA3AF" tick={{fill: '#9CA3AF', fontSize: 12}} />
                        <YAxis stroke="#9CA3AF" tick={{fill: '#9CA3AF', fontSize: 12}} domain={[0, 100]} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '0.5rem' }}
                          itemStyle={{ fontSize: '14px' }}
                        />
                        <Legend wrapperStyle={{ fontSize: '12px' }} />
                        <Line type="monotone" dataKey="Math" stroke="#6366f1" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
                        <Line type="monotone" dataKey="Science" stroke="#10b981" strokeWidth={3} dot={{r: 4}} />
                        <Line type="monotone" dataKey="English" stroke="#f59e0b" strokeWidth={3} dot={{r: 4}} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Attendance Chart */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-lg">
                  <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-emerald-500" />
                    Attendance Record
                  </h3>
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={attendanceData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                        <XAxis dataKey="month" stroke="#9CA3AF" tick={{fill: '#9CA3AF', fontSize: 12}} />
                        <YAxis stroke="#9CA3AF" tick={{fill: '#9CA3AF', fontSize: 12}} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '0.5rem' }}
                          cursor={{fill: '#1f2937'}}
                        />
                        <Legend wrapperStyle={{ fontSize: '12px' }} />
                        <Bar dataKey="present" name="Present Days" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                        <Bar dataKey="absent" name="Absent Days" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>
            </div>
          ) : (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl flex flex-col items-center justify-center h-full min-h-[500px] text-gray-500">
              <GraduationCap className="w-16 h-16 mb-4 opacity-20" />
              <p>Select a student from the roster to view their detailed profile.</p>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-2xl shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">{editingId ? 'Edit Student' : 'Enroll New Student'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">First Name</label>
                  <input required value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Last Name</label>
                  <input required value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Student Email</label>
                  <input required={!editingId} type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all" />
                </div>
                {!editingId && (
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Temporary Password</label>
                    <input required type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all" />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Admission Number</label>
                  <input required value={formData.admissionNumber} onChange={e => setFormData({...formData, admissionNumber: e.target.value})} className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all" placeholder="e.g. ADM2026-001" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Assign Section</label>
                  <select value={formData.sectionId} onChange={e => setFormData({...formData, sectionId: e.target.value})} className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all">
                    <option value="">-- Unassigned --</option>
                    {sections.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.class?.name} - {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex gap-3 mt-8 pt-4 border-t border-gray-800">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl transition-all font-medium">
                  Cancel
                </button>
                <button type="submit" className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all font-medium shadow-lg shadow-indigo-500/25">
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
