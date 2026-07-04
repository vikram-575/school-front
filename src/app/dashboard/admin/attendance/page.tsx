"use client";
import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/api";
import { Calendar, CheckCircle2, XCircle, Clock, Loader2, Save } from "lucide-react";

export default function AttendancePage() {
  const [sections, setSections] = useState<any[]>([]);
  const [selectedSection, setSelectedSection] = useState<string>("");
  const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0]);
  
  const [students, setStudents] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<Record<string, string>>({}); // userId -> status
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Load sections to populate the dropdown
    fetchWithAuth("/academics/sections")
      .then(setSections)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedSection) return;
    
    // Load students for this section, and existing attendance
    const loadData = async () => {
      setLoading(true);
      try {
        const [stuData, attData] = await Promise.all([
          fetchWithAuth(`/users?role=STUDENT&sectionId=${selectedSection}`), // Backend needs to support sectionId filter, but for now we filter all
          fetchWithAuth(`/operations/attendance?date=${date}&sectionId=${selectedSection}`)
        ]);
        
        // If backend doesn't filter by sectionId yet, we handle it on frontend for prototype
        const filteredStudents = stuData.filter((s: any) => s.studentProfile?.currentSectionId === selectedSection || true); // Assuming they are all for now if backend doesn't link properly
        setStudents(filteredStudents);

        // Map existing attendance
        const attMap: Record<string, string> = {};
        attData.forEach((record: any) => {
          attMap[record.userId] = record.status;
        });
        
        // Default un-marked to PRESENT
        filteredStudents.forEach((s: any) => {
          if (!attMap[s.id]) {
            attMap[s.id] = "PRESENT"; // Default
          }
        });
        
        setAttendance(attMap);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [selectedSection, date]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const records = Object.keys(attendance).map(userId => ({
        userId,
        status: attendance[userId],
      }));
      
      await fetchWithAuth("/operations/attendance", {
        method: "POST",
        body: JSON.stringify({
          date,
          records
        }),
      });
      alert("Attendance saved successfully!");
    } catch (err: any) {
      alert("Failed to save: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const setAll = (status: string) => {
    const newAtt = { ...attendance };
    students.forEach(s => {
      newAtt[s.id] = status;
    });
    setAttendance(newAtt);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-emerald-600">
            Student Attendance
          </h1>
          <p className="text-gray-400 mt-1">Mark daily roll call for students.</p>
        </div>
      </div>

      <div className="flex gap-4 p-4 bg-gray-900 border border-gray-800 rounded-2xl">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-400 mb-1">Select Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all"
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-400 mb-1">Select Section</label>
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all"
          >
            <option value="">Choose a section...</option>
            {sections.map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.class?.name})</option>
            ))}
          </select>
        </div>
      </div>

      {selectedSection && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-800/20">
            <h3 className="font-medium text-white">Students List</h3>
            <div className="flex gap-2">
              <button onClick={() => setAll('PRESENT')} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 transition-all">Mark All Present</button>
              <button onClick={() => setAll('ABSENT')} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all">Mark All Absent</button>
            </div>
          </div>
          
          {loading ? (
            <div className="p-12 flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-green-500" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-800/50 border-b border-gray-800 text-gray-400">
                    <tr>
                      <th className="px-6 py-4 font-medium">Student Name</th>
                      <th className="px-6 py-4 font-medium">Admission No.</th>
                      <th className="px-6 py-4 font-medium text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/50">
                    {students.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                          No students found in this section.
                        </td>
                      </tr>
                    ) : (
                      students.map((student) => (
                        <tr key={student.id} className="hover:bg-gray-800/25 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-medium text-white">
                              {student.firstName} {student.lastName}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-400">
                            {student.studentProfile?.admissionNumber || "N/A"}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex justify-center gap-2">
                              {['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY'].map(status => (
                                <button
                                  key={status}
                                  onClick={() => setAttendance({...attendance, [student.id]: status})}
                                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                                    attendance[student.id] === status 
                                      ? status === 'PRESENT' ? 'bg-green-500 text-white' : 
                                        status === 'ABSENT' ? 'bg-red-500 text-white' : 
                                        status === 'LATE' ? 'bg-yellow-500 text-white' : 'bg-blue-500 text-white'
                                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                  }`}
                                >
                                  {status}
                                </button>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              
              {students.length > 0 && (
                <div className="p-4 border-t border-gray-800 flex justify-end bg-gray-800/20">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-500 text-white rounded-xl transition-all font-medium shadow-lg shadow-green-500/25 disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Attendance
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
