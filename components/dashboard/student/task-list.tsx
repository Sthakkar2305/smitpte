'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Calendar, FileText, Clock, Upload } from 'lucide-react';
import LoadingSpinner from '@/components/ui/loading-spinner';

// Types for your data
interface FileItem {
  originalName: string;
  // other file properties may come here
}

interface Feedback {
  text?: string;
}

interface Task {
  _id: string;
  title: string;
  type: string;
  quantity: number;
  deadline?: string;
  description?: string;
}

type SubmissionStatus = 'approved' | 'rejected' | 'pending' | null;

interface Submission {
  _id: string;
  task?: Task;
  status?: SubmissionStatus;
  feedback?: Feedback;
  notes?: string;
  files?: FileItem[];
}

// Props type
interface TaskListProps {
  token: string;
}

export default function TaskList({ token }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<FileItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const response = await fetch('/api/submissions', {
        headers: {
          Authorization: `Bearer ${token}`,
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setIsUploading(true);
    const uploadPromises = Array.from(files).map(async (file) => {
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });
        if (response.ok) {
          return await response.json();
        }
      } catch (error) {
        console.error('Upload error:', error);
      }
      return null;
    });

    const results = await Promise.all(uploadPromises);
    // Filter out null results and assert type
    const successfulUploads = results.filter((result): result is FileItem => result !== null);
    setUploadedFiles(prev => [...prev, ...successfulUploads]);
    setIsUploading(false);
  };

  const handleSubmission = async (taskId: string) => {
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          taskId,
          notes: submissionNotes,
          files: uploadedFiles,
        }),
      });

      if (response.ok) {
        setSelectedTask(null);
        setSubmissionNotes('');
        setUploadedFiles([]);
        fetchSubmissions();
      }
    } catch (error) {
      console.error('Error submitting task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSubmissionStatus = (taskId: string): SubmissionStatus => {
    const submission = submissions.find(s => s.task?._id === taskId);
    return submission?.status || null;
  };

  const getSubmission = (taskId: string): Submission | undefined => {
    return submissions.find(s => s.task?._id === taskId);
  };

  const getSubmissionBadgeColor = (status: SubmissionStatus) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isTaskOverdue = (deadline?: string) => {
    if (!deadline) return false;
    return new Date(deadline) < new Date();
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    fetchTasks();
    fetchSubmissions();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>My Tasks</CardTitle>
          <CardDescription>
            Complete your assigned tasks and track your progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {tasks.map((task) => {
              const submissionStatus = getSubmissionStatus(task._id);
              const submission = getSubmission(task._id);
              const overdue = isTaskOverdue(task.deadline);

              return (
                <Card key={task._id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{task.title}</h3>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                          <Badge variant="outline">{task.type}</Badge>
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 mr-1" />
                            Qty: {task.quantity}
                          </div>
                          {task.deadline && (
                            <div className={`flex items-center ${overdue ? 'text-red-600' : ''}`}>
                              <Calendar className="h-4 w-4 mr-1" />
                              Due: {new Date(task.deadline).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                        <p className="mt-2 text-gray-700">{task.description}</p>

                        {submission?.feedback?.text && (
                          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                            <h4 className="font-medium text-sm text-blue-900">Teacher Feedback:</h4>
                            <p className="text-sm text-blue-800 mt-1">{submission.feedback.text}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col items-end space-y-2">
                        {submissionStatus && (
                          <Badge className={getSubmissionBadgeColor(submissionStatus)}>
                            {submissionStatus}
                          </Badge>
                        )}

                        {!submissionStatus && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                onClick={() => {
                                  setSelectedTask(task);
                                  setSubmissionNotes('');
                                  setUploadedFiles([]);
                                }}
                              >
                                Submit Work
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Submit Task: {task.title}</DialogTitle>
                                <DialogDescription>
                                  Upload your work and add notes for this task
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="files">Upload Files</Label>
                                  <Input
                                    id="files"
                                    type="file"
                                    multiple
                                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.mp3,.wav"
                                    onChange={handleFileUpload}
                                    className="mt-1"
                                    disabled={isUploading}
                                  />
                                  <p className="text-xs text-gray-500 mt-1">
                                    Supported: Images, Audio, PDF, Word documents
                                  </p>
                                  {isUploading && (
                                    <div className="flex items-center mt-2">
                                      <LoadingSpinner size="sm" />
                                      <span className="ml-2 text-sm">Uploading...</span>
                                    </div>
                                  )}
                                </div>

                                {uploadedFiles.length > 0 && (
                                  <div>
                                    <Label className="text-sm font-medium">Uploaded Files:</Label>
                                    <div className="mt-2 space-y-2">
                                      {uploadedFiles.map((file, index) => (
                                        <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                          <div className="flex items-center">
                                            <FileText className="h-4 w-4 mr-2" />
                                            <span className="text-sm">{file.originalName}</span>
                                          </div>
                                          <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => removeFile(index)}
                                          >
                                            Remove
                                          </Button>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                <div>
                                  <Label htmlFor="notes">Notes (Optional)</Label>
                                  <Textarea
                                    id="notes"
                                    value={submissionNotes}
                                    onChange={(e) => setSubmissionNotes(e.target.value)}
                                    placeholder="Add any notes about your submission..."
                                    className="mt-1"
                                    rows={3}
                                  />
                                </div>

                                <Button
                                  onClick={() => selectedTask && handleSubmission(selectedTask._id)}
                                  className="w-full"
                                  disabled={isSubmitting || uploadedFiles.length === 0}
                                >
                                  {isSubmitting ? (
                                    <LoadingSpinner size="sm" />
                                  ) : (
                                    <>
                                      <Upload className="h-4 w-4 mr-2" />
                                      Submit Task
                                    </>
                                  )}
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {tasks.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Clock className="h-12 w-12 mx-auto mb-4" />
                <p>No tasks assigned yet</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
