"use client";
import { useState } from "react";
import { CreditCard, CheckCircle, Clock, Zap, Shield, Crown } from "lucide-react";

// Mock Data for Subscriptions
const MOCK_PLANS = [
  { id: "p1", name: "Basic", price: "$49/mo", maxStudents: 500, features: ["Core Academics", "Attendance", "Basic Reports"], icon: Zap, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/50" },
  { id: "p2", name: "Pro", price: "$149/mo", maxStudents: 2000, features: ["Everything in Basic", "Advanced Finance", "HR & Leaves", "Parent Portal"], icon: Shield, color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/50", recommended: true },
  { id: "p3", name: "Enterprise", price: "$399/mo", maxStudents: "Unlimited", features: ["Everything in Pro", "Custom Domain", "Dedicated Support", "API Access"], icon: Crown, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/50" }
];

const MOCK_SUBSCRIPTIONS = [
  { id: "sub1", school: "Springfield High", plan: "Pro", status: "ACTIVE", nextBilling: "2026-08-15", amount: "$149.00" },
  { id: "sub2", school: "Riverside Academy", plan: "Basic", status: "ACTIVE", nextBilling: "2026-07-20", amount: "$49.00" },
  { id: "sub3", school: "Oakwood Elementary", plan: "Enterprise", status: "TRIAL", nextBilling: "2026-08-01", amount: "$0.00" },
  { id: "sub4", school: "Lincoln Prep", plan: "Basic", status: "EXPIRED", nextBilling: "Past Due", amount: "$49.00" },
];

export default function SubscriptionsPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "plans">("overview");

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><CheckCircle className="w-3.5 h-3.5" /> Active</span>;
      case "TRIAL":
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20"><Clock className="w-3.5 h-3.5" /> Trial</span>;
      default:
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20"><Clock className="w-3.5 h-3.5" /> Expired</span>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-500">
            Subscription Management
          </h1>
          <p className="text-gray-400 mt-1">Manage school plans, billing, and pricing tiers.</p>
        </div>
      </div>

      <div className="flex gap-4 border-b border-gray-800 pb-px">
        <button
          onClick={() => setActiveTab("overview")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors border-b-2 -mb-px ${
            activeTab === "overview"
              ? "border-blue-500 text-blue-400 bg-blue-500/10"
              : "border-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-800/50"
          }`}
        >
          <CreditCard className="w-4 h-4" />
          Client Subscriptions
        </button>
        <button
          onClick={() => setActiveTab("plans")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors border-b-2 -mb-px ${
            activeTab === "plans"
              ? "border-blue-500 text-blue-400 bg-blue-500/10"
              : "border-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-800/50"
          }`}
        >
          <Crown className="w-4 h-4" />
          Pricing Tiers
        </button>
      </div>

      {activeTab === "plans" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          {MOCK_PLANS.map(plan => {
            const Icon = plan.icon;
            return (
              <div key={plan.id} className={`bg-gray-900 border ${plan.recommended ? plan.border : 'border-gray-800'} rounded-3xl p-8 relative overflow-hidden flex flex-col`}>
                {plan.recommended && (
                  <div className="absolute top-4 right-4 bg-purple-500/10 text-purple-400 text-xs font-bold px-3 py-1 rounded-full border border-purple-500/20">
                    MOST POPULAR
                  </div>
                )}
                <div className={`w-14 h-14 rounded-2xl ${plan.bg} ${plan.color} flex items-center justify-center mb-6`}>
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                </div>
                <p className="text-sm text-gray-400 mb-6 pb-6 border-b border-gray-800">
                  Up to {plan.maxStudents} students
                </p>
                <ul className="space-y-4 mb-8 flex-1">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-gray-300">
                      <CheckCircle className={`w-4 h-4 ${plan.color}`} />
                      {feature}
                    </li>
                  ))}
                </ul>
                <button className={`w-full py-3 rounded-xl font-bold transition-all ${plan.recommended ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-500/25' : 'bg-gray-800 hover:bg-gray-700 text-white'}`}>
                  Edit Plan
                </button>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === "overview" && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-lg mt-4">
          <div className="p-6 border-b border-gray-800 flex justify-between items-center">
            <h3 className="text-lg font-bold text-white">Active Subscriptions</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-800/50 border-b border-gray-800 text-gray-400">
                <tr>
                  <th className="px-6 py-4 font-medium">School Name</th>
                  <th className="px-6 py-4 font-medium">Plan</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Next Billing</th>
                  <th className="px-6 py-4 font-medium text-right">Amount</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {MOCK_SUBSCRIPTIONS.map((sub) => (
                  <tr key={sub.id} className="hover:bg-gray-800/25 transition-colors">
                    <td className="px-6 py-4 font-semibold text-white">{sub.school}</td>
                    <td className="px-6 py-4 text-gray-300">{sub.plan}</td>
                    <td className="px-6 py-4">{getStatusBadge(sub.status)}</td>
                    <td className="px-6 py-4 text-gray-400">{sub.nextBilling}</td>
                    <td className="px-6 py-4 text-right font-medium text-white">{sub.amount}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-blue-400 hover:text-blue-300 text-xs font-medium">Manage</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
