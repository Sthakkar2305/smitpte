'use client';

import { useState, useEffect } from 'react';
import LoginForm from '@/components/auth/login-form';
import RegisterForm from '@/components/auth/register-form';
import Sidebar from '@/components/dashboard/sidebar';
import StudentsManagement from '@/components/dashboard/admin/students-management';
import TeacherManagement from '@/components/dashboard/admin/teacher-management';
import TaskManager from '@/components/dashboard/admin/task-manager';
import MaterialUpload from '@/components/dashboard/admin/material-upload';
import SubmissionsReview from '@/components/dashboard/admin/submissions-review';
import TaskList from '@/components/dashboard/student/task-list';
import LearningCenter from '@/components/dashboard/student/learning-center';
import ProgressReport from '@/components/dashboard/student/progress-report';

export default function Home() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [activeView, setActiveView] = useState('dashboard');
  const [dashboardStats, setDashboardStats] = useState(null);

  useEffect(() => {
    // Check for stored auth data
    const storedToken = localStorage.getItem('pte_token');
    const storedUser = localStorage.getItem('pte_user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }

    // Create default admin if needed (only run once)
    const hasSeeded = localStorage.getItem('admin_seeded');
    if (!hasSeeded) {
      fetch('/api/auth/seed-admin', {
        method: 'POST',
      }).then(() => {
        localStorage.setItem('admin_seeded', 'true');
      }).catch(console.error);
    }
  }, []);

  useEffect(() => {
    if (user && token) {
      fetchDashboardStats();
    }
  }, [user, token]);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setDashboardStats(data);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  const handleAuth = (authToken: string, userData: any) => {
    setToken(authToken);
    setUser(userData);
    localStorage.setItem('pte_token', authToken);
    localStorage.setItem('pte_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setToken('');
    setUser(null);
    setActiveView('dashboard');
    setDashboardStats(null);
    localStorage.removeItem('pte_token');
    localStorage.removeItem('pte_user');
  };

  const renderContent = () => {
    if (!user) return null;

    if (user.role === 'admin') {
      switch (activeView) {
        case 'students':
          return <StudentsManagement token={token} />;
        case 'teachers':
          return <TeacherManagement token={token} />;
        case 'tasks':
          return <TaskManager token={token} />;
        case 'submissions':
          return <SubmissionsReview token={token} />;
        case 'materials':
          return <MaterialUpload token={token} />;
        case 'dashboard':
        default:
          return (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                  <h3 className="text-lg font-semibold">Total Students</h3>
                  <p className="text-3xl font-bold mt-2">{dashboardStats?.totalStudents || 0}</p>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
                  <h3 className="text-lg font-semibold">Active Tasks</h3>
                  <p className="text-3xl font-bold mt-2">{dashboardStats?.activeTasks || 0}</p>
                </div>
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                  <h3 className="text-lg font-semibold">Pending Reviews</h3>
                  <p className="text-3xl font-bold mt-2">{dashboardStats?.pendingReviews || 0}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
                  <h3 className="text-lg font-semibold">Total Submissions</h3>
                  <p className="text-3xl font-bold mt-2">{dashboardStats?.totalSubmissions || 0}</p>
                </div>
                <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-lg p-6 text-white">
                  <h3 className="text-lg font-semibold">Approved</h3>
                  <p className="text-3xl font-bold mt-2">{dashboardStats?.approvedSubmissions || 0}</p>
                </div>
                <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-6 text-white">
                  <h3 className="text-lg font-semibold">Rejected</h3>
                  <p className="text-3xl font-bold mt-2">{dashboardStats?.rejectedSubmissions || 0}</p>
                </div>
              </div>
            </div>
          );
      }
    } else {
      switch (activeView) {
        case 'tasks':
          return <TaskList token={token} />;
        case 'learning':
          return <LearningCenter token={token} />;
        case 'progress':
          return <ProgressReport token={token} />;
        case 'dashboard':
        default:
          return (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                  <h3 className="text-lg font-semibold">Assigned Tasks</h3>
                  <p className="text-3xl font-bold mt-2">{dashboardStats?.assignedTasks || 0}</p>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
                  <h3 className="text-lg font-semibold">Completed</h3>
                  <p className="text-3xl font-bold mt-2">{dashboardStats?.completedTasks || 0}</p>
                </div>
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
                  <h3 className="text-lg font-semibold">Pending</h3>
                  <p className="text-3xl font-bold mt-2">{dashboardStats?.pendingTasks || 0}</p>
                </div>
              </div>
            </div>
          );
      }
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">PTE Preparation</h1>
            <p className="text-gray-600">Your gateway to PTE success</p>
          </div>
          
          {isLogin ? (
            <LoginForm 
              onLogin={handleAuth}
              onToggleMode={() => setIsLogin(false)}
            />
          ) : (
            <RegisterForm 
              onRegister={handleAuth}
              onToggleMode={() => setIsLogin(true)}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        user={user}
        activeView={activeView}
        onViewChange={setActiveView}
        onLogout={handleLogout}
      />
      
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user.name}!
            </h1>
            <p className="text-gray-600">
              {user.role === 'admin' ? 'Manage your students and track their progress' : 'Continue your PTE preparation journey'}
            </p>
          </div>
          
          {renderContent()}
        </div>
      </main>
    </div>
  );
}