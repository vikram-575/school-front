"use client";
import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/api";
import { GraduationCap, Plus, Loader2, Save } from "lucide-react";

export default function ExamsPage() {
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showExamModal, setShowExamModal] = useState(false);
  
  // Results entry
  const [sections, setSections] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedExam, setSelectedExam] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [results, setResults] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);

  const [examData, setExamData] = useState({
    name: "",
    description: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });

  const loadBaseData = async () => {
    setLoading(true);
    try {
      const [examData, secData, subData] = await Promise.all([
        fetchWithAuth("/academics/exams"),
        fetchWithAuth("/academics/sections"),
        fetchWithAuth("/academics/subjects"),
      ]);
      setExams(examData);
      setSections(secData);
      setSubjects(subData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBaseData();
  }, []);

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchWithAuth("/academics/exams", {
        method: "POST",
        body: JSON.stringify(examData),
      });
      setShowExamModal(false);
      loadBaseData();
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  useEffect(() => {
    if (!selectedSection || !selectedExam || !selectedSubject) return;
    const loadStudentsAndResults = async () => {
      setLoading(true);
      try {
        const [stuData, resData] = await Promise.all([
          fetchWithAuth(`/users?role=STUDENT`),
          fetchWithAuth(`/academics/exams/results?examId=${selectedExam}`),
        ]);
        
        const filteredStudents = stuData.filter((s: any) => s.studentProfile?.currentSectionId === selectedSection || true);
        setStudents(filteredStudents);

        const resMap: Record<string, any> = {};
        resData.forEach((record: any) => {
          if (record.subjectId === selectedSubject) {
            resMap[record.studentId] = {
              marksObtained: record.marksObtained,
              maxMarks: record.maxMarks,
              grade: record.grade,
              remarks: record.remarks,
            };
          }
        });
        
        // Initialize empty cells
        filteredStudents.forEach((s: any) => {
          if (!resMap[s.studentProfile?.id]) {
            resMap[s.studentProfile?.id] = { marksObtained: "", maxMarks: "100", grade: "", remarks: "" };
          }
        });
        
        setResults(resMap);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadStudentsAndResults();
  }, [selectedSection, selectedExam, selectedSubject]);

  const handleSaveResult = async (studentProfileId: string) => {
    setSaving(true);
    const data = results[studentProfileId];
    try {
      await fetchWithAuth("/academics/exams/results", {
        method: "POST",
        body: JSON.stringify({
          examId: selectedExam,
          studentId: studentProfileId,
          subjectId: selectedSubject,
          marksObtained: parseFloat(data.marksObtained),
          maxMarks: parseFloat(data.maxMarks),
          grade: data.grade,
          remarks: data.remarks,
        }),
      });
      alert("Saved!");
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const updateResultField = (studentId: string, field: string, value: string) => {
    setResults(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value
      }
    }));
  };

  if (loading && exams.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-indigo-600">
            Examinations
          </h1>
          <p className="text-gray-400 mt-1">Manage exams, grading, and performance.</p>
        </div>
        
        <button
          onClick={() => setShowExamModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600/10 text-purple-400 hover:bg-purple-600/20 rounded-xl transition-all font-medium border border-purple-600/20"
        >
          <Plus className="w-4 h-4" />
          Create Exam
        </button>
      </div>

      <div className="flex gap-4 p-4 bg-gray-900 border border-gray-800 rounded-2xl items-end flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-400 mb-1">Select Exam</label>
          <select
            value={selectedExam}
            onChange={(e) => setSelectedExam(e.target.value)}
            className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
          >
            <option value="">Choose an exam...</option>
            {exams.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-400 mb-1">Select Section</label>
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
          >
            <option value="">Choose a section...</option>
            {sections.map(s => <option key={s.id} value={s.id}>{s.name} ({s.class?.name})</option>)}
          </select>
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-400 mb-1">Select Subject</label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
          >
            <option value="">Choose a subject...</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
      </div>

      {selectedExam && selectedSection && selectedSubject && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-gray-800 bg-gray-800/20">
            <h3 className="font-medium text-white">Input Grades</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-800/50 border-b border-gray-800 text-gray-400">
                <tr>
                  <th className="px-6 py-4 font-medium">Student</th>
                  <th className="px-6 py-4 font-medium">Marks Obtained</th>
                  <th className="px-6 py-4 font-medium">Max Marks</th>
                  <th className="px-6 py-4 font-medium">Grade</th>
                  <th className="px-6 py-4 font-medium">Remarks</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {students.map((student) => {
                  const spId = student.studentProfile?.id;
                  if (!spId) return null;
                  return (
                    <tr key={student.id} className="hover:bg-gray-800/25 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-white">
                          {student.firstName} {student.lastName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {student.studentProfile?.admissionNumber}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="number"
                          value={results[spId]?.marksObtained || ""}
                          onChange={(e) => updateResultField(spId, 'marksObtained', e.target.value)}
                          className="w-20 bg-gray-950 border border-gray-800 rounded p-1 text-center"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="number"
                          value={results[spId]?.maxMarks || ""}
                          onChange={(e) => updateResultField(spId, 'maxMarks', e.target.value)}
                          className="w-20 bg-gray-950 border border-gray-800 rounded p-1 text-center"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          value={results[spId]?.grade || ""}
                          onChange={(e) => updateResultField(spId, 'grade', e.target.value)}
                          className="w-16 bg-gray-950 border border-gray-800 rounded p-1 text-center"
                          placeholder="A+"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          value={results[spId]?.remarks || ""}
                          onChange={(e) => updateResultField(spId, 'remarks', e.target.value)}
                          className="w-full bg-gray-950 border border-gray-800 rounded p-1"
                          placeholder="Excellent..."
                        />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleSaveResult(spId)}
                          disabled={saving}
                          className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded font-medium text-xs disabled:opacity-50"
                        >
                          Save
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showExamModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-bold mb-6">Create New Exam</h2>
            <form onSubmit={handleCreateExam} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Exam Name</label>
                <input
                  required
                  value={examData.name}
                  onChange={e => setExamData({...examData, name: e.target.value})}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
                  placeholder="e.g. Mid-Term 2026"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Start Date</label>
                  <input
                    required
                    type="date"
                    value={examData.startDate}
                    onChange={e => setExamData({...examData, startDate: e.target.value})}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">End Date</label>
                  <input
                    required
                    type="date"
                    value={examData.endDate}
                    onChange={e => setExamData({...examData, endDate: e.target.value})}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-8 pt-4">
                <button
                  type="button"
                  onClick={() => setShowExamModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl transition-all font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl transition-all font-medium shadow-lg shadow-purple-500/25"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
