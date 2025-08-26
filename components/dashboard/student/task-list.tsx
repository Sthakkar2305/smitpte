"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Calendar,
  FileText,
  Clock,
  Upload,
  X,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import LoadingSpinner from "@/components/ui/loading-spinner";

// Types for your data
interface FileItem {
  originalName: string;
  url: string;
  publicId?: string;
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
  isOverdue?: boolean;
}

type SubmissionStatus = "approved" | "rejected" | "pending" | null;

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
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [submissionNotes, setSubmissionNotes] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<FileItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [tasksPerPage] = useState(5);

  const fetchTasks = async () => {
    try {
      const response = await fetch("/api/tasks", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        const tasksArray = Array.isArray(data) ? data : [];
        setAllTasks(tasksArray);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setAllTasks([]);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const response = await fetch("/api/submissions", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setSubmissions(data.submissions || []);
      }
    } catch (error) {
      console.error("Error fetching submissions:", error);
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  const getSubmissionStatus = (taskId: string): SubmissionStatus => {
    if (!Array.isArray(submissions)) {
      return null;
    }
    const submission = submissions.find((s) => s.task?._id === taskId);
    return submission?.status || null;
  };

  // Effect to fetch initial data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchTasks(), fetchSubmissions()]);
    };
    loadData();
  }, []);

  // Effect to filter tasks based on submissions
  useEffect(() => {
    if (allTasks.length > 0) {
      const filtered = allTasks.filter(task => {
        const submission = submissions.find(s => s.task?._id === task._id);
        if (!submission) {
          // Keep tasks with no submission
          return true;
        }
        // Exclude tasks with approved, rejected, or pending submissions
        return false;
      });
      setTasks(filtered);
      setCurrentPage(1); // Reset to the first page when the task list changes
    }
  }, [allTasks, submissions]);

  // Pagination logic
  useEffect(() => {
    const indexOfLastTask = currentPage * tasksPerPage;
    const indexOfFirstTask = indexOfLastTask - tasksPerPage;
    setFilteredTasks(tasks.slice(indexOfFirstTask, indexOfLastTask));
  }, [tasks, currentPage, tasksPerPage]);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(tasks.length / tasksPerPage); i++) {
    pageNumbers.push(i);
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setIsUploading(true);

    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append("file", file);
    });

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        const newFiles = result.map((file: any) => ({
          originalName: file.originalName,
          url: file.url,
          publicId: file.publicId,
        }));

        setUploadedFiles((prev) => [...prev, ...newFiles]);
      }
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleSubmission = async (taskId: string) => {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          taskId,
          notes: submissionNotes,
          files: uploadedFiles,
        }),
      });

      if (response.ok) {
        setSelectedTask(null);
        setSubmissionNotes("");
        setUploadedFiles([]);
        fetchSubmissions();
        fetchTasks();
        setCurrentPage(1); // Reset to first page after submission
      } else {
        const errorData = await response.json();
        if (errorData.status === "rejected") {
          alert("Deadline has passed. Submission rejected.");
          fetchSubmissions();
          fetchTasks();
        }
      }
    } catch (error) {
      console.error("Error submitting task:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSubmission = (taskId: string): Submission | undefined => {
    return submissions.find((s) => s.task?._id === taskId);
  };

  const getSubmissionBadgeColor = (status: SubmissionStatus) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const canSubmitTask = (task: Task) => {
    if (!task.deadline) return true;
    return new Date(task.deadline) >= new Date();
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleViewFeedback = (feedbackText: string) => {
    setSelectedFeedback(feedbackText);
    setFeedbackDialogOpen(true);
  };

  if (loading) {
    return (
      <Card className="w-full max-w-6xl mx-auto mt-4 md:mt-0">
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl">My Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto px-2 sm:px-4 mt-4 md:mt-0">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl">My Tasks</CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Complete your assigned tasks and track your progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {filteredTasks.map((task) => {
              const submissionStatus = getSubmissionStatus(task._id);
              const submission = getSubmission(task._id);
              const overdue = task.isOverdue || false;
              const feedbackText = submission?.feedback?.text || "";

              return (
                <Card
                  key={task._id}
                  className={`border-l-4 ${
                    overdue ? "border-l-red-500" : "border-l-blue-500"
                  }`}
                >
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base sm:text-lg">
                          {task.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 mt-2 text-xs sm:text-sm text-gray-600">
                          <Badge variant="outline" className="text-xs">
                            {task.type}
                          </Badge>
                          <div className="flex items-center">
                            <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            Qty: {task.quantity}
                          </div>
                          {task.deadline && (
                            <div
                              className={`flex items-center ${
                                overdue ? "text-red-600 font-medium" : ""
                              }`}
                            >
                              <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                              <span className="whitespace-nowrap">
                                Due: {new Date(task.deadline).toLocaleDateString()}
                                {overdue && " (Overdue)"}
                              </span>
                            </div>
                          )}
                        </div>
                        {task.description && (
                          <p className="mt-2 text-xs sm:text-sm text-gray-700 line-clamp-2">
                            {task.description}
                          </p>
                        )}
                        {feedbackText && (
                          <div className="mt-3 p-2 sm:p-3 bg-blue-50 rounded-lg">
                            <h4 className="font-medium text-xs sm:text-sm text-blue-900">
                              Teacher Feedback:
                            </h4>
                            <p className="text-xs sm:text-sm text-blue-800 mt-1 line-clamp-2">
                              {feedbackText}
                            </p>
                            {feedbackText.length > 60 && (
                              <Button
                                variant="link"
                                className="p-0 h-auto text-xs text-blue-600 mt-1"
                                onClick={() => handleViewFeedback(feedbackText)}
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                View full feedback
                              </Button>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col items-stretch sm:items-end gap-2">
                        {submissionStatus && (
                          <Badge
                            className={`${getSubmissionBadgeColor(
                              submissionStatus
                            )} text-xs sm:text-sm`}
                          >
                            {submissionStatus}
                          </Badge>
                        )}

                        {!submissionStatus && canSubmitTask(task) && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                onClick={() => {
                                  setSelectedTask(task);
                                  setSubmissionNotes("");
                                  setUploadedFiles([]);
                                }}
                                className="text-xs sm:text-sm"
                                size="sm"
                              >
                                Submit Work
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl mx-2 sm:mx-0 h-[90vh] flex flex-col">
                              <DialogHeader className="flex-shrink-0">
                                <DialogTitle className="text-lg sm:text-xl">
                                  Submit Task: {task.title}
                                </DialogTitle>
                                <DialogDescription className="text-sm sm:text-base">
                                  Upload your work and add notes for this task
                                </DialogDescription>
                              </DialogHeader>
                              <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                                <div>
                                  <Label
                                    htmlFor="files"
                                    className="text-sm sm:text-base"
                                  >
                                    Upload Files
                                  </Label>
                                  <div className="relative mt-1">
                                    <Input
                                      id="files"
                                      type="file"
                                      multiple
                                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.mp3,.wav"
                                      onChange={handleFileUpload}
                                      className="text-xs sm:text-sm"
                                      disabled={isUploading}
                                    />
                                  </div>
                                  <p className="text-xs text-gray-500 mt-1">
                                    Supported: Images, Audio, PDF, Word documents
                                  </p>
                                  {isUploading && (
                                    <div className="flex items-center mt-2">
                                      <LoadingSpinner size="sm" />
                                      <span className="ml-2 text-xs sm:text-sm">
                                        Uploading...
                                      </span>
                                    </div>
                                  )}
                                </div>
                                {uploadedFiles.length > 0 && (
                                  <div>
                                    <Label className="text-xs sm:text-sm font-medium">
                                      Uploaded Files:
                                    </Label>
                                    <div className="mt-2 space-y-2 max-h-40 overflow-auto">
                                      {uploadedFiles.map((file, index) => (
                                        <div
                                          key={index}
                                          className="flex items-center justify-between bg-gray-50 p-2 rounded"
                                        >
                                          <div className="flex items-center min-w-0 overflow-auto">
                                            <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
                                            <a
                                              href={file.url}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="text-xs sm:text-sm text-blue-600 underline whitespace-nowrap"
                                            >
                                              {file.originalName}
                                            </a>
                                          </div>
                                          <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => removeFile(index)}
                                            className="h-6 w-6 p-0 ml-2 flex-shrink-0"
                                          >
                                            <X className="h-3 w-3" />
                                          </Button>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                <div>
                                  <Label
                                    htmlFor="notes"
                                    className="text-sm sm:text-base"
                                  >
                                    Notes (Optional)
                                  </Label>
                                  <Textarea
                                    id="notes"
                                    value={submissionNotes}
                                    onChange={(e) =>
                                      setSubmissionNotes(e.target.value)
                                    }
                                    placeholder="Add any notes about your submission..."
                                    className="mt-1 text-xs sm:text-sm"
                                    rows={3}
                                  />
                                </div>
                              </div>
                              <div className="pt-4 border-t flex-shrink-0">
                                <Button
                                  onClick={() =>
                                    selectedTask &&
                                    handleSubmission(selectedTask._id)
                                  }
                                  className="w-full text-xs sm:text-sm"
                                  disabled={
                                    isSubmitting || uploadedFiles.length === 0
                                  }
                                  size="sm"
                                >
                                  {isSubmitting ? (
                                    <LoadingSpinner size="sm" />
                                  ) : (
                                    <>
                                      <Upload className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                      Submit Task
                                    </>
                                  )}
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}

                        {!submissionStatus && !canSubmitTask(task) && (
                          <Badge className="bg-red-100 text-red-800 text-xs sm:text-sm">
                            Deadline Passed
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {tasks.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Clock className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-4" />
                <p className="text-sm sm:text-base">No tasks assigned yet</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {pageNumbers.length > 1 && (
            <div className="flex justify-center mt-6">
              <nav className="flex items-center space-x-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => paginate(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                {pageNumbers.map((number) => (
                  <Button
                    key={number}
                    variant={currentPage === number ? "default" : "outline"}
                    size="sm"
                    onClick={() => paginate(number)}
                    className="h-8 w-8 p-0"
                  >
                    {number}
                  </Button>
                ))}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => paginate(Math.min(pageNumbers.length, currentPage + 1))}
                  disabled={currentPage === pageNumbers.length}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </nav>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Feedback Dialog */}
      <Dialog open={feedbackDialogOpen} onOpenChange={setFeedbackDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Teacher Feedback</DialogTitle>
            <DialogDescription>
              Detailed feedback from your teacher
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-800 whitespace-pre-wrap">
              {selectedFeedback}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}