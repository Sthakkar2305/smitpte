'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  Users, 
  FileText, 
  Upload, 
  BarChart3, 
  CheckSquare,
  GraduationCap,
  LogOut,
  Menu,
  X,
  UserPlus,
  ClipboardList,
  TrendingUp
} from 'lucide-react';

interface SidebarProps {
  user: any;
  activeView: string;
  onViewChange: (view: string) => void;
  onLogout: () => void;
}

export default function Sidebar({ user, activeView, onViewChange, onLogout }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const adminMenuItems = [
    { key: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { key: 'students', label: 'Students', icon: Users },
    { key: 'teachers', label: 'Teachers', icon: UserPlus },
    { key: 'tasks', label: 'Tasks', icon: CheckSquare },
    { key: 'submissions', label: 'Submissions', icon: ClipboardList },
    { key: 'materials', label: 'Materials', icon: Upload },
  ];

  const studentMenuItems = [
    { key: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { key: 'tasks', label: 'My Tasks', icon: CheckSquare },
    { key: 'learning', label: 'Learning Center', icon: BookOpen },
    { key: 'progress', label: 'My Progress', icon: TrendingUp },
  ];

  const menuItems = user?.role === 'admin' ? adminMenuItems : studentMenuItems;

  return (
    <>
      {/* Mobile toggle button */}
      <div className="md:hidden p-3 bg-slate-900 text-white flex justify-between items-center">
        <h2 className="font-semibold">PTE Prep</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setMobileOpen(true)}
          className="text-white hover:bg-slate-700"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Sidebar + Overlay for mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div
        className={`
          fixed md:static top-0 left-0 h-full z-50
          bg-slate-900 text-white flex flex-col
          transition-all duration-300
          ${collapsed ? 'w-16' : 'w-64'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
        `}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center justify-between">
            {!collapsed && (
              <div>
                <h2 className="text-lg font-semibold">PTE Prep</h2>
                <p className="text-sm text-slate-400 capitalize">{user?.role} Portal</p>
              </div>
            )}
            {/* Collapse / Close buttons */}
            <div className="flex gap-2">
              {/* Collapse button only on md+ */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCollapsed(!collapsed)}
                className="text-white hover:bg-slate-700 hidden md:flex"
              >
                {collapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
              </Button>
              {/* Mobile close button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileOpen(false)}
                className="text-white hover:bg-slate-700 md:hidden"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.key}
                  variant={activeView === item.key ? 'secondary' : 'ghost'}
                  className={`w-full justify-start text-white hover:bg-slate-700 ${
                    collapsed ? 'px-2' : 'px-3'
                  }`}
                  onClick={() => {
                    onViewChange(item.key);
                    setMobileOpen(false); // close on mobile navigation
                  }}
                >
                  <Icon className="h-4 w-4" />
                  {!collapsed && <span className="ml-2">{item.label}</span>}
                </Button>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700">
          {!collapsed && (
            <div className="mb-4">
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-slate-400">{user?.email}</p>
            </div>
          )}
          <Button
            variant="ghost"
            className={`w-full justify-start text-white hover:bg-slate-700 ${
              collapsed ? 'px-2' : 'px-3'
            }`}
            onClick={() => {
              onLogout();
              setMobileOpen(false);
            }}
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && <span className="ml-2">Logout</span>}
          </Button>
        </div>
      </div>
    </>
  );
}
