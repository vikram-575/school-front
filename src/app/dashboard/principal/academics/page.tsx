"use client";
import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/api";
import { BookOpen, Users, Loader2 } from "lucide-react";

export default function PrincipalAcademicsPage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAcademics = async () => {
      try {
        const data = await fetchWithAuth("/academics/classes");
        setClasses(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadAcademics();
  }, []);

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
            Academic Structure
          </h1>
          <p className="text-gray-400 mt-1">Overview of classes, sections, and subjects.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((cls) => (
          <div key={cls.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-lg hover:border-indigo-500/50 transition-colors group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <BookOpen className="w-24 h-24 text-indigo-500" />
            </div>
            
            <div className="relative z-10">
              <h3 className="text-2xl font-bold text-white mb-4">Class {cls.name}</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Users className="w-3.5 h-3.5" /> Sections
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {cls.sections?.map((sec: any) => (
                      <span key={sec.id} className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-800 text-gray-300 rounded-lg text-sm border border-gray-700">
                        {sec.name}
                        {sec.classTeacher && (
                          <span className="text-xs text-indigo-400 ml-1">
                            ({sec.classTeacher.user?.firstName} {sec.classTeacher.user?.lastName})
                          </span>
                        )}
                      </span>
                    ))}
                    {(!cls.sections || cls.sections.length === 0) && (
                      <span className="text-sm text-gray-600 italic">No sections configured</span>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5" /> Subjects
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {cls.subjects?.map((sub: any) => (
                      <span key={sub.id} className="inline-flex items-center px-2.5 py-1 bg-indigo-500/10 text-indigo-400 rounded-lg text-sm border border-indigo-500/20">
                        {sub.name}
                      </span>
                    ))}
                    {(!cls.subjects || cls.subjects.length === 0) && (
                      <span className="text-sm text-gray-600 italic">No subjects configured</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {!loading && classes.length === 0 && (
          <div className="col-span-full text-center py-12 bg-gray-900 border border-gray-800 rounded-2xl">
            <BookOpen className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-1">No Classes Configured</h3>
            <p className="text-gray-400">The school admin has not set up any classes yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
