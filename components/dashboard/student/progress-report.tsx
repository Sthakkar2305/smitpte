'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, CheckCircle, Clock, XCircle, Target } from 'lucide-react';
import LoadingSpinner from '@/components/ui/loading-spinner';

interface ProgressReportProps {
  token: string;
}

const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#6B7280'];

export default function ProgressReport({ token }: ProgressReportProps) {
  const [stats, setStats] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const response = await fetch('/api/submissions', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setSubmissions(data);
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTaskTypeStats = () => {
    const taskTypes = {};
    submissions.forEach((submission: any) => {
      const type = submission.task?.type || 'Unknown';
      if (!taskTypes[type]) {
        taskTypes[type] = { approved: 0, pending: 0, rejected: 0 };
      }
      taskTypes[type][submission.status]++;
    });

    return Object.entries(taskTypes).map(([type, counts]: [string, any]) => ({
      type,
      approved: counts.approved,
      pending: counts.pending,
      rejected: counts.rejected,
      total: counts.approved + counts.pending + counts.rejected
    }));
  };

  const getWeeklyProgress = () => {
    const weeks = {};
    const now = new Date();
    
    // Initialize last 4 weeks
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (i * 7));
      const weekKey = `Week ${4 - i}`;
      weeks[weekKey] = { submitted: 0, approved: 0 };
    }

    submissions.forEach((submission: any) => {
      const submissionDate = new Date(submission.submittedAt);
      const daysDiff = Math.floor((now.getTime() - submissionDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff <= 28) {
        const weekIndex = Math.floor(daysDiff / 7);
        const weekKey = `Week ${4 - weekIndex}`;
        if (weeks[weekKey]) {
          weeks[weekKey].submitted++;
          if (submission.status === 'approved') {
            weeks[weekKey].approved++;
          }
        }
      }
    });

    return Object.entries(weeks).map(([week, data]: [string, any]) => ({
      week,
      submitted: data.submitted,
      approved: data.approved
    }));
  };

  const getOverallProgress = () => {
    if (!stats) return 0;
    const total = stats.completedTasks + stats.pendingTasks + stats.rejectedTasks;
    return total > 0 ? Math.round((stats.completedTasks / total) * 100) : 0;
  };

  const getPieChartData = () => {
    if (!stats) return [];
    return [
      { name: 'Completed', value: stats.completedTasks, color: '#10B981' },
      { name: 'Pending', value: stats.pendingTasks, color: '#F59E0B' },
      { name: 'Rejected', value: stats.rejectedTasks, color: '#EF4444' },
    ].filter(item => item.value > 0);
  };

  useEffect(() => {
    fetchStats();
    fetchSubmissions();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Progress Report</CardTitle>
        </CardHeader>
        <CardContent>
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  const taskTypeStats = getTaskTypeStats();
  const weeklyProgress = getWeeklyProgress();
  const overallProgress = getOverallProgress();
  const pieChartData = getPieChartData();

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Assigned Tasks</p>
                <p className="text-2xl font-bold">{stats?.assignedTasks || 0}</p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats?.completedTasks || 0}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats?.pendingTasks || 0}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{stats?.rejectedTasks || 0}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Overall Progress
          </CardTitle>
          <CardDescription>Your completion rate across all tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Completion Rate</span>
              <span className="text-2xl font-bold">{overallProgress}%</span>
            </div>
            <Progress value={overallProgress} className="h-3" />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Progress Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Progress</CardTitle>
            <CardDescription>Tasks submitted and approved over the last 4 weeks</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyProgress}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="submitted" fill="#3B82F6" name="Submitted" />
                <Bar dataKey="approved" fill="#10B981" name="Approved" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Task Status Distribution</CardTitle>
            <CardDescription>Breakdown of your task completion status</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Task Type Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Performance by Task Type</CardTitle>
          <CardDescription>Your performance across different PTE task types</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {taskTypeStats.map((taskType, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{taskType.type}</h4>
                  <Badge variant="outline">
                    {taskType.total} total
                  </Badge>
                </div>
                <div className="flex space-x-2 mb-2">
                  <Badge className="bg-green-100 text-green-800">
                    {taskType.approved} approved
                  </Badge>
                  <Badge className="bg-yellow-100 text-yellow-800">
                    {taskType.pending} pending
                  </Badge>
                  {taskType.rejected > 0 && (
                    <Badge className="bg-red-100 text-red-800">
                      {taskType.rejected} rejected
                    </Badge>
                  )}
                </div>
                <Progress 
                  value={taskType.total > 0 ? (taskType.approved / taskType.total) * 100 : 0} 
                  className="h-2" 
                />
              </div>
            ))}
            {taskTypeStats.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Target className="h-12 w-12 mx-auto mb-4" />
                <p>No task submissions yet</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}