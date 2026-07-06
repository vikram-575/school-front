"use client";
import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/api";
import { IndianRupee, FileText, CheckCircle, Clock, Loader2 } from "lucide-react";

export default function AccountantOverviewPage() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    outstandingBalance: 0,
    paidInvoices: 0,
    pendingInvoices: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const invoices = await fetchWithAuth("/finance/invoices");
        
        let revenue = 0;
        let outstanding = 0;
        let paid = 0;
        let pending = 0;

        invoices.forEach((inv: any) => {
          const paidAmount = inv.payments?.reduce((sum: number, p: any) => sum + p.amount, 0) || 0;
          revenue += paidAmount;
          outstanding += (inv.totalAmount - paidAmount);
          
          if (inv.status === "PAID") paid++;
          else pending++;
        });

        setStats({
          totalRevenue: revenue,
          outstandingBalance: outstanding,
          paidInvoices: paid,
          pendingInvoices: pending,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-500">
            Accounting Department
          </h1>
          <p className="text-gray-400 mt-1">Financial overview and revenue tracking.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <IndianRupee className="w-32 h-32 text-emerald-500" />
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <IndianRupee className="w-6 h-6" />
            </div>
            <h3 className="text-gray-400 font-medium">Total Revenue</h3>
          </div>
          <p className="text-3xl font-bold text-white flex items-center"><IndianRupee className="w-6 h-6 mr-1 text-emerald-500"/>{stats.totalRevenue.toLocaleString()}</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Clock className="w-32 h-32 text-amber-500" />
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-gray-400 font-medium">Outstanding Bal</h3>
          </div>
          <p className="text-3xl font-bold text-white flex items-center"><IndianRupee className="w-6 h-6 mr-1 text-amber-500"/>{stats.outstandingBalance.toLocaleString()}</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <CheckCircle className="w-32 h-32 text-blue-500" />
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h3 className="text-gray-400 font-medium">Paid Invoices</h3>
          </div>
          <p className="text-4xl font-bold text-white">{stats.paidInvoices}</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <FileText className="w-32 h-32 text-rose-500" />
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-gray-400 font-medium">Pending Invoices</h3>
          </div>
          <p className="text-4xl font-bold text-white">{stats.pendingInvoices}</p>
        </div>
      </div>
    </div>
  );
}
