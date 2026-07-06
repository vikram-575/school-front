"use client";
import { useState } from "react";
import { Activity, Search, Server, ShieldAlert, User, Key, Database, RefreshCw } from "lucide-react";

// Mock Data for System Audit Logs
const MOCK_LOGS = [
  { id: "log1", action: "USER_LOGIN", user: "admin@springfield.edu", entity: "Auth", ip: "192.168.1.42", timestamp: "2026-07-06T10:23:41Z", status: "SUCCESS", icon: Key, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { id: "log2", action: "SCHOOL_CREATED", user: "superadmin@schoolos.com", entity: "School", ip: "10.0.0.5", timestamp: "2026-07-06T09:12:11Z", status: "SUCCESS", icon: Server, color: "text-blue-500", bg: "bg-blue-500/10" },
  { id: "log3", action: "FAILED_LOGIN_ATTEMPT", user: "unknown", entity: "Auth", ip: "172.16.254.1", timestamp: "2026-07-06T08:45:00Z", status: "FAILURE", icon: ShieldAlert, color: "text-red-500", bg: "bg-red-500/10" },
  { id: "log4", action: "FEE_STRUCTURE_UPDATED", user: "finance@oakwood.edu", entity: "Finance", ip: "192.168.1.100", timestamp: "2026-07-05T14:30:22Z", status: "SUCCESS", icon: Database, color: "text-purple-500", bg: "bg-purple-500/10" },
  { id: "log5", action: "USER_ROLE_CHANGED", user: "hr@springfield.edu", entity: "Users", ip: "192.168.1.42", timestamp: "2026-07-05T11:20:05Z", status: "SUCCESS", icon: User, color: "text-amber-500", bg: "bg-amber-500/10" },
  { id: "log6", action: "SYSTEM_BACKUP", user: "system", entity: "Infrastructure", ip: "localhost", timestamp: "2026-07-05T00:00:00Z", status: "SUCCESS", icon: RefreshCw, color: "text-cyan-500", bg: "bg-cyan-500/10" },
];

export default function AuditLogsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredLogs = MOCK_LOGS.filter(log => 
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) || 
    log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.entity.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-orange-500">
            System Audit Logs
          </h1>
          <p className="text-gray-400 mt-1">Track security events and administrative actions across all tenant schools.</p>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 shadow-lg flex items-center gap-3">
        <Search className="w-5 h-5 text-gray-500" />
        <input 
          type="text" 
          placeholder="Search logs by action, user email, or entity..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-transparent border-none text-white focus:outline-none w-full"
        />
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-800/50 border-b border-gray-800 text-gray-400">
              <tr>
                <th className="px-6 py-4 font-medium">Event / Action</th>
                <th className="px-6 py-4 font-medium">User / Actor</th>
                <th className="px-6 py-4 font-medium">IP Address</th>
                <th className="px-6 py-4 font-medium">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {filteredLogs.map((log) => {
                const Icon = log.icon;
                return (
                  <tr key={log.id} className="hover:bg-gray-800/25 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg ${log.bg} ${log.color} flex items-center justify-center`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-white">{log.action}</div>
                          <div className="text-xs text-gray-500 mt-0.5">Entity: {log.entity}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-300">{log.user}</div>
                      {log.status === "FAILURE" && (
                        <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/10 text-red-500 border border-red-500/20 uppercase">
                          Action Failed
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-400 font-mono text-xs">
                      {log.ip}
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                  </tr>
                );
              })}
              
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    No audit logs found matching "{searchTerm}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
