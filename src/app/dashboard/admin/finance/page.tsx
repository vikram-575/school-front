"use client";
import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/api";
import { FileText, Plus, CreditCard, Loader2, IndianRupee, Tag, CheckCircle, Clock } from "lucide-react";

export default function FinancePage() {
  const [activeTab, setActiveTab] = useState<"invoices" | "categories">("invoices");
  
  const [invoices, setInvoices] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState<any>(null); // Invoice object
  const [submitting, setSubmitting] = useState(false);

  // Forms
  const [newCategory, setNewCategory] = useState({ name: "", description: "", amount: 0, frequency: "ONE_TIME" });
  
  const [newInvoice, setNewInvoice] = useState({
    studentId: "",
    title: "",
    dueDate: new Date().toISOString().split("T")[0],
    items: [] as { feeCategoryId: string, amount: number }[],
  });

  const [newPayment, setNewPayment] = useState({ amount: 0, paymentMethod: "CASH", referenceNumber: "" });

  const loadData = async () => {
    setLoading(true);
    try {
      const [invData, catData, stuData] = await Promise.all([
        fetchWithAuth("/finance/invoices"),
        fetchWithAuth("/finance/categories"),
        fetchWithAuth("/users?role=STUDENT"),
      ]);
      setInvoices(invData);
      setCategories(catData);
      setStudents(stuData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetchWithAuth("/finance/categories", {
        method: "POST",
        body: JSON.stringify(newCategory),
      });
      setShowCategoryModal(false);
      setNewCategory({ name: "", description: "", amount: 0, frequency: "ONE_TIME" });
      loadData();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetchWithAuth("/finance/invoices", {
        method: "POST",
        body: JSON.stringify(newInvoice),
      });
      setShowInvoiceModal(false);
      setNewInvoice({ studentId: "", title: "", dueDate: new Date().toISOString().split("T")[0], items: [] });
      loadData();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showPaymentModal) return;
    setSubmitting(true);
    try {
      await fetchWithAuth(`/finance/invoices/${showPaymentModal.id}/payments`, {
        method: "POST",
        body: JSON.stringify(newPayment),
      });
      setShowPaymentModal(null);
      setNewPayment({ amount: 0, paymentMethod: "CASH", referenceNumber: "" });
      loadData();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const addInvoiceItem = (categoryId: string) => {
    const cat = categories.find(c => c.id === categoryId);
    if (!cat) return;
    setNewInvoice(prev => ({
      ...prev,
      items: [...prev.items, { feeCategoryId: cat.id, amount: cat.amount }]
    }));
  };

  const removeInvoiceItem = (index: number) => {
    setNewInvoice(prev => {
      const items = [...prev.items];
      items.splice(index, 1);
      return { ...prev, items };
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><CheckCircle className="w-3 h-3" /> Paid</span>;
      case "PARTIAL":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20"><Clock className="w-3 h-3" /> Partial</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20"><Clock className="w-3 h-3" /> Unpaid</span>;
    }
  };

  if (loading && invoices.length === 0) {
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
            Finance & Billing
          </h1>
          <p className="text-gray-400 mt-1">Manage fee structures, invoices, and payments.</p>
        </div>
      </div>

      <div className="flex gap-4 border-b border-gray-800 pb-px">
        <button
          onClick={() => setActiveTab("invoices")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors border-b-2 -mb-px ${
            activeTab === "invoices"
              ? "border-emerald-500 text-emerald-400 bg-emerald-500/10"
              : "border-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-800/50"
          }`}
        >
          <FileText className="w-4 h-4" />
          Invoices
        </button>
        <button
          onClick={() => setActiveTab("categories")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors border-b-2 -mb-px ${
            activeTab === "categories"
              ? "border-emerald-500 text-emerald-400 bg-emerald-500/10"
              : "border-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-800/50"
          }`}
        >
          <Tag className="w-4 h-4" />
          Fee Categories
        </button>
      </div>

      {activeTab === "categories" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-lg">
            <div>
              <h3 className="text-lg font-bold text-white">Fee Components</h3>
              <p className="text-sm text-gray-400">Define modular fee components like Tuition, Transport, etc.</p>
            </div>
            <button
              onClick={() => setShowCategoryModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-all font-medium shadow-lg shadow-emerald-500/25"
            >
              <Plus className="w-4 h-4" />
              Add Category
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categories.map(cat => (
              <div key={cat.id} className="p-6 rounded-2xl bg-gray-900 border border-gray-800 hover:border-emerald-500/50 transition-all relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Tag className="w-16 h-16 text-emerald-500" />
                </div>
                <h4 className="font-semibold text-white text-lg">{cat.name}</h4>
                <p className="text-gray-400 text-sm mt-1 mb-4">{cat.description || "No description"}</p>
                <div className="flex items-end justify-between mt-auto">
                  <div>
                    <span className="text-xs text-gray-500 uppercase tracking-wider block mb-1">Amount</span>
                    <span className="text-2xl font-bold text-emerald-400 flex items-center">
                      <IndianRupee className="w-5 h-5 mr-0.5" />{cat.amount}
                    </span>
                  </div>
                  <span className="text-xs font-medium bg-gray-800 text-gray-300 px-2.5 py-1 rounded-lg border border-gray-700">
                    {cat.frequency.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "invoices" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-lg">
            <div>
              <h3 className="text-lg font-bold text-white">Student Invoices</h3>
              <p className="text-sm text-gray-400">Track and manage student fee collection.</p>
            </div>
            <button
              onClick={() => setShowInvoiceModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-all font-medium shadow-lg shadow-emerald-500/25"
            >
              <Plus className="w-4 h-4" />
              Generate Invoice
            </button>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-800/50 border-b border-gray-800 text-gray-400">
                  <tr>
                    <th className="px-6 py-4 font-medium">Invoice Info</th>
                    <th className="px-6 py-4 font-medium">Student</th>
                    <th className="px-6 py-4 font-medium">Amount & Status</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  {invoices.map((inv) => {
                    const totalPaid = inv.payments?.reduce((sum: number, p: any) => sum + p.amount, 0) || 0;
                    const balance = inv.totalAmount - totalPaid;
                    
                    return (
                      <tr key={inv.id} className="hover:bg-gray-800/25 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-white">{inv.title}</div>
                          <div className="text-xs text-gray-500 mt-1">Due: {new Date(inv.dueDate).toLocaleDateString()}</div>
                          <div className="text-[10px] text-gray-600 mt-0.5">#{inv.id.slice(-8).toUpperCase()}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-200">
                            {inv.student?.user?.firstName} {inv.student?.user?.lastName}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {inv.student?.currentSection?.class?.name} - {inv.student?.currentSection?.name}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="font-bold text-white flex items-center"><IndianRupee className="w-3.5 h-3.5 mr-0.5"/>{inv.totalAmount}</span>
                            {getStatusBadge(inv.status)}
                          </div>
                          <div className="text-xs text-gray-400">
                            Paid: <span className="text-emerald-400">₹{totalPaid}</span> | Bal: <span className="text-amber-400">₹{balance}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {inv.status !== "PAID" && (
                            <button
                              onClick={() => {
                                setShowPaymentModal(inv);
                                setNewPayment(prev => ({ ...prev, amount: balance }));
                              }}
                              className="px-3 py-1.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-600/20 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ml-auto"
                            >
                              <CreditCard className="w-3.5 h-3.5" /> Record Payment
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                  
                  {invoices.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                        No invoices generated yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 text-white">New Fee Category</h2>
            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Category Name</label>
                <input
                  required
                  value={newCategory.name}
                  onChange={e => setNewCategory({...newCategory, name: e.target.value})}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                  placeholder="e.g. Term 1 Tuition Fee"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                <input
                  value={newCategory.description}
                  onChange={e => setNewCategory({...newCategory, description: e.target.value})}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                  placeholder="Optional details"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Amount (₹)</label>
                  <input
                    required
                    type="number"
                    min="0"
                    value={newCategory.amount}
                    onChange={e => setNewCategory({...newCategory, amount: parseFloat(e.target.value)})}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Frequency</label>
                  <select
                    value={newCategory.frequency}
                    onChange={e => setNewCategory({...newCategory, frequency: e.target.value})}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                  >
                    <option value="ONE_TIME">One Time</option>
                    <option value="MONTHLY">Monthly</option>
                    <option value="YEARLY">Yearly</option>
                    <option value="TERM">Per Term</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-8 pt-4">
                <button type="button" onClick={() => setShowCategoryModal(false)} className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl transition-all font-medium">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-all font-medium shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2">
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />} Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {showInvoiceModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl overflow-y-auto max-h-[90vh]">
            <h2 className="text-2xl font-bold mb-6 text-white">Generate Invoice</h2>
            <form onSubmit={handleCreateInvoice} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Student</label>
                <select
                  required
                  value={newInvoice.studentId}
                  onChange={e => setNewInvoice({...newInvoice, studentId: e.target.value})}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                >
                  <option value="">Select a student...</option>
                  {students.map(s => (
                    <option key={s.id} value={s.studentProfile?.id}>
                      {s.firstName} {s.lastName} ({s.studentProfile?.admissionNumber})
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Invoice Title</label>
                  <input
                    required
                    value={newInvoice.title}
                    onChange={e => setNewInvoice({...newInvoice, title: e.target.value})}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                    placeholder="e.g. Term 1 Fees"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Due Date</label>
                  <input
                    required
                    type="date"
                    value={newInvoice.dueDate}
                    onChange={e => setNewInvoice({...newInvoice, dueDate: e.target.value})}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-800">
                <label className="block text-sm font-medium text-gray-400 mb-2">Invoice Items</label>
                <div className="space-y-2 mb-4">
                  {newInvoice.items.map((item, idx) => {
                    const cat = categories.find(c => c.id === item.feeCategoryId);
                    return (
                      <div key={idx} className="flex items-center justify-between bg-gray-950 border border-gray-800 p-3 rounded-lg text-sm">
                        <span className="text-gray-300">{cat?.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-emerald-400 font-medium">₹{item.amount}</span>
                          <button type="button" onClick={() => removeInvoiceItem(idx)} className="text-gray-500 hover:text-red-400">✕</button>
                        </div>
                      </div>
                    )
                  })}
                  {newInvoice.items.length === 0 && (
                    <div className="text-xs text-gray-500 italic">No fee categories added yet.</div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <select
                    id="addCatSelect"
                    className="flex-1 bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500 text-sm"
                  >
                    <option value="">Select category to add...</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name} - ₹{c.amount}</option>)}
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      const sel = document.getElementById('addCatSelect') as HTMLSelectElement;
                      if (sel.value) {
                        addInvoiceItem(sel.value);
                        sel.value = "";
                      }
                    }}
                    className="px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>
              
              <div className="flex justify-between items-center py-4 text-lg">
                <span className="text-gray-400 font-medium">Total Amount:</span>
                <span className="text-white font-bold text-2xl flex items-center">
                  <IndianRupee className="w-5 h-5 mr-1 text-emerald-500" />
                  {newInvoice.items.reduce((sum, item) => sum + item.amount, 0)}
                </span>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setShowInvoiceModal(false)} className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl transition-all font-medium">Cancel</button>
                <button type="submit" disabled={submitting || newInvoice.items.length === 0} className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-all font-medium shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 disabled:opacity-50">
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />} Generate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-bold mb-2 text-white">Record Payment</h2>
            <p className="text-gray-400 text-sm mb-6">Invoice: {showPaymentModal.title}</p>
            
            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Amount Paid (₹)</label>
                <input
                  required
                  type="number"
                  min="1"
                  max={showPaymentModal.totalAmount - (showPaymentModal.payments?.reduce((s: number, p: any) => s + p.amount, 0) || 0)}
                  value={newPayment.amount}
                  onChange={e => setNewPayment({...newPayment, amount: parseFloat(e.target.value)})}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Method</label>
                  <select
                    value={newPayment.paymentMethod}
                    onChange={e => setNewPayment({...newPayment, paymentMethod: e.target.value})}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                  >
                    <option value="CASH">Cash</option>
                    <option value="CARD">Card</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                    <option value="UPI">UPI</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Ref Number</label>
                  <input
                    value={newPayment.referenceNumber}
                    onChange={e => setNewPayment({...newPayment, referenceNumber: e.target.value})}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                    placeholder="Optional"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-8 pt-4">
                <button type="button" onClick={() => setShowPaymentModal(null)} className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl transition-all font-medium">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all font-medium shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 disabled:opacity-50">
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />} Confirm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
