"use client";
import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/api";
import { Users, Mail, Phone, MapPin, Search, Loader2 } from "lucide-react";

export default function HRStaffDirectory() {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const loadStaff = async () => {
      try {
        const [teachers, hr, accountant] = await Promise.all([
          fetchWithAuth("/users?role=TEACHER"),
          fetchWithAuth("/users?role=HR"),
          fetchWithAuth("/users?role=ACCOUNTANT"),
        ]);
        setStaff([...teachers, ...hr, ...accountant]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadStaff();
  }, []);

  const filteredStaff = staff.filter(s => 
    s.firstName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-rose-500">
            Staff Directory
          </h1>
          <p className="text-gray-400 mt-1">Contact information for all school personnel.</p>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 shadow-lg flex items-center gap-3">
        <Search className="w-5 h-5 text-gray-500" />
        <input 
          type="text" 
          placeholder="Search staff by name or email..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-transparent border-none text-white focus:outline-none w-full"
        />
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStaff.map((person) => (
            <div key={person.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-pink-500/50 transition-colors shadow-lg">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-pink-500/25">
                  {person.firstName[0]}{person.lastName[0]}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{person.firstName} {person.lastName}</h3>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-800 text-pink-400 border border-gray-700">
                    {person.role?.name.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <a href={`mailto:${person.email}`} className="hover:text-pink-400 transition-colors">{person.email}</a>
                </div>
                {person.employeeProfile?.phoneNumber && (
                  <div className="flex items-center gap-3 text-sm text-gray-400">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span>{person.employeeProfile.phoneNumber}</span>
                  </div>
                )}
                {person.employeeProfile?.address && (
                  <div className="flex items-start gap-3 text-sm text-gray-400">
                    <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                    <span className="line-clamp-2">{person.employeeProfile.address}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
          {filteredStaff.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500">
              No staff members found matching "{searchTerm}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}
