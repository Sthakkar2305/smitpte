"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
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
  TrendingUp,
  Languages,
  History,
} from "lucide-react";
import { useMediaQuery } from "@/hooks/use-media-query";

interface SidebarProps {
  user: any;
  activeView: string;
  onViewChange: (view: string) => void;
  onLogout: () => void;
}

export default function Sidebar({
  user,
  activeView,
  onViewChange,
  onLogout,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const adminMenuItems = [
    { key: "dashboard", label: "Dashboard", icon: BarChart3 },
    { key: "students", label: "Students", icon: Users },
    { key: "teachers", label: "Teachers", icon: UserPlus },
    { key: "tasks", label: "Tasks", icon: CheckSquare },
    { key: "submissions", label: "Submissions", icon: ClipboardList },
    { key: "materials", label: "Materials", icon: Upload },
  ];

  const studentMenuItems = [
    { key: "dashboard", label: "Dashboard", icon: BarChart3 },
    { key: "tasks", label: "My Tasks", icon: CheckSquare },
    { key: "learning", label: "Learning Center", icon: BookOpen },
    { key: "grammar", label: "Grammar Guide", icon: Languages },
    { key: "task-history", label: "Task History", icon: History },
    { key: "progress", label: "My Progress", icon: TrendingUp },
  ];

  const menuItems = user?.role === "admin" ? adminMenuItems : studentMenuItems;

  // Close mobile menu when switching to desktop
  useEffect(() => {
    if (isDesktop) {
      setMobileOpen(false);
    }
  }, [isDesktop]);

  return (
    <>
      {/* Mobile navbar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-slate-900 text-white p-3 flex justify-between items-center shadow-md">
        <h2 className="font-semibold text-lg">PTE Prep</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-white hover:bg-slate-700"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed md:static top-0 left-0 h-full z-50
          bg-slate-900 text-white flex flex-col
          transition-all duration-300
          ${collapsed ? "w-16" : "w-64"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
          mt-14 md:mt-0
        `}
      >
        {/* Sidebar Header - Desktop only */}
        {isDesktop && (
          <div className="p-4 border-b border-slate-700">
            <div className="flex items-center justify-between">
              {!collapsed && (
                <div>
                  <h2 className="text-lg font-semibold">PTE Prep</h2>
                  <p className="text-sm text-slate-400 capitalize">
                    {user?.role} Portal
                  </p>
                </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCollapsed(!collapsed)}
                className="text-white hover:bg-slate-700"
              >
                {collapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        )}

        {/* Menu Items */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.key}
                  variant={activeView === item.key ? "secondary" : "ghost"}
                  className={`w-full justify-start text-white hover:bg-slate-700 ${
                    collapsed && isDesktop ? "px-2" : "px-3"
                  }`}
                  onClick={() => {
                    onViewChange(item.key);
                    setMobileOpen(false);
                  }}
                >
                  <Icon className="h-4 w-4" />
                  {(!collapsed || !isDesktop) && <span className="ml-2">{item.label}</span>}
                </Button>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700">
          {(!collapsed || !isDesktop) && (
            <div className="mb-4">
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-slate-400">{user?.email}</p>
            </div>
          )}
          <Button
            variant="ghost"
            className={`w-full justify-start text-white hover:bg-slate-700 ${
              collapsed && isDesktop ? "px-2" : "px-3"
            }`}
            onClick={() => {
              onLogout();
              setMobileOpen(false);
            }}
          >
            <LogOut className="h-4 w-4" />
            {(!collapsed || !isDesktop) && <span className="ml-2">Logout</span>}
          </Button>
        </div>
      </div>
    </>
  );
}