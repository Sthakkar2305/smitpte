'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, CheckCircle, Clock, XCircle, Target } from 'lucide-react';
import LoadingSpinner from '@/components/ui/loading-spinner';

// ****** Typed interfaces ******
type Status = 'approved' | 'pending' | 'rejected' | 'Unknown';
interface SubmissionTask {
  type?: string;
}
interface Submission {
  task?: SubmissionTask;
  status: Status;
  submittedAt: string;
}
interface Stats {
  assignedTasks: number;
  completedTasks: number;
  pendingTasks: number;
  rejectedTasks: number;
}

interface ProgressReportProps {
  token: string;
}

const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#6B7280'];

export default function ProgressReport({ token }: ProgressReportProps) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch stats
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

  // Fetch submissions
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

  // Calculate stats by task type
  const getTaskTypeStats = () => {
    // Use safer typing: Record<string, {approved: number; pending: number; rejected: number}>
    const taskTypes: Record<string, { approved: number; pending: number; rejected: number }> = {};
    submissions.forEach((submission) => {
      const type = submission.task?.type || 'Unknown';
      if (!taskTypes[type]) {
        taskTypes[type] = { approved: 0, pending: 0, rejected: 0 };
      }
      if (
        submission.status === 'approved' ||
        submission.status === 'pending' ||
        submission.status === 'rejected'
      ) {
        taskTypes[type][submission.status]++;
      }
    });
    return Object.entries(taskTypes).map(([type, counts]) => ({
      type,
      approved: counts.approved,
      pending: counts.pending,
      rejected: counts.rejected,
      total: counts.approved + counts.pending + counts.rejected,
    }));
  };

  // Weekly progress
  const getWeeklyProgress = () => {
    // Record week name -> stats
    const weeks: Record<string, { submitted: number; approved: number }> = {};
    const now = new Date();

    // Initialize last 4 weeks
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (i * 7));
      const weekKey = `Week ${4 - i}`;
      weeks[weekKey] = { submitted: 0, approved: 0 };
    }

    submissions.forEach((submission) => {
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

    return Object.entries(weeks).map(([week, data]) => ({
      week,
      submitted: data.submitted,
      approved: data.approved,
    }));
  };

  // Overall progress
  const getOverallProgress = () => {
    if (!stats) return 0;
    const total = stats.completedTasks + stats.pendingTasks + stats.rejectedTasks;
    return total > 0 ? Math.round((stats.completedTasks / total) * 100) : 0;
  };

  // Pie chart data
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
    // eslint-disable-next-line
  }, []);

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Progress Report</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center min-h-[200px]">
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
    <div className="space-y-4 md:space-y-6 p-2 sm:p-4">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
        <Card className="w-full">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Assigned Tasks</p>
                <p className="text-xl sm:text-2xl font-bold">{stats?.assignedTasks || 0}</p>
              </div>
              <Target className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="w-full">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Completed</p>
                <p className="text-xl sm:text-2xl font-bold text-green-600">{stats?.completedTasks || 0}</p>
              </div>
              <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="w-full">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Pending</p>
                <p className="text-xl sm:text-2xl font-bold text-yellow-600">{stats?.pendingTasks || 0}</p>
              </div>
              <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="w-full">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-xl sm:text-2xl font-bold text-red-600">{stats?.rejectedTasks || 0}</p>
              </div>
              <XCircle className="h-6 w-6 sm:h-8 sm:w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overall Progress */}
      <Card className="w-full">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center text-lg sm:text-xl">
            <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            Overall Progress
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">Your completion rate across all tasks</CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Completion Rate</span>
              <span className="text-xl sm:text-2xl font-bold">{overallProgress}%</span>
            </div>
            <Progress value={overallProgress} className="h-2 sm:h-3" />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Weekly Progress Chart */}
        <Card className="w-full">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">Weekly Progress</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Tasks submitted and approved over the last 4 weeks</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="w-full h-[250px] sm:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyProgress} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="submitted" fill="#3B82F6" name="Submitted" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="approved" fill="#10B981" name="Approved" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card className="w-full">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">Task Status Distribution</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Breakdown of your task completion status</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="w-full h-[250px] sm:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
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
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Task Type Performance */}
      <Card className="w-full">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-base sm:text-lg">Performance by Task Type</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Your performance across different PTE task types</CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="space-y-3 sm:space-y-4">
            {taskTypeStats.map((taskType, index) => (
              <div key={index} className="border rounded-lg p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
                  <h4 className="font-medium text-sm sm:text-base">{taskType.type}</h4>
                  <Badge variant="outline" className="text-xs sm:text-sm w-fit">
                    {taskType.total} total
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-1 sm:gap-2 mb-2">
                  <Badge className="bg-green-100 text-green-800 text-xs">
                    {taskType.approved} approved
                  </Badge>
                  <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                    {taskType.pending} pending
                  </Badge>
                  {taskType.rejected > 0 && (
                    <Badge className="bg-red-100 text-red-800 text-xs">
                      {taskType.rejected} rejected
                    </Badge>
                  )}
                </div>
                <Progress 
                  value={taskType.total > 0 ? (taskType.approved / taskType.total) * 100 : 0} 
                  className="h-1.5 sm:h-2" 
                />
              </div>
            ))}
            {taskTypeStats.length === 0 && (
              <div className="text-center py-6 sm:py-8 text-gray-500">
                <Target className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4" />
                <p className="text-sm sm:text-base">No task submissions yet</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}