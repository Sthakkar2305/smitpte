'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, CheckCircle, Clock, XCircle, Target, Calendar, RefreshCw, AlertCircle } from 'lucide-react';

// ****** Typed interfaces ******
type Status = 'approved' | 'pending' | 'rejected' | 'Unknown';
interface SubmissionTask {
  _id: string;
  type?: string;
  deadline?: string;
}
interface Submission {
  _id: string;
  task?: SubmissionTask;
  status: Status;
  submittedAt: string;
}
interface Task {
  _id: string;
  title: string;
  type: string;
  deadline?: string;
  assignedTo: string[];
}

interface Stats {
  assignedTasks: number;
  completedTasks: number;
  pendingTasks: number;
  rejectedTasks: number;
  overdueTasks: number;
}

interface ProgressReportProps {
  token: string;
}

const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#6B7280', '#8B5CF6'];

// Mock data for demonstration - updated to match your scenario
const MOCK_SUBMISSIONS: Submission[] = [
  { _id: '1', task: { _id: '101', type: 'Reading', deadline: '2023-10-15' }, status: 'approved', submittedAt: '2023-10-10' },
  { _id: '2', task: { _id: '102', type: 'Listening', deadline: '2023-10-20' }, status: 'approved', submittedAt: '2023-10-18' },
  { _id: '3', task: { _id: '103', type: 'Speaking', deadline: '2023-10-25' }, status: 'approved', submittedAt: '2023-10-22' },
  { _id: '4', task: { _id: '104', type: 'Writing', deadline: '2023-10-30' }, status: 'approved', submittedAt: '2023-10-28' },
  { _id: '5', task: { _id: '105', type: 'Reading', deadline: '2023-11-05' }, status: 'approved', submittedAt: '2023-11-01' },
  { _id: '6', task: { _id: '106', type: 'Listening', deadline: '2023-11-10' }, status: 'approved', submittedAt: '2023-11-07' },
  { _id: '7', task: { _id: '107', type: 'Speaking', deadline: '2023-11-15' }, status: 'approved', submittedAt: '2023-11-12' },
  { _id: '8', task: { _id: '108', type: 'Writing', deadline: '2023-11-20' }, status: 'pending', submittedAt: '2023-11-18' },
  { _id: '9', task: { _id: '109', type: 'Reading', deadline: '2023-11-25' }, status: 'pending', submittedAt: '2023-11-22' },
];

const MOCK_TASKS: Task[] = [
  { _id: '101', title: 'Read Article 1', type: 'Reading', deadline: '2023-10-15', assignedTo: ['user1'] },
  { _id: '102', title: 'Listen to Audio 1', type: 'Listening', deadline: '2023-10-20', assignedTo: ['user1'] },
  { _id: '103', title: 'Record Speech 1', type: 'Speaking', deadline: '2023-10-25', assignedTo: ['user1'] },
  { _id: '104', title: 'Write Essay 1', type: 'Writing', deadline: '2023-10-30', assignedTo: ['user1'] },
  { _id: '105', title: 'Read Article 2', type: 'Reading', deadline: '2023-11-05', assignedTo: ['user1'] },
  { _id: '106', title: 'Listen to Audio 2', type: 'Listening', deadline: '2023-11-10', assignedTo: ['user1'] },
  { _id: '107', title: 'Record Speech 2', type: 'Speaking', deadline: '2023-11-15', assignedTo: ['user1'] },
  { _id: '108', title: 'Write Essay 2', type: 'Writing', deadline: '2023-11-20', assignedTo: ['user1'] },
  { _id: '109', title: 'Read Article 3', type: 'Reading', deadline: '2023-11-25', assignedTo: ['user1'] },
  { _id: '110', title: 'Overdue Task 1', type: 'Reading', deadline: '2023-09-30', assignedTo: ['user1'] },
  { _id: '111', title: 'Overdue Task 2', type: 'Listening', deadline: '2023-10-05', assignedTo: ['user1'] },
  { _id: '112', title: 'Overdue Task 3', type: 'Speaking', deadline: '2023-10-10', assignedTo: ['user1'] },
  { _id: '113', title: 'Overdue Task 4', type: 'Writing', deadline: '2023-10-12', assignedTo: ['user1'] },
];

export default function ProgressReport({ token }: ProgressReportProps) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useMockData, setUseMockData] = useState(false);

  // Helper function to ensure we always work with arrays
  const ensureArray = <T,>(data: any): T[] => {
    if (Array.isArray(data)) return data;
    if (data && typeof data === 'object') return [data];
    return [];
  };

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
      } else {
        console.error('Failed to fetch stats:', response.status);
        setUseMockData(true);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      setError('Failed to load statistics');
      setUseMockData(true);
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
        // Ensure we always have an array
        setSubmissions(ensureArray<Submission>(data));
      } else {
        console.error('Failed to fetch submissions:', response.status);
        setSubmissions(MOCK_SUBMISSIONS);
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
      setError('Failed to load submissions');
      setSubmissions(MOCK_SUBMISSIONS);
    }
  };

  // Fetch tasks
  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        // Ensure we always have an array
        setTasks(ensureArray<Task>(data));
      } else {
        console.error('Failed to fetch tasks:', response.status);
        setTasks(MOCK_TASKS);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setError('Failed to load tasks');
      setTasks(MOCK_TASKS);
    } finally {
      setLoading(false);
    }
  };

  // Check if task has a submission
  const hasSubmission = (taskId: string): boolean => {
    return submissions.some(submission => submission.task?._id === taskId);
  };

  // Calculate stats including overdue tasks
  const calculateEnhancedStats = (): Stats => {
    // Ensure we have arrays to work with
    const safeSubmissions = Array.isArray(submissions) ? submissions : [];
    const safeTasks = Array.isArray(tasks) ? tasks : [];

    // First count all the submissions by status
    const baseStats = {
      assignedTasks: safeTasks.length,
      completedTasks: safeSubmissions.filter(s => s.status === 'approved').length,
      pendingTasks: safeSubmissions.filter(s => s.status === 'pending').length,
      rejectedTasks: safeSubmissions.filter(s => s.status === 'rejected').length,
      overdueTasks: 0
    };

    // Count overdue tasks (tasks with deadline passed and no submission OR pending submission after deadline)
    const overdueCount = safeTasks.filter(task => {
      if (!task.deadline) return false;
      
      const isOverdue = new Date(task.deadline) < new Date();
      if (!isOverdue) return false;
      
      // Check if this task has any submission
      const taskSubmission = safeSubmissions.find(submission => submission.task?._id === task._id);
      
      // Task is overdue if:
      // 1. No submission at all, OR
      // 2. Has a pending submission that was submitted after the deadline
      if (!taskSubmission) return true;
      
      if (taskSubmission.status === 'pending') {
        const submittedDate = new Date(taskSubmission.submittedAt);
        const deadlineDate = new Date(task.deadline);
        return submittedDate > deadlineDate;
      }
      
      return false;
    }).length;

    return {
      ...baseStats,
      overdueTasks: overdueCount,
      rejectedTasks: baseStats.rejectedTasks // Don't automatically add overdue to rejected
    };
  };

  // Calculate stats by task type including overdue tasks
  const getTaskTypeStats = () => {
    // Ensure we have arrays to work with
    const safeSubmissions = Array.isArray(submissions) ? submissions : [];
    const safeTasks = Array.isArray(tasks) ? tasks : [];
    
    const taskTypes: Record<string, { approved: number; pending: number; rejected: number; overdue: number }> = {};
    
    // Process submissions
    safeSubmissions.forEach((submission) => {
      const type = submission.task?.type || 'Unknown';
      if (!taskTypes[type]) {
        taskTypes[type] = { approved: 0, pending: 0, rejected: 0, overdue: 0 };
      }
      if (
        submission.status === 'approved' ||
        submission.status === 'pending' ||
        submission.status === 'rejected'
      ) {
        taskTypes[type][submission.status]++;
      }
    });

    // Process overdue tasks (no submission or pending submission after deadline)
    safeTasks.forEach(task => {
      if (!task.deadline) return;
      
      const isOverdue = new Date(task.deadline) < new Date();
      if (!isOverdue) return;
      
      const taskSubmission = safeSubmissions.find(submission => submission.task?._id === task._id);
      const type = task.type || 'Unknown';
      
      if (!taskTypes[type]) {
        taskTypes[type] = { approved: 0, pending: 0, rejected: 0, overdue: 0 };
      }
      
      // Task is overdue if:
      // 1. No submission at all, OR
      // 2. Has a pending submission that was submitted after the deadline
      let isTaskOverdue = false;
      
      if (!taskSubmission) {
        isTaskOverdue = true;
      } else if (taskSubmission.status === 'pending') {
        const submittedDate = new Date(taskSubmission.submittedAt);
        const deadlineDate = new Date(task.deadline);
        isTaskOverdue = submittedDate > deadlineDate;
      }
      
      if (isTaskOverdue) {
        taskTypes[type].overdue++;
      }
    });

    return Object.entries(taskTypes).map(([type, counts]) => ({
      type,
      approved: counts.approved,
      pending: counts.pending,
      rejected: counts.rejected,
      overdue: counts.overdue,
      total: counts.approved + counts.pending + counts.rejected + counts.overdue,
    }));
  };

  // Weekly progress
  const getWeeklyProgress = () => {
    // Ensure we have arrays to work with
    const safeSubmissions = Array.isArray(submissions) ? submissions : [];
    
    const weeks: Record<string, { submitted: number; approved: number }> = {};
    const now = new Date();

    // Initialize last 4 weeks
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (i * 7));
      const weekKey = `Week ${4 - i}`;
      weeks[weekKey] = { submitted: 0, approved: 0 };
    }

    safeSubmissions.forEach((submission) => {
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
    const enhancedStats = calculateEnhancedStats();
    const total = enhancedStats.completedTasks + enhancedStats.pendingTasks + enhancedStats.rejectedTasks + enhancedStats.overdueTasks;
    return total > 0 ? Math.round((enhancedStats.completedTasks / total) * 100) : 0;
  };

  // Pie chart data
  const getPieChartData = () => {
    const enhancedStats = calculateEnhancedStats();
    return [
      { name: 'Completed', value: enhancedStats.completedTasks, color: '#10B981' },
      { name: 'Pending', value: enhancedStats.pendingTasks, color: '#F59E0B' },
      { name: 'Rejected', value: enhancedStats.rejectedTasks, color: '#EF4444' },
      { name: 'Overdue', value: enhancedStats.overdueTasks, color: '#8B5CF6' },
    ].filter(item => item.value > 0);
  };

  const loadData = () => {
    setLoading(true);
    setError(null);
    fetchStats();
    fetchSubmissions();
    fetchTasks();
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Progress Report</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center min-h-[200px]">
          <div className="flex flex-col items-center">
            <RefreshCw className="h-8 w-8 animate-spin mb-4" />
            <p>Loading progress data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const enhancedStats = calculateEnhancedStats();
  const taskTypeStats = getTaskTypeStats();
  const weeklyProgress = getWeeklyProgress();
  const overallProgress = getOverallProgress();
  const pieChartData = getPieChartData();

  return (
    <div className="space-y-4 md:space-y-6 p-2 sm:p-4">
      {/* Error banner */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            <strong className="font-bold">Error: </strong>
            <span className="ml-1">{error}</span>
          </div>
          <span className="block mt-1 text-sm">Using mock data for demonstration</span>
          <button 
            onClick={loadData}
            className="mt-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Retry
          </button>
        </div>
      )}

      {useMockData && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>Using mock data for demonstration purposes</span>
          </div>
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 sm:gap-4">
        <Card className="w-full">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Assigned Tasks</p>
                <p className="text-xl sm:text-2xl font-bold">{enhancedStats.assignedTasks || 0}</p>
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
                <p className="text-xl sm:text-2xl font-bold text-green-600">{enhancedStats.completedTasks || 0}</p>
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
                <p className="text-xl sm:text-2xl font-bold text-yellow-600">{enhancedStats.pendingTasks || 0}</p>
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
                <p className="text-xl sm:text-2xl font-bold text-red-600">{enhancedStats.rejectedTasks || 0}</p>
              </div>
              <XCircle className="h-6 w-6 sm:h-8 sm:w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="w-full">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Overdue</p>
                <p className="text-xl sm:text-2xl font-bold text-purple-600">{enhancedStats.overdueTasks || 0}</p>
              </div>
              <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
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
            <div className="text-xs text-gray-500">
              {enhancedStats.completedTasks} completed out of {enhancedStats.completedTasks + enhancedStats.pendingTasks + enhancedStats.rejectedTasks + enhancedStats.overdueTasks} total tasks
            </div>
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
                  {taskType.overdue > 0 && (
                    <Badge className="bg-purple-100 text-purple-800 text-xs">
                      {taskType.overdue} overdue
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