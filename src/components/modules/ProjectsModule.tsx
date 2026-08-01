import React, { useState } from 'react';
import { FolderKanban, CheckSquare, Clock, Plus, Users, Play, Pause, X } from 'lucide-react';
import { ProjectItem } from '../../types';
import { mockProjects } from '../../data/mockData';

interface ProjectsModuleProps {
  isDarkMode: boolean;
}

export const ProjectsModule: React.FC<ProjectsModuleProps> = ({ isDarkMode }) => {
  const [projects, setProjects] = useState<ProjectItem[]>(mockProjects);
  const [activeTimer, setActiveTimer] = useState<{ id: string; seconds: number; isRunning: boolean } | null>(null);

  // Timer effect simulation
  React.useEffect(() => {
    let interval: any;
    if (activeTimer && activeTimer.isRunning) {
      interval = setInterval(() => {
        setActiveTimer(prev => prev ? { ...prev, seconds: prev.seconds + 1 } : null);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeTimer]);

  const toggleTimer = (projectId: string) => {
    if (activeTimer && activeTimer.id === projectId) {
      setActiveTimer(prev => prev ? { ...prev, isRunning: !prev.isRunning } : null);
    } else {
      setActiveTimer({ id: projectId, seconds: 0, isRunning: true });
    }
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainder = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
        isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200 shadow-sm'
      }`}>
        <div>
          <h2 className="text-lg font-bold">Projects, Tasks & Time Tracker</h2>
          <p className="text-xs text-neutral-400">Manage client deliverables, task kanban boards & billable time tracking.</p>
        </div>

        {activeTimer && (
          <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs">
            <Clock className="w-4 h-4 text-blue-400 animate-spin" />
            <span className="font-mono font-bold text-blue-400">{formatSeconds(activeTimer.seconds)}</span>
            <button
              onClick={() => setActiveTimer(prev => prev ? { ...prev, isRunning: !prev.isRunning } : null)}
              className="p-1 rounded bg-blue-600 text-white"
            >
              {activeTimer.isRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            </button>
          </div>
        )}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                  prj.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                }`}>
                  {prj.status}
                </span>
                <span className="text-[11px] font-mono text-neutral-400">Due: {prj.dueDate}</span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-neutral-100">{prj.title}</h3>
                <p className="text-xs text-neutral-400">Client: {prj.client}</p>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-neutral-400">Completion Progress</span>
                  <span className="font-bold text-blue-400">{prj.progress}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-neutral-800 overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${prj.progress}%` }}></div>
                </div>
              </div>
            </div>

            {/* Footer Timer & Budget */}
            <div className="pt-3 border-t border-neutral-800/60 flex items-center justify-between text-xs">
              <span className="font-bold text-emerald-400">Budget: ₹{prj.budget.toLocaleString()}</span>
              <button
                onClick={() => toggleTimer(prj.id)}
                className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold flex items-center gap-1.5"
              >
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                <span>{activeTimer?.id === prj.id && activeTimer.isRunning ? 'Pause Timer' : 'Track Time'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
