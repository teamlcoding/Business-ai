import React, { useState } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Plus, CreditCard, Landmark, FileSpreadsheet } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { ExpenseRecord } from '../../types';
import { mockExpenses } from '../../data/mockData';

interface FinanceModuleProps {
  isDarkMode: boolean;
}

const CASHFLOW_DATA = [
  { month: 'Jan', revenue: 120000, expense: 45000, net: 75000 },
  { month: 'Feb', revenue: 135000, expense: 42000, net: 93000 },
  { month: 'Mar', revenue: 110000, expense: 50000, net: 60000 },
  { month: 'Apr', revenue: 155000, expense: 48000, net: 107000 },
  { month: 'May', revenue: 140000, expense: 39000, net: 101000 },
  { month: 'Jun', revenue: 165000, expense: 41000, net: 124000 },
  { month: 'Jul', revenue: 148500, expense: 42100, net: 106400 },
];

export const FinanceModule: React.FC<FinanceModuleProps> = ({ isDarkMode }) => {
  const [expenses, setExpenses] = useState<ExpenseRecord[]>(mockExpenses);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [newCategory, setNewCategory] = useState('Office Supplies');
  const [newDesc, setNewDesc] = useState('');
  const [newAmount, setNewAmount] = useState(12000);

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const ex: ExpenseRecord = {
      id: `ex-${Date.now()}`,
      category: newCategory,
      description: newDesc || 'Operational Overhead',
      amount: newAmount,
      date: new Date().toISOString().split('T')[0],
      paidBy: 'Corporate Account',
      paymentMode: 'Bank Transfer',
      receiptAttached: true
    };
    setExpenses([ex, ...expenses]);
    setShowAddExpense(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
        isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200 shadow-sm'
      }`}>
        <div>
          <h2 className="text-lg font-bold">Finance, Accounting & P&L Studio</h2>
          <p className="text-xs text-neutral-400">Cash flow analytics, expense tracking, bank accounts & GST liability reports.</p>
        </div>

        <button
          onClick={() => setShowAddExpense(true)}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-blue-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Log New Expense</span>
        </button>
      </div>

      {/* Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={`p-5 rounded-2xl border space-y-2 ${isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200'}`}>
          <div className="flex items-center justify-between text-neutral-400 text-xs font-semibold uppercase">
            <span>Total Monthly Income</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">₹148,500</div>
          <p className="text-[10px] text-neutral-400">Recorded across all sales channels</p>
        </div>

        <div className={`p-5 rounded-2xl border space-y-2 ${isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200'}`}>
          <div className="flex items-center justify-between text-neutral-400 text-xs font-semibold uppercase">
            <span>Operational Expenses</span>
            <TrendingDown className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-400">₹42,100</div>
          <p className="text-[10px] text-neutral-400">Lease, cloud servers & licenses</p>
        </div>

        <div className={`p-5 rounded-2xl border space-y-2 ${isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200'}`}>
          <div className="flex items-center justify-between text-neutral-400 text-xs font-semibold uppercase">
            <span>Estimated GST Liability</span>
            <Landmark className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400">₹19,150</div>
          <p className="text-[10px] text-neutral-400">Output GST minus Input Credit</p>
        </div>
      </div>

      {/* Interactive Cash Flow Recharts Area */}
      <div className={`p-5 rounded-2xl border space-y-4 ${
        isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200 shadow-sm'
      }`}>
        <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
          <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Revenue vs Expense Cash Flow Trend</h3>
          <span className="text-xs font-mono text-emerald-400">Net Growth: +22.4%</span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={CASHFLOW_DATA}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#262626" : "#e5e5e5"} />
              <XAxis dataKey="month" stroke="#a3a3a3" fontSize={11} />
              <YAxis stroke="#a3a3a3" fontSize={11} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: isDarkMode ? '#171717' : '#ffffff', 
                  borderColor: isDarkMode ? '#262626' : '#e5e5e5',
                  borderRadius: '12px',
                  fontSize: '12px'
                }} 
              />
              <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRevenue)" name="Revenue (₹)" />
              <Area type="monotone" dataKey="expense" stroke="#f43f5e" fillOpacity={1} fill="url(#colorExpense)" name="Expenses (₹)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Expenses Log Table */}
      <div className={`rounded-2xl border overflow-hidden ${
        isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200 shadow-sm'
      }`}>
        <div className="p-4 border-b border-neutral-800 font-bold text-xs uppercase tracking-wider text-neutral-400">
          Expense Records
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-neutral-200 min-w-[500px]">
          <thead className={`border-b text-[10px] uppercase font-semibold text-neutral-400 tracking-wider ${
            isDarkMode ? 'bg-neutral-950/50 border-neutral-800' : 'bg-neutral-50 border-neutral-200'
          }`}>
            <tr>
              <th className="p-4">Category</th>
              <th className="p-4">Description</th>
              <th className="p-4">Date</th>
              <th className="p-4">Paid By</th>
              <th className="p-4 font-bold">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/60">
            {expenses.map(ex => (
              <tr key={ex.id} className="hover:bg-blue-500/5 transition-colors">
                <td className="p-4 font-semibold text-blue-400">{ex.category}</td>
                <td className="p-4 text-neutral-300">{ex.description}</td>
                <td className="p-4 font-mono text-neutral-400">{ex.date}</td>
                <td className="p-4 text-neutral-400">{ex.paidBy} ({ex.paymentMode})</td>
                <td className="p-4 font-bold text-rose-400">₹{ex.amount.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {showAddExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className={`w-full max-w-md rounded-2xl border p-6 space-y-4 shadow-2xl ${
            isDarkMode ? 'bg-neutral-900 border-neutral-800 text-neutral-100' : 'bg-white border-neutral-200 text-neutral-900'
          }`}>
            <h3 className="text-sm font-bold border-b pb-2 border-neutral-800">Log Operating Expense</h3>

            <form onSubmit={handleAddExpense} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-neutral-400">Expense Category</label>
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-neutral-200 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-neutral-400">Description</label>
                <input
                  type="text"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-neutral-200 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-neutral-400">Amount (₹)</label>
                <input
                  type="number"
                  value={newAmount}
                  onChange={(e) => setNewAmount(Number(e.target.value))}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-neutral-200 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold">
                  Save Expense Record
                </button>
                <button type="button" onClick={() => setShowAddExpense(false)} className="px-4 py-2.5 border rounded-xl text-xs font-semibold">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
