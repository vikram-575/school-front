"use client";
import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/api";
import { DollarSign, FileText, Plus, Loader2, CreditCard } from "lucide-react";

export default function FinancePage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  const [invoiceData, setInvoiceData] = useState({
    studentId: "",
    title: "",
    dueDate: new Date().toISOString().split("T")[0],
    amount: "",
    categoryId: "",
  });

  const [paymentData, setPaymentData] = useState({
    amount: "",
    paymentMethod: "ONLINE",
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [invData, stuData] = await Promise.all([
        fetchWithAuth("/finance/invoices"),
        fetchWithAuth("/users?role=STUDENT"),
      ]);
      setInvoices(invData);
      setStudents(stuData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchWithAuth("/finance/invoices", {
        method: "POST",
        body: JSON.stringify({
          studentId: invoiceData.studentId,
          title: invoiceData.title,
          dueDate: new Date(invoiceData.dueDate).toISOString(),
          totalAmount: parseFloat(invoiceData.amount),
        }),
      });
      setShowInvoiceModal(false);
      loadData();
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchWithAuth(`/finance/invoices/${selectedInvoice.id}/pay`, {
        method: "POST",
        body: JSON.stringify({
          amount: parseFloat(paymentData.amount),
          paymentMethod: paymentData.paymentMethod,
        }),
      });
      setShowPaymentModal(false);
      loadData();
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

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
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-teal-600">
            Fee Management
          </h1>
          <p className="text-gray-400 mt-1">Manage invoices and track payments.</p>
        </div>
        
        <button
          onClick={() => setShowInvoiceModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600/10 text-emerald-400 hover:bg-emerald-600/20 rounded-xl transition-all font-medium border border-emerald-600/20"
        >
          <Plus className="w-4 h-4" />
          Generate Invoice
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-gray-800 bg-gray-800/20">
            <h3 className="font-medium text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-500" />
              Recent Invoices
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-800/50 border-b border-gray-800 text-gray-400">
                <tr>
                  <th className="px-6 py-4 font-medium">Student</th>
                  <th className="px-6 py-4 font-medium">Title</th>
                  <th className="px-6 py-4 font-medium">Amount</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No invoices generated yet.
                    </td>
                  </tr>
                ) : (
                  invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-gray-800/25 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-white">
                          {inv.student?.user?.firstName} {inv.student?.user?.lastName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {inv.student?.admissionNumber}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-300">{inv.title}</td>
                      <td className="px-6 py-4 font-medium text-emerald-400">
                        ${inv.totalAmount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          inv.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          inv.status === 'PARTIAL' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                          'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {inv.status !== 'PAID' && (
                          <button
                            onClick={() => {
                              setSelectedInvoice(inv);
                              setPaymentData({ ...paymentData, amount: inv.totalAmount.toString() });
                              setShowPaymentModal(true);
                            }}
                            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all"
                          >
                            Pay Now
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h3 className="font-medium text-white flex items-center gap-2 mb-4">
              <DollarSign className="w-4 h-4 text-emerald-500" />
              Financial Summary
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-gray-950 rounded-xl border border-gray-800">
                <div className="text-sm text-gray-500 mb-1">Total Invoiced</div>
                <div className="text-2xl font-bold text-white">
                  ${invoices.reduce((sum, inv) => sum + inv.totalAmount, 0).toFixed(2)}
                </div>
              </div>
              <div className="p-4 bg-gray-950 rounded-xl border border-gray-800">
                <div className="text-sm text-gray-500 mb-1">Pending Dues</div>
                <div className="text-2xl font-bold text-red-400">
                  ${invoices.filter(i => i.status !== 'PAID').reduce((sum, inv) => sum + inv.totalAmount, 0).toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showInvoiceModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <h2 className="text-2xl font-bold mb-6">Generate Invoice</h2>
            <form onSubmit={handleCreateInvoice} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Student</label>
                <select
                  required
                  value={invoiceData.studentId}
                  onChange={e => setInvoiceData({...invoiceData, studentId: e.target.value})}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                >
                  <option value="">Select Student...</option>
                  {students.map(s => (
                    <option key={s.id} value={s.studentProfile?.id}>
                      {s.firstName} {s.lastName} ({s.studentProfile?.admissionNumber})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Invoice Title</label>
                <input
                  required
                  value={invoiceData.title}
                  onChange={e => setInvoiceData({...invoiceData, title: e.target.value})}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                  placeholder="e.g. Term 1 Tuition Fee"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Amount ($)</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    value={invoiceData.amount}
                    onChange={e => setInvoiceData({...invoiceData, amount: e.target.value})}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Due Date</label>
                  <input
                    required
                    type="date"
                    value={invoiceData.dueDate}
                    onChange={e => setInvoiceData({...invoiceData, dueDate: e.target.value})}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-8 pt-4">
                <button
                  type="button"
                  onClick={() => setShowInvoiceModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl transition-all font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-all font-medium shadow-lg shadow-emerald-500/25"
                >
                  Generate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPaymentModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h2 className="text-2xl font-bold mb-2">Record Payment</h2>
            <p className="text-gray-400 text-sm mb-6">For: {selectedInvoice.title}</p>
            
            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Payment Amount ($)</label>
                <input
                  required
                  type="number"
                  step="0.01"
                  value={paymentData.amount}
                  onChange={e => setPaymentData({...paymentData, amount: e.target.value})}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Method</label>
                <select
                  required
                  value={paymentData.paymentMethod}
                  onChange={e => setPaymentData({...paymentData, paymentMethod: e.target.value})}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                >
                  <option value="ONLINE">Online Transfer</option>
                  <option value="CASH">Cash</option>
                  <option value="CHEQUE">Cheque</option>
                </select>
              </div>
              
              <div className="flex gap-3 mt-8 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl transition-all font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-all font-medium shadow-lg shadow-emerald-500/25"
                >
                  Pay Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
