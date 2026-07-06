"use client";
import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/api";
import { Calendar as CalendarIcon, Clock, Plus, Loader2, Save, Users, BookOpen } from "lucide-react";

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

export default function TimetablePage() {
  const [sections, setSections] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [periods, setPeriods] = useState<any[]>([]);
  const [timetable, setTimetable] = useState<any[]>([]);
  
  const [selectedSection, setSelectedSection] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"timetable" | "periods">("timetable");

  // Modals
  const [showPeriodModal, setShowPeriodModal] = useState(false);
  const [newPeriod, setNewPeriod] = useState({ name: "", startTime: "", endTime: "", order: 1 });
  
  // Assignment state
  const [assignData, setAssignData] = useState<{ day: string, periodId: string } | null>(null);
  const [assignForm, setAssignForm] = useState({ subjectId: "", teacherId: "" });

  const loadBaseData = async () => {
    setLoading(true);
    try {
      const [sec, sub, tch, per] = await Promise.all([
        fetchWithAuth("/academics/sections"),
        fetchWithAuth("/academics/subjects"),
        fetchWithAuth("/users?role=TEACHER"), // Assuming role filtering works or filter below
        fetchWithAuth("/operations/timetable/periods"),
      ]);
      setSections(sec);
      setSubjects(sub);
      
      const teacherList = tch.filter((u: any) => u.role?.name !== "STUDENT" && u.role?.name !== "SUPER_ADMIN");
      setTeachers(teacherList);
      setPeriods(per);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBaseData();
  }, []);

  useEffect(() => {
    if (!selectedSection) return;
    const loadTimetable = async () => {
      try {
        const data = await fetchWithAuth(`/operations/timetable?sectionId=${selectedSection}`);
        setTimetable(data);
      } catch (err) {
        console.error(err);
      }
    };
    loadTimetable();
  }, [selectedSection]);

  const handleCreatePeriod = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchWithAuth("/operations/timetable/periods", {
        method: "POST",
        body: JSON.stringify(newPeriod),
      });
      setShowPeriodModal(false);
      setNewPeriod({ name: "", startTime: "", endTime: "", order: periods.length + 1 });
      loadBaseData();
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignData || !selectedSection) return;
    
    try {
      await fetchWithAuth("/operations/timetable", {
        method: "POST",
        body: JSON.stringify({
          sectionId: selectedSection,
          periodId: assignData.periodId,
          dayOfWeek: assignData.day,
          subjectId: assignForm.subjectId,
          teacherId: assignForm.teacherId || null,
        }),
      });
      setAssignData(null);
      
      // Reload timetable
      const data = await fetchWithAuth(`/operations/timetable?sectionId=${selectedSection}`);
      setTimetable(data);
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const getEntry = (day: string, periodId: string) => {
    return timetable.find(t => t.dayOfWeek === day && t.periodId === periodId);
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
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-amber-500">
            Timetable Management
          </h1>
          <p className="text-gray-400 mt-1">Configure daily periods and class schedules.</p>
        </div>
      </div>

      <div className="flex gap-4 border-b border-gray-800 pb-px">
        <button
          onClick={() => setActiveTab("timetable")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors border-b-2 -mb-px ${
            activeTab === "timetable"
              ? "border-amber-500 text-amber-400 bg-amber-500/10"
              : "border-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-800/50"
          }`}
        >
          <CalendarIcon className="w-4 h-4" />
          Schedule Grid
        </button>
        <button
          onClick={() => setActiveTab("periods")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors border-b-2 -mb-px ${
            activeTab === "periods"
              ? "border-amber-500 text-amber-400 bg-amber-500/10"
              : "border-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-800/50"
          }`}
        >
          <Clock className="w-4 h-4" />
          Manage Periods
        </button>
      </div>

      {activeTab === "periods" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-lg">
            <div>
              <h3 className="text-lg font-bold text-white">Configured Periods</h3>
              <p className="text-sm text-gray-400">Define the time slots available for scheduling classes.</p>
            </div>
            <button
              onClick={() => setShowPeriodModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl transition-all font-medium shadow-lg shadow-amber-500/25"
            >
              <Plus className="w-4 h-4" />
              Add Period
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {periods.map(p => (
              <div key={p.id} className="p-4 rounded-xl bg-gray-900 border border-gray-800 hover:border-amber-500/50 transition-all">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-white">{p.name}</h4>
                  <span className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded">Order: {p.order}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400 mt-3">
                  <Clock className="w-4 h-4 text-amber-500" />
                  <span>{p.startTime} - {p.endTime}</span>
                </div>
              </div>
            ))}
            {periods.length === 0 && (
              <div className="col-span-full text-center py-12 text-gray-500 border border-dashed border-gray-800 rounded-xl">
                No periods configured yet.
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "timetable" && (
        <div className="space-y-6">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-wrap gap-4 items-end shadow-lg">
            <div className="flex-1 min-w-[250px]">
              <label className="block text-sm font-medium text-gray-400 mb-1">Select Class Section</label>
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
              >
                <option value="">Choose a section...</option>
                {sections.map(s => <option key={s.id} value={s.id}>{s.name} ({s.class?.name})</option>)}
              </select>
            </div>
          </div>

          {selectedSection && periods.length > 0 && (
            <div className="overflow-x-auto bg-gray-900 border border-gray-800 rounded-2xl shadow-lg">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-800/50 border-b border-gray-800">
                  <tr>
                    <th className="px-4 py-4 font-medium text-gray-400 border-r border-gray-800 w-32">Period / Day</th>
                    {DAYS.map(day => (
                      <th key={day} className="px-4 py-4 font-medium text-white text-center border-r border-gray-800 last:border-0">
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {periods.map(period => (
                    <tr key={period.id}>
                      <td className="px-4 py-4 bg-gray-950/50 border-r border-gray-800 text-center">
                        <div className="font-medium text-amber-500">{period.name}</div>
                        <div className="text-xs text-gray-500">{period.startTime} - {period.endTime}</div>
                      </td>
                      {DAYS.map(day => {
                        const entry = getEntry(day, period.id);
                        return (
                          <td key={`${period.id}-${day}`} className="border-r border-gray-800 last:border-0 p-2 relative group hover:bg-gray-800/20 transition-colors h-24">
                            {entry ? (
                              <div 
                                onClick={() => {
                                  setAssignForm({ subjectId: entry.subjectId, teacherId: entry.teacherId || "" });
                                  setAssignData({ day, periodId: period.id });
                                }}
                                className="h-full w-full bg-amber-500/10 border border-amber-500/20 rounded-lg p-2 flex flex-col justify-center items-center text-center cursor-pointer hover:border-amber-500/50 transition-colors"
                              >
                                <div className="font-semibold text-amber-400 text-xs mb-1">{entry.subject?.name}</div>
                                {entry.teacher && (
                                  <div className="text-[10px] text-gray-400 truncate w-full">
                                    {entry.teacher.user?.firstName} {entry.teacher.user?.lastName}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <button
                                onClick={() => {
                                  setAssignForm({ subjectId: "", teacherId: "" });
                                  setAssignData({ day, periodId: period.id });
                                }}
                                className="h-full w-full border border-dashed border-gray-700 rounded-lg flex items-center justify-center text-gray-600 hover:border-amber-500/50 hover:text-amber-500 hover:bg-amber-500/5 transition-colors opacity-0 group-hover:opacity-100"
                              >
                                <Plus className="w-5 h-5" />
                              </button>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {selectedSection && periods.length === 0 && (
            <div className="text-center py-12 bg-gray-900 border border-gray-800 rounded-2xl">
              <Clock className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-1">No Periods Configured</h3>
              <p className="text-gray-400">Please switch to 'Manage Periods' and add time slots first.</p>
            </div>
          )}
        </div>
      )}

      {/* Add Period Modal */}
      {showPeriodModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 text-white">Add Period</h2>
            <form onSubmit={handleCreatePeriod} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Period Name</label>
                <input
                  required
                  value={newPeriod.name}
                  onChange={e => setNewPeriod({...newPeriod, name: e.target.value})}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                  placeholder="e.g. Period 1, Lunch Break"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Start Time</label>
                  <input
                    required
                    type="time"
                    value={newPeriod.startTime}
                    onChange={e => setNewPeriod({...newPeriod, startTime: e.target.value})}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">End Time</label>
                  <input
                    required
                    type="time"
                    value={newPeriod.endTime}
                    onChange={e => setNewPeriod({...newPeriod, endTime: e.target.value})}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Display Order</label>
                <input
                  required
                  type="number"
                  value={newPeriod.order}
                  onChange={e => setNewPeriod({...newPeriod, order: parseInt(e.target.value)})}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                />
              </div>
              <div className="flex gap-3 mt-8 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPeriodModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl transition-all font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl transition-all font-medium shadow-lg shadow-amber-500/25"
                >
                  Save Period
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Entry Modal */}
      {assignData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold mb-6 text-white">
              Assign Subject - {assignData.day}
            </h2>
            <form onSubmit={handleAssignSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1 flex items-center gap-2"><BookOpen className="w-4 h-4"/> Subject</label>
                <select
                  required
                  value={assignForm.subjectId}
                  onChange={e => setAssignForm({...assignForm, subjectId: e.target.value})}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                >
                  <option value="">Select subject...</option>
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1 flex items-center gap-2"><Users className="w-4 h-4"/> Teacher (Optional)</label>
                <select
                  value={assignForm.teacherId}
                  onChange={e => setAssignForm({...assignForm, teacherId: e.target.value})}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                >
                  <option value="">Select teacher...</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.employeeProfile?.id || t.id}>
                      {t.firstName} {t.lastName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 mt-8 pt-4">
                <button
                  type="button"
                  onClick={() => setAssignData(null)}
                  className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl transition-all font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl transition-all font-medium shadow-lg shadow-amber-500/25"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
