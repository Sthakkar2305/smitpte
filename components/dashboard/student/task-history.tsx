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
import { Calendar, FileText, Clock, Eye } from "lucide-react";
import LoadingSpinner from "@/components/ui/loading-spinner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
interface TaskHistoryProps {
  token: string;
}

export default function TaskHistory({ token }: TaskHistoryProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState("");

  // In your TaskHistory component
  const fetchSubmissions = async (page = 1) => {
    try {
      const response = await fetch(
        `/api/submissions/history?page=${page}&limit=10`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setSubmissions(data.submissions || []);
        setTotalPages(data.totalPages || 1);
      }
    } catch (error) {
      console.error("Error fetching submission history:", error);
    } finally {
      setLoading(false);
    }
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

  const handleViewFeedback = (feedbackText: string) => {
    setSelectedFeedback(feedbackText);
    setFeedbackDialogOpen(true);
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Button
          key={i}
          variant={currentPage === i ? "default" : "outline"}
          size="sm"
          onClick={() => {
            setCurrentPage(i);
            fetchSubmissions(i);
          }}
          className="h-8 w-8 p-0"
        >
          {i}
        </Button>
      );
    }

    return (
      <div className="flex justify-center items-center space-x-2 mt-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (currentPage > 1) {
              setCurrentPage(currentPage - 1);
              fetchSubmissions(currentPage - 1);
            }
          }}
          disabled={currentPage === 1}
        >
          Previous
        </Button>

        {startPage > 1 && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setCurrentPage(1);
                fetchSubmissions(1);
              }}
              className="h-8 w-8 p-0"
            >
              1
            </Button>
            {startPage > 2 && <span className="px-2">...</span>}
          </>
        )}

        {pages}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="px-2">...</span>}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setCurrentPage(totalPages);
                fetchSubmissions(totalPages);
              }}
              className="h-8 w-8 p-0"
            >
              {totalPages}
            </Button>
          </>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (currentPage < totalPages) {
              setCurrentPage(currentPage + 1);
              fetchSubmissions(currentPage + 1);
            }
          }}
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
      </div>
    );
  };

  useEffect(() => {
    fetchSubmissions(currentPage);
  }, []);

  if (loading) {
    return (
      <Card className="w-full max-w-6xl mx-auto">
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl">Task History</CardTitle>
        </CardHeader>
        <CardContent>
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto px-2 sm:px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl">Task History</CardTitle>
          <CardDescription className="text-sm sm:text-base">
            View your past task submissions and their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {submissions.map((submission) => {
              const task = submission.task;
              if (!task) return null;

              const overdue = task.isOverdue || false;
              const feedbackText = submission.feedback?.text || "";

              return (
                <Card
                  key={submission._id}
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
                                Due:{" "}
                                {new Date(task.deadline).toLocaleDateString()}
                                {overdue && " (Overdue)"}
                              </span>
                            </div>
                          )}
                          <Badge
                            className={`${getSubmissionBadgeColor(
                              submission.status || null
                            )} text-xs sm:text-sm`}
                          >
                            {submission.status}
                          </Badge>
                        </div>
                        {task.description && (
                          <p className="mt-2 text-xs sm:text-sm text-gray-700">
                            {task.description}
                          </p>
                        )}

                        {submission.notes && (
                          <div className="mt-3 p-2 sm:p-3 bg-gray-50 rounded-lg">
                            <h4 className="font-medium text-xs sm:text-sm text-gray-900">
                              Your Notes:
                            </h4>
                            <p className="text-xs sm:text-sm text-gray-800 mt-1">
                              {submission.notes}
                            </p>
                          </div>
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

                        {submission.files && submission.files.length > 0 && (
                          <div className="mt-3">
                            <h4 className="font-medium text-xs sm:text-sm text-gray-900 mb-2">
                              Submitted Files:
                            </h4>
                            <div className="space-y-2">
                              {submission.files.map((file, index) => (
                                <div
                                  key={index}
                                  className="flex items-center bg-gray-50 p-2 rounded"
                                >
                                  <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
                                  <a
                                    href={file.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs sm:text-sm text-blue-600 underline whitespace-nowrap truncate"
                                  >
                                    {file.originalName}
                                  </a>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {submissions.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Clock className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-4" />
                <p className="text-sm sm:text-base">
                  No submission history yet
                </p>
              </div>
            )}
          </div>

          {renderPagination()}
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
