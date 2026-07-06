"use client";
import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/api";
import { Calendar as CalendarIcon, CheckCircle, XCircle, Clock, Loader2, Save } from "lucide-react";

export default function AttendancePage() {
  const [sections, setSections] = useState<any[]>([]);
  const [selectedSection, setSelectedSection] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Map of userId -> { status, remarks }
  const [attendanceState, setAttendanceState] = useState<Record<string, { status: string, remarks: string }>>({});

  useEffect(() => {
    fetchWithAuth("/academics/sections")
      .then(res => {
        setSections(res);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!selectedSection || !date) return;
    
    const loadAttendance = async () => {
      setLoading(true);
      try {
        const data = await fetchWithAuth(`/operations/attendance?date=${date}&sectionId=${selectedSection}`);
        setStudents(data);
        
        const initialState: Record<string, any> = {};
        data.forEach((item: any) => {
          initialState[item.student.userId] = {
            status: item.attendance?.status || "PRESENT",
            remarks: item.attendance?.remarks || ""
          };
        });
        setAttendanceState(initialState);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    loadAttendance();
  }, [selectedSection, date]);

  const handleStatusChange = (userId: string, status: string) => {
    setAttendanceState(prev => ({
      ...prev,
      [userId]: { ...prev[userId], status }
    }));
  };

  const handleRemarksChange = (userId: string, remarks: string) => {
    setAttendanceState(prev => ({
      ...prev,
      [userId]: { ...prev[userId], remarks }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const records = Object.entries(attendanceState).map(([userId, data]) => ({
        userId,
        status: data.status,
        remarks: data.remarks
      }));

      await fetchWithAuth("/operations/attendance", {
        method: "POST",
        body: JSON.stringify({ date, records })
      });
      
      alert("Attendance saved successfully!");
    } catch (err: any) {
      alert("Error saving attendance: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const markAll = (status: string) => {
    const newState = { ...attendanceState };
    Object.keys(newState).forEach(userId => {
      newState[userId].status = status;
    });
    setAttendanceState(newState);
  };

  if (loading && sections.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-teal-400">
            Student Attendance
          </h1>
          <p className="text-gray-400 mt-1">Mark and manage daily student attendance.</p>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-wrap gap-4 items-end shadow-lg">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-400 mb-1">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
          />
        </div>
        <div className="flex-1 min-w-[250px]">
          <label className="block text-sm font-medium text-gray-400 mb-1">Select Class Section</label>
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
          >
            <option value="">Choose a section...</option>
            {sections.map(s => <option key={s.id} value={s.id}>{s.name} ({s.class?.name})</option>)}
          </select>
        </div>
      </div>

      {selectedSection && students.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-lg animate-in fade-in slide-in-from-bottom-4">
          <div className="p-4 border-b border-gray-800 bg-gray-800/20 flex justify-between items-center">
            <h3 className="font-medium text-white flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-blue-400" />
              Attendance Roster
            </h3>
            <div className="flex gap-2">
              <button onClick={() => markAll('PRESENT')} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition-colors">
                Mark All Present
              </button>
              <button onClick={() => markAll('ABSENT')} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-colors">
                Mark All Absent
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-800/50 border-b border-gray-800 text-gray-400">
                <tr>
                  <th className="px-6 py-4 font-medium">Student</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {students.map(({ student }) => {
                  const state = attendanceState[student.userId] || { status: "PRESENT", remarks: "" };
                  
                  return (
                    <tr key={student.id} className="hover:bg-gray-800/25 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-medium text-white">
                          {student.user?.firstName} {student.user?.lastName}
                        </div>
                        <div className="text-xs text-gray-500">
                          ID: {student.admissionNumber}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleStatusChange(student.userId, 'PRESENT')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                              state.status === 'PRESENT'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-gray-950 text-gray-400 border border-gray-800 hover:border-gray-600'
                            }`}
                          >
                            <CheckCircle className="w-3.5 h-3.5" /> Present
                          </button>
                          <button
                            onClick={() => handleStatusChange(student.userId, 'ABSENT')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                              state.status === 'ABSENT'
                                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                : 'bg-gray-950 text-gray-400 border border-gray-800 hover:border-gray-600'
                            }`}
                          >
                            <XCircle className="w-3.5 h-3.5" /> Absent
                          </button>
                          <button
                            onClick={() => handleStatusChange(student.userId, 'LATE')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                              state.status === 'LATE'
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                : 'bg-gray-950 text-gray-400 border border-gray-800 hover:border-gray-600'
                            }`}
                          >
                            <Clock className="w-3.5 h-3.5" /> Late
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          value={state.remarks}
                          onChange={(e) => handleRemarksChange(student.userId, e.target.value)}
                          className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                          placeholder="Add remark..."
                        />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          
          <div className="p-4 border-t border-gray-800 bg-gray-800/10 flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all font-medium disabled:opacity-50 shadow-lg shadow-blue-500/25"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Attendance
            </button>
          </div>
        </div>
      )}

      {selectedSection && students.length === 0 && !loading && (
        <div className="text-center py-12 bg-gray-900 border border-gray-800 rounded-2xl">
          <CalendarIcon className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-1">No Students Found</h3>
          <p className="text-gray-400">There are no students enrolled in this section.</p>
        </div>
      )}
    </div>
  );
}
