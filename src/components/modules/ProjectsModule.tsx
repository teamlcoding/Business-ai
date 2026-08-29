import React, { useState } from 'react';
import { 
  FolderKanban, 
  CheckSquare, 
  Clock, 
  Plus, 
  Users, 
  Play, 
  Pause, 
  X,
  Kanban,
  List,
  Calendar,
  BarChart2,
  Filter,
  Search,
  MoreHorizontal,
  ChevronRight,
  Flag,
  User,
  Paperclip,
  CheckCircle2,
  Circle,
  AlertCircle
} from 'lucide-react';
import { ProjectItem } from '../../types';

interface ProjectsModuleProps {
  isDarkMode: boolean;
}

interface Task {
  id: string;
  title: string;
  project: string;
  assignee: string;
  avatar: string;
  dueDate: string;
  status: 'To Do' | 'In Progress' | 'In Review' | 'Completed';
  priority: 'Urgent' | 'High' | 'Normal' | 'Low';
  estimatedHours: number;
  trackedHours: number;
}

const INITIAL_PROJECTS: ProjectItem[] = [
  { id: 'PRJ-101', title: 'ERP Multi-Tenant Cloud Migration', client: 'Apex Global Enterprises', status: 'In Progress', progress: 68, budget: 450000, dueDate: '2026-08-25', teamMembers: ['Vikram A.', 'Priya S.'] },
  { id: 'PRJ-102', title: 'GST Automated E-Invoicing Engine', client: 'Vanguard Retail Chain', status: 'In Progress', progress: 85, budget: 180000, dueDate: '2026-08-15', teamMembers: ['Priya S.', 'Rahul K.'] },
  { id: 'PRJ-103', title: 'Hospital Patient Portal & WhatsApp Bot', client: 'Apollo Care Medical Center', status: 'In Progress', progress: 42, budget: 320000, dueDate: '2026-09-10', teamMembers: ['Rahul K.', 'Amit D.'] },
  { id: 'PRJ-104', title: 'Construction Site Material Audit', client: 'Skyline Infra Heavy', status: 'Completed', progress: 100, budget: 250000, dueDate: '2026-07-30', teamMembers: ['Amit D.'] },
];

const INITIAL_TASKS: Task[] = [
  {
    id: 'TSK-101',
    title: 'Design PostgreSQL multi-tenant isolation schemas',
    project: 'ERP Multi-Tenant Cloud Migration',
    assignee: 'Vikram A.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    dueDate: '2026-08-05',
    status: 'In Progress',
    priority: 'Urgent',
    estimatedHours: 12,
    trackedHours: 8.5,
  },
  {
    id: 'TSK-102',
    title: 'Configure GSP API OAuth2 authentication endpoints',
    project: 'GST Automated E-Invoicing Engine',
    assignee: 'Priya S.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    dueDate: '2026-08-08',
    status: 'In Review',
    priority: 'High',
    estimatedHours: 8,
    trackedHours: 7,
  },
  {
    id: 'TSK-103',
    title: 'WhatsApp Cloud API webhook handler integration',
    project: 'Hospital Patient Portal & WhatsApp Bot',
    assignee: 'Rahul K.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    dueDate: '2026-08-12',
    status: 'To Do',
    priority: 'Normal',
    estimatedHours: 16,
    trackedHours: 2,
  },
  {
    id: 'TSK-104',
    title: 'Generate vector PDF invoice templates with QR codes',
    project: 'GST Automated E-Invoicing Engine',
    assignee: 'Priya S.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    dueDate: '2026-08-03',
    status: 'Completed',
    priority: 'Urgent',
    estimatedHours: 10,
    trackedHours: 10,
  },
  {
    id: 'TSK-105',
    title: 'Audit construction site raw material dispatch logs',
    project: 'Construction Site Material Audit',
    assignee: 'Amit D.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    dueDate: '2026-07-28',
    status: 'Completed',
    priority: 'Low',
    estimatedHours: 20,
    trackedHours: 18.5,
  },
];

export const ProjectsModule: React.FC<ProjectsModuleProps> = ({ isDarkMode }) => {
  const [projects, setProjects] = useState<ProjectItem[]>(INITIAL_PROJECTS);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [viewMode, setViewMode] = useState<'board' | 'list' | 'projects'>('board');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTimer, setActiveTimer] = useState<{ id: string; seconds: number; isRunning: boolean } | null>(null);

  // New Task Modal State
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskProject, setNewTaskProject] = useState(INITIAL_PROJECTS[0].title);
  const [newTaskAssignee, setNewTaskAssignee] = useState('Vikram A.');
  const [newTaskPriority, setNewTaskPriority] = useState<'Urgent' | 'High' | 'Normal' | 'Low'>('High');
  const [newTaskHours, setNewTaskHours] = useState('8');

  // Timer Effect
  React.useEffect(() => {
    let interval: any;
    if (activeTimer && activeTimer.isRunning) {
      interval = setInterval(() => {
        setActiveTimer(prev => prev ? { ...prev, seconds: prev.seconds + 1 } : null);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeTimer]);

  const toggleTimer = (taskId: string) => {
    if (activeTimer && activeTimer.id === taskId) {
      setActiveTimer(prev => prev ? { ...prev, isRunning: !prev.isRunning } : null);
    } else {
      setActiveTimer({ id: taskId, seconds: 0, isRunning: true });
    }
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainder = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask: Task = {
      id: `TSK-${Math.floor(100 + Math.random() * 900)}`,
      title: newTaskTitle,
      project: newTaskProject,
      assignee: newTaskAssignee,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'To Do',
      priority: newTaskPriority,
      estimatedHours: parseFloat(newTaskHours) || 8,
      trackedHours: 0
    };

    setTasks([newTask, ...tasks]);
    setNewTaskTitle('');
    setShowNewTaskModal(false);
  };

  const updateTaskStatus = (taskId: string, newStatus: Task['status']) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
  };

  const filteredTasks = tasks.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.project.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.assignee.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getPriorityBadge = (priority: Task['priority']) => {
    switch (priority) {
      case 'Urgent':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'High':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Normal':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'Low':
        return 'bg-neutral-500/10 text-neutral-400 border-neutral-500/20';
    }
  };

  const statuses: Task['status'][] = ['To Do', 'In Progress', 'In Review', 'Completed'];

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Top ClickUp Header Bar */}
      <div className={`p-5 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
        isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200 shadow-sm'
      }`}>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-bold">Projects, Tasks & Sprint Tracker</h2>
          </div>
          <p className="text-xs text-neutral-400">ClickUp-style workspace with Kanban boards, interactive task lists & time logs.</p>
        </div>

        {/* Live Timer Pill */}
        {activeTimer && (
          <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs shrink-0">
            <Clock className="w-4 h-4 text-purple-400 animate-spin" />
            <span className="font-mono font-bold text-purple-400">{formatSeconds(activeTimer.seconds)}</span>
            <button
              onClick={() => setActiveTimer(prev => prev ? { ...prev, isRunning: !prev.isRunning } : null)}
              className="p-1 rounded bg-purple-600 text-white hover:bg-purple-500 transition-colors"
            >
              {activeTimer.isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNewTaskModal(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 text-white font-semibold text-xs shadow-md shadow-purple-600/20 flex items-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* View Switcher & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* ClickUp Tab Switcher */}
        <div className={`p-1 rounded-xl border inline-flex items-center gap-1 ${
          isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-neutral-100 border-neutral-200'
        }`}>
          <button
            onClick={() => setViewMode('board')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === 'board'
                ? isDarkMode ? 'bg-neutral-800 text-neutral-100 shadow-sm' : 'bg-white text-neutral-900 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Kanban className="w-3.5 h-3.5" />
            <span>Kanban Board</span>
          </button>

          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === 'list'
                ? isDarkMode ? 'bg-neutral-800 text-neutral-100 shadow-sm' : 'bg-white text-neutral-900 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>Task List</span>
          </button>

          <button
            onClick={() => setViewMode('projects')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === 'projects'
                ? isDarkMode ? 'bg-neutral-800 text-neutral-100 shadow-sm' : 'bg-white text-neutral-900 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <FolderKanban className="w-3.5 h-3.5" />
            <span>Project Milestones</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
          <input
            type="text"
            placeholder="Search tasks or assignees..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-9 pr-3 py-1.5 rounded-xl border text-xs focus:outline-none focus:border-purple-500 ${
              isDarkMode ? 'bg-neutral-900 border-neutral-800 text-neutral-100' : 'bg-white border-neutral-200 text-neutral-900'
            }`}
          />
        </div>
      </div>

      {/* VIEW 1: KANBAN BOARD */}
      {viewMode === 'board' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto pb-4">
          {statuses.map((status) => {
            const columnTasks = filteredTasks.filter(t => t.status === status);
            return (
              <div
                key={status}
                className={`p-4 rounded-2xl border space-y-3 flex flex-col justify-between ${
                  isDarkMode ? 'bg-neutral-900/50 border-neutral-800/80' : 'bg-neutral-50 border-neutral-200'
                }`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2 border-b border-neutral-800/60">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${
                      status === 'To Do' ? 'bg-amber-400' :
                      status === 'In Progress' ? 'bg-blue-400 animate-pulse' :
                      status === 'In Review' ? 'bg-purple-400' : 'bg-emerald-400'
                    }`}></span>
                    <span className="text-xs font-bold text-neutral-200">{status}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-neutral-800 text-neutral-400">
                    {columnTasks.length}
                  </span>
                </div>

                {/* Column Task Cards */}
                <div className="space-y-3 min-h-[320px]">
                  {columnTasks.map((task) => (
                    <div
                      key={task.id}
                      className={`p-4 rounded-xl border space-y-3 transition-all hover:border-purple-500/40 shadow-sm ${
                        isDarkMode ? 'bg-neutral-900 border-neutral-800 text-neutral-100' : 'bg-white border-neutral-200 text-neutral-900'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[10px] font-mono text-purple-400">{task.project}</span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${getPriorityBadge(task.priority)}`}>
                          {task.priority}
                        </span>
                      </div>

                      <h4 className="text-xs font-semibold leading-snug">{task.title}</h4>

                      <div className="flex items-center justify-between pt-2 border-t border-neutral-800/40 text-[10px] text-neutral-400">
                        <div className="flex items-center gap-1.5">
                          <img src={task.avatar} alt={task.assignee} className="w-4 h-4 rounded-full object-cover" />
                          <span>{task.assignee}</span>
                        </div>
                        <span>Due: {task.dueDate}</span>
                      </div>

                      {/* Card Quick Actions */}
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] font-mono text-neutral-400">
                          {task.trackedHours}h / {task.estimatedHours}h
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => toggleTimer(task.id)}
                            className={`p-1 rounded text-[10px] flex items-center gap-1 font-semibold transition-colors ${
                              activeTimer?.id === task.id && activeTimer.isRunning
                                ? 'bg-purple-600 text-white'
                                : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
                            }`}
                            title="Start Time Tracker"
                          >
                            <Clock className="w-3 h-3 text-purple-400" />
                          </button>
                          
                          <select
                            value={task.status}
                            onChange={(e) => updateTaskStatus(task.id, e.target.value as Task['status'])}
                            className="text-[9px] py-0.5 px-1 rounded bg-neutral-800 border border-neutral-700 text-neutral-300 focus:outline-none"
                          >
                            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}

                  {columnTasks.length === 0 && (
                    <div className="h-28 border border-dashed border-neutral-800 rounded-xl flex items-center justify-center text-xs text-neutral-500">
                      No tasks in {status}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 2: TASK LIST */}
      {viewMode === 'list' && (
        <div className={`rounded-2xl border overflow-hidden ${
          isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200 shadow-sm'
        }`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className={`border-b text-[10px] uppercase font-mono tracking-wider ${
                isDarkMode ? 'bg-neutral-950/60 border-neutral-800 text-neutral-400' : 'bg-neutral-100 border-neutral-200 text-neutral-600'
              }`}>
                <tr>
                  <th className="p-3.5">Task Name</th>
                  <th className="p-3.5">Project</th>
                  <th className="p-3.5">Assignee</th>
                  <th className="p-3.5">Priority</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Tracked Time</th>
                  <th className="p-3.5">Due Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {filteredTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-neutral-800/30 transition-colors">
                    <td className="p-3.5 font-medium flex items-center gap-2">
                      <button onClick={() => updateTaskStatus(task.id, task.status === 'Completed' ? 'To Do' : 'Completed')}>
                        {task.status === 'Completed' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-neutral-500 shrink-0" />
                        )}
                      </button>
                      <span className={task.status === 'Completed' ? 'line-through text-neutral-500' : ''}>
                        {task.title}
                      </span>
                    </td>
                    <td className="p-3.5 text-neutral-400 font-mono text-[11px]">{task.project}</td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-1.5">
                        <img src={task.avatar} alt={task.assignee} className="w-4 h-4 rounded-full object-cover" />
                        <span>{task.assignee}</span>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${getPriorityBadge(task.priority)}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <select
                        value={task.status}
                        onChange={(e) => updateTaskStatus(task.id, e.target.value as Task['status'])}
                        className="text-[11px] py-1 px-2 rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-200"
                      >
                        {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="p-3.5 font-mono text-neutral-300">
                      {task.trackedHours}h / {task.estimatedHours}h
                    </td>
                    <td className="p-3.5 text-neutral-400 font-mono">{task.dueDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 3: PROJECT MILESTONES */}
      {viewMode === 'projects' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map(prj => (
            <div
              key={prj.id}
              className={`p-5 rounded-2xl border space-y-4 flex flex-col justify-between ${
                isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200 shadow-sm'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                    prj.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                  }`}>
                    {prj.status}
                  </span>
                  <span className="text-[11px] font-mono text-neutral-400">Target Due: {prj.dueDate}</span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-neutral-100">{prj.title}</h3>
                  <p className="text-xs text-neutral-400">Client: {prj.client}</p>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-neutral-400">Completion Progress</span>
                    <span className="font-bold text-purple-400">{prj.progress}%</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-neutral-800 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all" style={{ width: `${prj.progress}%` }}></div>
                  </div>
                </div>
              </div>

              {/* Footer Budget */}
              <div className="pt-3 border-t border-neutral-800/60 flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-400">Allocated Budget: ₹{prj.budget.toLocaleString()}</span>
                <span className="text-neutral-400 text-[11px]">Milestone 3/4 Active</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* NEW TASK MODAL */}
      {showNewTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className={`w-full max-w-md p-6 rounded-2xl border space-y-4 shadow-2xl ${
            isDarkMode ? 'bg-neutral-900 border-neutral-800 text-neutral-100' : 'bg-white border-neutral-200 text-neutral-900'
          }`}>
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
              <h3 className="text-base font-bold">Create New Task</h3>
              <button onClick={() => setShowNewTaskModal(false)} className="text-neutral-400 hover:text-neutral-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
              <div>
                <label className="block mb-1 font-semibold text-neutral-400">Task Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Build REST API endpoint for invoices"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border focus:outline-none focus:border-purple-500 ${
                    isDarkMode ? 'bg-neutral-950 border-neutral-800 text-neutral-100' : 'bg-neutral-50 border-neutral-200 text-neutral-900'
                  }`}
                />
              </div>

              <div>
                <label className="block mb-1 font-semibold text-neutral-400">Project</label>
                <select
                  value={newTaskProject}
                  onChange={(e) => setNewTaskProject(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border focus:outline-none ${
                    isDarkMode ? 'bg-neutral-950 border-neutral-800 text-neutral-100' : 'bg-neutral-50 border-neutral-200 text-neutral-900'
                  }`}
                >
                  {projects.map(p => <option key={p.id} value={p.title}>{p.title}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-semibold text-neutral-400">Assignee</label>
                  <input
                    type="text"
                    value={newTaskAssignee}
                    onChange={(e) => setNewTaskAssignee(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border focus:outline-none ${
                      isDarkMode ? 'bg-neutral-950 border-neutral-800 text-neutral-100' : 'bg-neutral-50 border-neutral-200 text-neutral-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="block mb-1 font-semibold text-neutral-400">Priority</label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as any)}
                    className={`w-full p-2.5 rounded-xl border focus:outline-none ${
                      isDarkMode ? 'bg-neutral-950 border-neutral-800 text-neutral-100' : 'bg-neutral-50 border-neutral-200 text-neutral-900'
                    }`}
                  >
                    <option value="Urgent">Urgent</option>
                    <option value="High">High</option>
                    <option value="Normal">Normal</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block mb-1 font-semibold text-neutral-400">Estimated Hours</label>
                <input
                  type="number"
                  value={newTaskHours}
                  onChange={(e) => setNewTaskHours(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border focus:outline-none ${
                    isDarkMode ? 'bg-neutral-950 border-neutral-800 text-neutral-100' : 'bg-neutral-50 border-neutral-200 text-neutral-900'
                  }`}
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewTaskModal(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold shadow-md shadow-purple-600/20"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
