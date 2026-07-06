"use client";
import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/api";
import { Calendar, Loader2 } from "lucide-react";

const DAYS_OF_WEEK = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

export default function PrincipalTimetablePage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [periods, setPeriods] = useState<any[]>([]);
  const [entries, setEntries] = useState<any[]>([]);
  
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedSectionId, setSelectedSectionId] = useState("");
  const [loading, setLoading] = useState(true);
  const [fetchingGrid, setFetchingGrid] = useState(false);

  useEffect(() => {
    const loadBaseData = async () => {
      try {
        const [clsData, perData] = await Promise.all([
          fetchWithAuth("/academics/classes"),
          fetchWithAuth("/operations/timetable/periods"),
        ]);
        setClasses(clsData);
        setPeriods(perData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadBaseData();
  }, []);

  useEffect(() => {
    if (!selectedSectionId) {
      setEntries([]);
      return;
    }
    const loadGrid = async () => {
      setFetchingGrid(true);
      try {
        const data = await fetchWithAuth(`/operations/timetable/entries?sectionId=${selectedSectionId}`);
        setEntries(data);
      } catch (err) {
        console.error(err);
      } finally {
        setFetchingGrid(false);
      }
    };
    loadGrid();
  }, [selectedSectionId]);

  const selectedClass = classes.find(c => c.id === selectedClassId);
  const sections = selectedClass?.sections || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-cyan-500">
            School Timetable
          </h1>
          <p className="text-gray-400 mt-1">View the weekly schedule for any class section.</p>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-lg">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-400 mb-1">Class</label>
            <select
              value={selectedClassId}
              onChange={(e) => {
                setSelectedClassId(e.target.value);
                setSelectedSectionId("");
              }}
              className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              <option value="">Select a class...</option>
              {classes.map(cls => (
                <option key={cls.id} value={cls.id}>{cls.name}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-400 mb-1">Section</label>
            <select
              value={selectedSectionId}
              onChange={(e) => setSelectedSectionId(e.target.value)}
              disabled={!selectedClassId || sections.length === 0}
              className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50"
            >
              <option value="">Select a section...</option>
              {sections.map((sec: any) => (
                <option key={sec.id} value={sec.id}>{sec.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {selectedSectionId && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-lg">
          {fetchingGrid ? (
            <div className="flex justify-center p-12">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
          ) : periods.length === 0 ? (
            <div className="text-center p-12 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No periods have been defined by the administration.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm min-w-[800px]">
                <thead className="bg-gray-800/50 border-b border-gray-800 text-gray-400">
                  <tr>
                    <th className="px-4 py-4 font-medium w-48 border-r border-gray-800">Time / Period</th>
                    {DAYS_OF_WEEK.map(day => (
                      <th key={day} className="px-4 py-4 font-medium text-center border-r border-gray-800 last:border-0">
                        {day.charAt(0) + day.slice(1).toLowerCase()}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  {periods.map(period => (
                    <tr key={period.id} className="hover:bg-gray-800/25 transition-colors">
                      <td className="px-4 py-4 border-r border-gray-800 bg-gray-800/10">
                        <div className="font-semibold text-white">{period.name}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {period.startTime} - {period.endTime}
                        </div>
                      </td>
                      {DAYS_OF_WEEK.map(day => {
                        const entry = entries.find(e => e.periodId === period.id && e.dayOfWeek === day);
                        return (
                          <td key={day} className="px-4 py-3 border-r border-gray-800 last:border-0 text-center">
                            {entry ? (
                              <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-2 flex flex-col items-center justify-center min-h-[60px]">
                                <span className="font-semibold text-indigo-400 block">{entry.subject?.name}</span>
                                <span className="text-xs text-gray-400 mt-1 block">
                                  {entry.teacher?.user?.firstName} {entry.teacher?.user?.lastName}
                                </span>
                              </div>
                            ) : (
                              <div className="text-gray-600 text-xs italic min-h-[60px] flex items-center justify-center">
                                Free
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
