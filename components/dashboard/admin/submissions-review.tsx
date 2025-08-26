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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
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

interface User {
  _id: string;
  name: string;
  email: string;
}

type SubmissionStatus = "approved" | "rejected" | "pending" | null;

interface Submission {
  _id: string;
  task?: Task;
  student?: User;
  status?: SubmissionStatus;
  feedback?: Feedback;
  notes?: string;
  files?: FileItem[];
  createdAt: string;
}

// Props type
interface SubmissionsProps {
  token: string;
}

export default function Submissions({ token }: SubmissionsProps) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [submissionsPerPage] = useState(5);
  const [feedbackText, setFeedbackText] = useState("");
  const [selectedSubmission, setSelectedSubmission] =
    useState<Submission | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

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

  // Pagination logic
  useEffect(() => {
    const indexOfLastSubmission = currentPage * submissionsPerPage;
    const indexOfFirstSubmission = indexOfLastSubmission - submissionsPerPage;
    setFilteredSubmissions(submissions.slice(indexOfFirstSubmission, indexOfLastSubmission));
  }, [submissions, currentPage, submissionsPerPage]);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(submissions.length / submissionsPerPage); i++) {
    pageNumbers.push(i);
  }

  const handleApproveReject = async (status: "approved" | "rejected") => {
    if (!selectedSubmission) return;

    setIsProcessing(true);

    try {
      const response = await fetch(`/api/submissions/${selectedSubmission._id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
          feedback: feedbackText ? { text: feedbackText } : undefined,
        }),
      });

      if (response.ok) {
        setSelectedSubmission(null);
        setFeedbackText("");
        fetchSubmissions();
        setCurrentPage(1); // Reset to first page after action
      }
    } catch (error) {
      console.error("Error updating submission:", error);
    } finally {
      setIsProcessing(false);
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

  useEffect(() => {
    fetchSubmissions();
  }, []);

  if (loading) {
    return (
      <Card className="w-full max-w-6xl mx-auto mt-4 md:mt-0">
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl">Submissions</CardTitle>
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
          <CardTitle className="text-xl sm:text-2xl">Submissions</CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Review and manage student submissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {filteredSubmissions.map((submission) => {
              const task = submission.task;
              const student = submission.student;
              if (!task || !student) return null;

              const overdue = task.isOverdue || false;

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
                        <div className="mt-2">
                          <p className="text-xs sm:text-sm font-medium">
                            Submitted by: {student.name}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-600">
                            {student.email}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-500 mt-1">
                            Submitted on:{" "}
                            {new Date(submission.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        {task.description && (
                          <p className="mt-2 text-xs sm:text-sm text-gray-700">
                            {task.description}
                          </p>
                        )}

                        {submission.notes && (
                          <div className="mt-3 p-2 sm:p-3 bg-gray-50 rounded-lg">
                            <h4 className="font-medium text-xs sm:text-sm text-gray-900">
                              Student Notes:
                            </h4>
                            <p className="text-xs sm:text-sm text-gray-800 mt-1">
                              {submission.notes}
                            </p>
                          </div>
                        )}

                        {submission.feedback?.text && (
                          <div className="mt-3 p-2 sm:p-3 bg-blue-50 rounded-lg">
                            <h4 className="font-medium text-xs sm:text-sm text-blue-900">
                              Your Feedback:
                            </h4>
                            <p className="text-xs sm:text-sm text-blue-800 mt-1">
                              {submission.feedback.text}
                            </p>
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

                      <div className="flex flex-col items-stretch sm:items-end gap-2">
                        {submission.status === "pending" && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                onClick={() => {
                                  setSelectedSubmission(submission);
                                  setFeedbackText(
                                    submission.feedback?.text || ""
                                  );
                                }}
                                className="text-xs sm:text-sm"
                                size="sm"
                              >
                                <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                Review
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl mx-2 sm:mx-0 h-[90vh] flex flex-col">
                              <DialogHeader className="flex-shrink-0">
                                <DialogTitle className="text-lg sm:text-xl">
                                  Review Submission
                                </DialogTitle>
                                <DialogDescription className="text-sm sm:text-base">
                                  Provide feedback and approve or reject this
                                  submission
                                </DialogDescription>
                              </DialogHeader>
                              <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                                <div>
                                  <h4 className="font-medium text-sm sm:text-base">
                                    Task: {task.title}
                                  </h4>
                                  <p className="text-xs sm:text-sm text-gray-600">
                                    Submitted by: {student.name} ({student.email})
                                  </p>
                                </div>

                                {task.description && (
                                  <div>
                                    <h4 className="font-medium text-xs sm:text-sm">
                                      Task Description:
                                    </h4>
                                    <p className="text-xs sm:text-sm text-gray-700">
                                      {task.description}
                                    </p>
                                  </div>
                                )}

                                {submission.notes && (
                                  <div>
                                    <h4 className="font-medium text-xs sm:text-sm">
                                      Student Notes:
                                    </h4>
                                    <p className="text-xs sm:text-sm text-gray-700">
                                      {submission.notes}
                                    </p>
                                  </div>
                                )}

                                {submission.files && submission.files.length > 0 && (
                                  <div>
                                    <h4 className="font-medium text-xs sm:text-sm">
                                      Submitted Files:
                                    </h4>
                                    <div className="space-y-2 mt-2">
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

                                <div>
                                  <h4 className="font-medium text-xs sm:text-sm mb-2">
                                    Feedback (Optional):
                                  </h4>
                                  <Textarea
                                    value={feedbackText}
                                    onChange={(e) =>
                                      setFeedbackText(e.target.value)
                                    }
                                    placeholder="Provide feedback for the student..."
                                    className="text-xs sm:text-sm"
                                    rows={4}
                                  />
                                </div>
                              </div>
                              <div className="pt-4 border-t flex-shrink-0 flex justify-between">
                                <Button
                                  variant="destructive"
                                  onClick={() => handleApproveReject("rejected")}
                                  disabled={isProcessing}
                                  className="text-xs sm:text-sm"
                                  size="sm"
                                >
                                  {isProcessing ? (
                                    <LoadingSpinner size="sm" />
                                  ) : (
                                    <>
                                      <XCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                      Reject
                                    </>
                                  )}
                                </Button>
                                <Button
                                  onClick={() => handleApproveReject("approved")}
                                  disabled={isProcessing}
                                  className="text-xs sm:text-sm"
                                  size="sm"
                                >
                                  {isProcessing ? (
                                    <LoadingSpinner size="sm" />
                                  ) : (
                                    <>
                                      <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                      Approve
                                    </>
                                  )}
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}

                        {submission.status !== "pending" && (
                          <Badge
                            className={`${getSubmissionBadgeColor(
                              submission.status || null
                            )} text-xs sm:text-sm`}
                          >
                            {submission.status}
                          </Badge>
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
                <p className="text-sm sm:text-base">No submissions yet</p>
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
    </div>
  );
}