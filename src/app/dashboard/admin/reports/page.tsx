"use client";
import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/api";
import { FileText, Loader2, Download, Search } from "lucide-react";

export default function ReportsPage() {
  const [sections, setSections] = useState<any[]>([]);
  const [selectedSection, setSelectedSection] = useState("");
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadingReport, setLoadingReport] = useState(false);

  useEffect(() => {
    fetchWithAuth("/academics/sections")
      .then(res => {
        setSections(res);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const generateReport = async () => {
    if (!selectedSection) return;
    setLoadingReport(true);
    try {
      const data = await fetchWithAuth(`/reports/class/${selectedSection}`);
      setReportData(data);
    } catch (err: any) {
      alert("Error loading report: " + err.message);
    } finally {
      setLoadingReport(false);
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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-600">
            Performance Reports
          </h1>
          <p className="text-gray-400 mt-1">View class and student performance analytics.</p>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-wrap gap-4 items-end shadow-lg">
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
        <button
          onClick={generateReport}
          disabled={!selectedSection || loadingReport}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all font-medium disabled:opacity-50 shadow-lg shadow-blue-500/25"
        >
          {loadingReport ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          Generate Report
        </button>
      </div>

      {reportData && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-lg animate-in fade-in slide-in-from-bottom-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">Class Report: {reportData.section.class.name} - {reportData.section.name}</h2>
            <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors text-sm font-medium border border-gray-700">
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
          
          <div className="overflow-x-auto border border-gray-800 rounded-xl">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-800/50 border-b border-gray-800 text-gray-400">
                <tr>
                  <th className="px-6 py-4 font-medium">Student</th>
                  <th className="px-6 py-4 font-medium text-center">Avg. Marks (%)</th>
                  <th className="px-6 py-4 font-medium text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {reportData.section.students.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                      No students found in this section.
                    </td>
                  </tr>
                ) : (
                  reportData.section.students.map((student: any) => {
                    // Filter exams for this student
                    const studentExams = reportData.results?.filter((r: any) => r.studentId === student.id) || [];
                    
                    let totalMarks = 0;
                    let maxTotal = 0;
                    studentExams.forEach((r: any) => {
                      totalMarks += r.marksObtained;
                      maxTotal += r.maxMarks;
                    });
                    
                    const avg = maxTotal > 0 ? ((totalMarks / maxTotal) * 100).toFixed(1) : "N/A";
                    
                    return (
                      <tr key={student.id} className="hover:bg-gray-800/25 transition-colors">
                        <td className="px-6 py-4 font-medium text-white">
                          {student.user?.firstName} {student.user?.lastName}
                        </td>
                        <td className="px-6 py-4 text-center text-gray-300">
                          {avg}{avg !== "N/A" && "%"}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {avg === "N/A" ? (
                            <span className="text-gray-500 italic">No Data</span>
                          ) : parseFloat(avg) >= 40 ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              Pass
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                              Fail
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
