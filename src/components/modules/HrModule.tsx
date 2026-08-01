import React, { useState, useEffect } from 'react';
import { UserCheck, Users, Calendar, DollarSign, Sparkles, FileText, Loader2, CheckCircle2, X, Plus, RefreshCw } from 'lucide-react';
import { Employee, Organization } from '../../types';
import { mockEmployees } from '../../data/mockData';

interface HrModuleProps {
  currentOrg?: Organization;
  isDarkMode: boolean;
}

interface ResumeScreenResult {
  matchScore: number;
  fitLevel: string;
  keyStrengths: string[];
  concerns: string[];
  recommendation: string;
}

export const HrModule: React.FC<HrModuleProps> = ({ currentOrg, isDarkMode }) => {
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
  const [activeTab, setActiveTab] = useState<'directory' | 'attendance' | 'payroll'>('directory');
  const [isLoading, setIsLoading] = useState(false);

  // New Employee Modal
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
  const [empName, setEmpName] = useState('');
  const [empRole, setEmpRole] = useState('Software Engineer');
  const [empDept, setEmpDept] = useState('Engineering');
  const [empSalary, setEmpSalary] = useState(85000);
  const [empEmail, setEmpEmail] = useState('');

  const loadEmployees = () => {
    if (!currentOrg?.id) return;
    setIsLoading(true);
    const token = localStorage.getItem('businessos_token');
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    fetch(`/api/tenant/employees?organization_id=${currentOrg.id}`, { headers })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setEmployees(data);
        }
      })
      .catch(err => console.error('Error fetching employees:', err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadEmployees();
  }, [currentOrg?.id]);

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!empName || !currentOrg?.id) return;

    try {
      const token = localStorage.getItem('businessos_token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/tenant/employees', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          organization_id: currentOrg.id,
          name: empName,
          role: empRole,
          department: empDept,
          salary: empSalary,
          email: empEmail || `${empName.toLowerCase().replace(/\s+/g, '')}@company.com`,
          phone: '+91 98765 00000',
          attendanceToday: 'Present'
        })
      });

      if (res.ok) {
        setShowAddEmployeeModal(false);
        setEmpName('');
        loadEmployees();
      }
    } catch (err) {
      console.error('Error adding employee:', err);
    }
  };
  
  // AI Resume Screening Modal
  const [showAiResumeModal, setShowAiResumeModal] = useState(false);
  const [targetRole, setTargetRole] = useState('Senior Full-Stack Architect');
  const [resumeText, setResumeText] = useState(
    'Experienced engineer with 7+ years in React, TypeScript, Node.js microservices, PostgreSQL, and AWS. Proven track record leading cross-functional teams and scaling multi-tenant SaaS architectures.'
  );
  const [isScreening, setIsScreening] = useState(false);
  const [screenResult, setScreenResult] = useState<ResumeScreenResult | null>(null);

  const handleRunAiScreening = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsScreening(true);
    setScreenResult(null);

    try {
      const res = await fetch('/api/ai/resume-screen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText, targetRole })
      });
      const data = await res.json();
      setScreenResult(data);
    } catch (err) {
      console.error('Resume screening error:', err);
    } finally {
      setIsScreening(false);
    }
  };

  const toggleAttendance = (empId: string) => {
    setEmployees(prev => prev.map(e => {
      if (e.id === empId) {
        const statuses: ('Present' | 'Absent' | 'On Leave')[] = ['Present', 'Absent', 'On Leave'];
        const currentIdx = statuses.indexOf(e.attendanceToday as any);
        const nextIdx = (currentIdx + 1) % statuses.length;
        return { ...e, attendanceToday: statuses[nextIdx] };
      }
      return e;
    }));
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
        isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200 shadow-sm'
      }`}>
        <div>
          <h2 className="text-lg font-bold">HR Management & Payroll Studio</h2>
          <p className="text-xs text-neutral-400">Employee records, daily attendance logs, payroll calculations & AI candidate resume screening.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddEmployeeModal(true)}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add Employee</span>
          </button>
          <button
            onClick={() => setShowAiResumeModal(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-purple-600/20 transition-all"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>AI Resume Screener</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex p-1 rounded-xl bg-neutral-950 border border-neutral-800 w-fit text-xs font-semibold">
        <button
          onClick={() => setActiveTab('directory')}
          className={`px-4 py-2 rounded-lg transition-colors ${activeTab === 'directory' ? 'bg-blue-600 text-white' : 'text-neutral-400 hover:text-neutral-200'}`}
        >
          Employee Directory
        </button>
        <button
          onClick={() => setActiveTab('attendance')}
          className={`px-4 py-2 rounded-lg transition-colors ${activeTab === 'attendance' ? 'bg-blue-600 text-white' : 'text-neutral-400 hover:text-neutral-200'}`}
        >
          Attendance Log
        </button>
        <button
          onClick={() => setActiveTab('payroll')}
          className={`px-4 py-2 rounded-lg transition-colors ${activeTab === 'payroll' ? 'bg-blue-600 text-white' : 'text-neutral-400 hover:text-neutral-200'}`}
        >
          Payroll & Salary Slips
        </button>
      </div>

      {/* Employee Directory View */}
      {activeTab === 'directory' && (
        <div className={`rounded-2xl border overflow-hidden ${
          isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200 shadow-sm'
        }`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-neutral-200 min-w-[600px]">
            <thead className={`border-b text-[10px] uppercase font-semibold text-neutral-400 tracking-wider ${
              isDarkMode ? 'bg-neutral-950/50 border-neutral-800' : 'bg-neutral-50 border-neutral-200'
            }`}>
              <tr>
                <th className="p-4">EMP Code</th>
                <th className="p-4">Name</th>
                <th className="p-4">Role & Department</th>
                <th className="p-4">Email</th>
                <th className="p-4">Monthly Salary</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {employees.map(emp => (
                <tr key={emp.id} className="hover:bg-blue-500/5 transition-colors">
                  <td className="p-4 font-mono font-bold text-blue-400">{emp.code}</td>
                  <td className="p-4 font-bold">{emp.name}</td>
                  <td className="p-4 text-neutral-300">{emp.role} • <span className="text-neutral-500">{emp.department}</span></td>
                  <td className="p-4 font-mono text-neutral-400">{emp.email}</td>
                  <td className="p-4 font-bold text-emerald-400">₹{emp.salary.toLocaleString()}</td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold">
                      {emp.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {/* Attendance View */}
      {activeTab === 'attendance' && (
        <div className={`p-5 rounded-2xl border space-y-4 ${
          isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
            <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Today's Live Attendance Sheet</h3>
            <span className="text-xs text-neutral-400 font-mono">Date: {new Date().toLocaleDateString()}</span>
          </div>

          <div className="divide-y divide-neutral-800/60">
            {employees.map(emp => (
              <div key={emp.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-neutral-200">{emp.name}</span>
                  <span className="text-neutral-500 ml-2">({emp.role})</span>
                </div>
                <button
                  onClick={() => toggleAttendance(emp.id)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all ${
                    emp.attendanceToday === 'Present' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                    emp.attendanceToday === 'Absent' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                    'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  }`}
                >
                  {emp.attendanceToday} (Click to toggle)
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payroll View */}
      {activeTab === 'payroll' && (
        <div className={`p-5 rounded-2xl border space-y-4 ${
          isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
            <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Monthly Salary Disbursal</h3>
            <button
              onClick={() => alert('Salary Slips generated & sent via WhatsApp!')}
              className="px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-semibold"
            >
              Generate All Salary Slips
            </button>
          </div>

          <div className="divide-y divide-neutral-800/60">
            {employees.map(emp => (
              <div key={emp.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-neutral-200">{emp.name}</p>
                  <p className="text-neutral-500">{emp.department} • Monthly Net: ₹{emp.salary.toLocaleString()}</p>
                </div>
                <button
                  onClick={() => alert(`Salary Slip generated for ${emp.name}!`)}
                  className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold border border-neutral-700"
                >
                  Download Salary Slip
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Resume Screening Modal */}
      {showAiResumeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className={`w-full max-w-xl rounded-2xl border p-6 space-y-4 shadow-2xl ${
            isDarkMode ? 'bg-neutral-900 border-neutral-800 text-neutral-100' : 'bg-white border-neutral-200 text-neutral-900'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2 text-purple-400">
                <Sparkles className="w-5 h-5 text-amber-300" />
                <h3 className="text-sm font-bold">AI Resume Screening Assistant</h3>
              </div>
              <button onClick={() => setShowAiResumeModal(false)} className="text-neutral-400 hover:text-neutral-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRunAiScreening} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-neutral-400">Target Open Role</label>
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-neutral-200 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-neutral-400">Paste Candidate Resume Content</label>
                <textarea
                  rows={4}
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-neutral-200 focus:outline-none font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={isScreening}
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white text-xs font-semibold shadow-md shadow-purple-600/20 flex items-center justify-center gap-2"
              >
                {isScreening ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>Evaluate Resume with Gemini AI</span>
              </button>
            </form>

            {/* AI Result Card */}
            {screenResult && (
              <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-purple-300">Match Score: {screenResult.matchScore}%</span>
                  <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold">{screenResult.fitLevel}</span>
                </div>
                <p className="text-neutral-200">{screenResult.recommendation}</p>
                {screenResult.keyStrengths && (
                  <div className="pt-2 border-t border-purple-500/20 space-y-1">
                    <span className="text-[10px] uppercase font-semibold text-neutral-400">Key Strengths</span>
                    <ul className="list-disc list-inside text-neutral-300">
                      {screenResult.keyStrengths.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Employee Modal */}
      {showAddEmployeeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className={`w-full max-w-md rounded-2xl border p-6 space-y-4 shadow-2xl ${
            isDarkMode ? 'bg-neutral-900 border-neutral-800 text-neutral-100' : 'bg-white border-neutral-200 text-neutral-900'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                Add Employee to PostgreSQL Database
              </h3>
              <button onClick={() => setShowAddEmployeeModal(false)} className="text-neutral-400 hover:text-neutral-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateEmployee} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-neutral-400">Employee Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ananya Roy"
                  value={empName}
                  onChange={(e) => setEmpName(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-neutral-200 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-400">Designation / Role</label>
                  <input
                    type="text"
                    value={empRole}
                    onChange={(e) => setEmpRole(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-neutral-200 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-400">Department</label>
                  <input
                    type="text"
                    value={empDept}
                    onChange={(e) => setEmpDept(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-neutral-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-400">Monthly Salary (₹)</label>
                  <input
                    type="number"
                    value={empSalary}
                    onChange={(e) => setEmpSalary(Number(e.target.value))}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-neutral-200 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-400">Work Email</label>
                  <input
                    type="email"
                    value={empEmail}
                    onChange={(e) => setEmpEmail(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-neutral-200 focus:outline-none"
                    placeholder="email@company.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20"
              >
                Save Employee to Database
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
