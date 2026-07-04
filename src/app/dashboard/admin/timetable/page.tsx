"use client";
import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/api";
import { Calendar, Clock, Loader2, Save } from "lucide-react";

export default function TimetablePage() {
  const [sections, setSections] = useState<any[]>([]);
  const [periods, setPeriods] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  
  const [selectedSection, setSelectedSection] = useState<string>("");
  const [timetable, setTimetable] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // For editing a specific cell
  const [editingCell, setEditingCell] = useState<{ dayOfWeek: number, periodId: string } | null>(null);
  const [editData, setEditData] = useState({ subjectId: "", teacherId: "" });

  const loadBaseData = async () => {
    try {
      const [sec, per, sub, usr] = await Promise.all([
        fetchWithAuth("/academics/sections"),
        fetchWithAuth("/operations/timetable/periods"),
        fetchWithAuth("/academics/subjects"),
        fetchWithAuth("/users?role=TEACHER"), // Get teachers for assigning
      ]);
      setSections(sec);
      setPeriods(per);
      setSubjects(sub);
      setStaff(usr);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBaseData();
  }, []);

  const loadTimetable = async () => {
    if (!selectedSection) return;
    setLoading(true);
    try {
      const data = await fetchWithAuth(`/operations/timetable?sectionId=${selectedSection}`);
      setTimetable(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTimetable();
  }, [selectedSection]);

  const handleSaveCell = async () => {
    if (!editingCell || !editData.subjectId) return;
    
    try {
      await fetchWithAuth("/operations/timetable", {
        method: "POST",
        body: JSON.stringify({
          sectionId: selectedSection,
          periodId: editingCell.periodId,
          dayOfWeek: editingCell.dayOfWeek,
          subjectId: editData.subjectId,
          teacherId: editData.teacherId || undefined,
        }),
      });
      setEditingCell(null);
      loadTimetable();
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const getEntryForCell = (day: number, periodId: string) => {
    return timetable.find(t => t.dayOfWeek === day && t.periodId === periodId);
  };

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  if (loading && sections.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-500 to-blue-600">
            Timetable Management
          </h1>
          <p className="text-gray-400 mt-1">Schedule classes, subjects, and teachers.</p>
        </div>
      </div>

      <div className="flex gap-4 p-4 bg-gray-900 border border-gray-800 rounded-2xl items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-400 mb-1">Select Section</label>
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
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
          {periods.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No periods defined yet. Please set up periods in settings.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-800/50 border-b border-gray-800 text-gray-400">
                  <tr>
                    <th className="px-6 py-4 font-medium border-r border-gray-800 w-32">Period</th>
                    {days.map((day, idx) => (
                      <th key={day} className="px-6 py-4 font-medium text-center border-r border-gray-800">{day}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  {periods.map((period) => (
                    <tr key={period.id}>
                      <td className="px-6 py-4 border-r border-gray-800 bg-gray-800/20">
                        <div className="font-bold text-white">{period.name}</div>
                        <div className="text-xs text-gray-500">{period.startTime} - {period.endTime}</div>
                      </td>
                      {days.map((day, idx) => {
                        const dayNum = idx + 1; // 1 = Monday
                        const entry = getEntryForCell(dayNum, period.id);
                        const isEditing = editingCell?.dayOfWeek === dayNum && editingCell?.periodId === period.id;
                        
                        return (
                          <td key={day} className="border-r border-gray-800 relative group p-0 h-24 align-top w-48">
                            {isEditing ? (
                              <div className="absolute inset-0 bg-gray-800 p-2 z-10 flex flex-col gap-2 shadow-xl border border-cyan-500">
                                <select 
                                  className="w-full text-xs bg-gray-900 border border-gray-700 rounded p-1"
                                  value={editData.subjectId}
                                  onChange={e => setEditData({...editData, subjectId: e.target.value})}
                                >
                                  <option value="">Subject</option>
                                  {subjects.map(sub => <option key={sub.id} value={sub.id}>{sub.name}</option>)}
                                </select>
                                <select 
                                  className="w-full text-xs bg-gray-900 border border-gray-700 rounded p-1"
                                  value={editData.teacherId}
                                  onChange={e => setEditData({...editData, teacherId: e.target.value})}
                                >
                                  <option value="">Teacher (Optional)</option>
                                  {staff.map(st => <option key={st.id} value={st.id}>{st.firstName} {st.lastName}</option>)}
                                </select>
                                <div className="flex gap-1 mt-auto">
                                  <button onClick={handleSaveCell} className="flex-1 bg-cyan-600 text-white text-xs py-1 rounded">Save</button>
                                  <button onClick={() => setEditingCell(null)} className="flex-1 bg-gray-700 text-white text-xs py-1 rounded">Cancel</button>
                                </div>
                              </div>
                            ) : (
                              <div 
                                className="absolute inset-0 p-3 hover:bg-gray-800/50 cursor-pointer transition-colors"
                                onClick={() => {
                                  setEditData({
                                    subjectId: entry?.subjectId || "",
                                    teacherId: entry?.teacherId || ""
                                  });
                                  setEditingCell({ dayOfWeek: dayNum, periodId: period.id });
                                }}
                              >
                                {entry ? (
                                  <div className="h-full flex flex-col justify-center">
                                    <div className="font-bold text-cyan-400 truncate">{entry.subject?.name}</div>
                                    <div className="text-xs text-gray-400 truncate">
                                      {entry.teacher ? `${entry.teacher.firstName} ${entry.teacher.lastName}` : "No teacher"}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">Assign</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
