import React from 'react';
import { BarChart3, Download, TrendingUp, PieChart as PieIcon, Building2 } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from 'recharts';

interface ReportsModuleProps {
  isDarkMode: boolean;
}

const SALES_BY_BRANCH = [
  { branch: 'Mumbai HQ', sales: 485000 },
  { branch: 'Bengaluru Hub', sales: 320000 },
  { branch: 'Delhi NCR', sales: 210000 },
];

const CATEGORY_PIE = [
  { name: 'Electronics', value: 45 },
  { name: 'Computers', value: 30 },
  { name: 'Monitors', value: 15 },
  { name: 'Services', value: 10 },
];

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

export const ReportsModule: React.FC<ReportsModuleProps> = ({ isDarkMode }) => {
  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
        isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200 shadow-sm'
      }`}>
        <div>
          <h2 className="text-lg font-bold">Enterprise Analytics & Reports Hub</h2>
          <p className="text-xs text-neutral-400">Branch performance breakdowns, category revenue distribution & GST audit reports.</p>
        </div>

        <button
          onClick={() => alert('Downloading full CSV financial report...')}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-blue-600/20"
        >
          <Download className="w-4 h-4" />
          <span>Export GST & Sales CSV</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Branch Performance Bar Chart */}
        <div className={`p-5 rounded-2xl border space-y-4 ${
          isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
            <h3 className="text-xs font-semibold uppercase text-neutral-400 tracking-wider">Revenue by Branch Location</h3>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={SALES_BY_BRANCH}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#262626" : "#e5e5e5"} />
                <XAxis dataKey="branch" stroke="#a3a3a3" fontSize={11} />
                <YAxis stroke="#a3a3a3" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: isDarkMode ? '#171717' : '#ffffff', borderRadius: '12px', fontSize: '12px' }} />
                <Bar dataKey="sales" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Sales (₹)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution Pie Chart */}
        <div className={`p-5 rounded-2xl border space-y-4 ${
          isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
            <h3 className="text-xs font-semibold uppercase text-neutral-400 tracking-wider">Product Category Revenue Breakdown</h3>
          </div>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={CATEGORY_PIE}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label
                >
                  {CATEGORY_PIE.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: isDarkMode ? '#171717' : '#ffffff', borderRadius: '12px', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
};
