'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Eye, CheckCircle, XCircle, FileText } from 'lucide-react';
import LoadingSpinner from '@/components/ui/loading-spinner';

// ---- Define Types ----
interface SubmissionFile {
  originalName: string;
  path: string;
  [key: string]: any;
}
interface SubmissionFeedback {
  text?: string;
}
interface SubmissionTask {
  title?: string;
  description?: string;
  type?: string;
}
interface SubmissionStudent {
  name?: string;
}
interface Submission {
  _id: string;
  student?: SubmissionStudent;
  task?: SubmissionTask;
  notes?: string;
  files?: SubmissionFile[];
  status: string;
  submittedAt: string;
  feedback?: SubmissionFeedback;
}
interface SubmissionsReviewProps {
  token: string;
}

export default function SubmissionsReview({ token }: SubmissionsReviewProps) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [feedback, setFeedback] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

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

  const updateSubmissionStatus = async (submissionId: string, status: string, feedbackText: string) => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/submissions/${submissionId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          feedbackText
        }),
      });
      if (response.ok) {
        fetchSubmissions();
        setSelectedSubmission(null);
        setFeedback('');
      }
    } catch (error) {
      console.error('Error updating submission:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
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

  useEffect(() => {
    fetchSubmissions();
    // eslint-disable-next-line
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Submissions Review</CardTitle>
          <CardDescription>
            Review and provide feedback on student submissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <LoadingSpinner />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Task</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((submission) => (
                  <TableRow key={submission._id}>
                    <TableCell className="font-medium">
                      {submission.student?.name || 'Unknown Student'}
                    </TableCell>
                    <TableCell>{submission.task?.title || 'Unknown Task'}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{submission.task?.type || 'Unknown'}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadgeColor(submission.status)}>
                        {submission.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(submission.submittedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedSubmission(submission);
                              setFeedback(submission.feedback?.text || '');
                            }}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Review
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Review Submission</DialogTitle>
                            <DialogDescription>
                              Task: {submission.task?.title} by {submission.student?.name}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-medium mb-2">Task Details:</h4>
                              <p className="text-sm text-gray-600">{submission.task?.description}</p>
                            </div>

                            {submission.notes && (
                              <div>
                                <h4 className="font-medium mb-2">Student Notes:</h4>
                                <p className="text-sm bg-gray-50 p-3 rounded">{submission.notes}</p>
                              </div>
                            )}

                            {submission.files && submission.files.length > 0 && (
                              <div>
                                <h4 className="font-medium mb-2">Submitted Files:</h4>
                                <div className="space-y-2">
                                  {submission.files.map((file, index) => (
                                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                      <div className="flex items-center">
                                        <FileText className="h-4 w-4 mr-2" />
                                        <span className="text-sm">{file.originalName}</span>
                                      </div>
                                      <Button variant="outline" size="sm" asChild>
                                        <a href={file.path} target="_blank" rel="noopener noreferrer">
                                          View
                                        </a>
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div>
                              <h4 className="font-medium mb-2">Feedback:</h4>
                              <Textarea
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                placeholder="Provide feedback to the student..."
                                rows={4}
                              />
                            </div>

                            <div className="flex space-x-2">
                              <Button
                                onClick={() => selectedSubmission && updateSubmissionStatus(selectedSubmission._id, 'approved', feedback)}
                                disabled={isUpdating}
                                className="flex-1"
                              >
                                {isUpdating ? <LoadingSpinner size="sm" /> : (
                                  <>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Approve
                                  </>
                                )}
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={() => selectedSubmission && updateSubmissionStatus(selectedSubmission._id, 'rejected', feedback)}
                                disabled={isUpdating}
                                className="flex-1"
                              >
                                {isUpdating ? <LoadingSpinner size="sm" /> : (
                                  <>
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Reject
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {submissions.length === 0 && !loading && (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4" />
              <p>No submissions found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
