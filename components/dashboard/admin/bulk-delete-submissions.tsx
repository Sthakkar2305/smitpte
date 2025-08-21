"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Trash2, Loader2 } from "lucide-react";

interface Submission {
  _id: string;
  student?: { name: string };
  task?: { title: string };
}

interface BulkDeleteSubmissionsProps {
  submissions: Submission[];
  token: string;
  onSuccess: () => void;
}

export function BulkDeleteSubmissions({ submissions, token, onSuccess }: BulkDeleteSubmissionsProps) {
  const [selectedSubmissions, setSelectedSubmissions] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleBulkDelete = async () => {
    if (selectedSubmissions.length === 0) return;

    setIsDeleting(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await fetch('/api/submissions/bulk-delete', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          submissionIds: selectedSubmissions
        }),
      });

      if (response.ok) {
        setSuccess(`Deleted ${selectedSubmissions.length} submission(s) successfully`);
        setSelectedSubmissions([]);
        onSuccess();
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete submissions');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete submissions');
      
      // Clear error message after 5 seconds
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedSubmissions.length === submissions.length) {
      setSelectedSubmissions([]);
    } else {
      setSelectedSubmissions(submissions.map(sub => sub._id));
    }
  };

  const toggleSubmissionSelection = (submissionId: string) => {
    setSelectedSubmissions(prev =>
      prev.includes(submissionId)
        ? prev.filter(id => id !== submissionId)
        : [...prev, submissionId]
    );
  };

  return (
    <div className="space-y-4">
      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Checkbox
            checked={selectedSubmissions.length === submissions.length && submissions.length > 0}
            onCheckedChange={toggleSelectAll}
          />
          <span className="text-sm">
            {selectedSubmissions.length} of {submissions.length} selected
          </span>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              disabled={selectedSubmissions.length === 0}
              size="sm"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Selected
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete {selectedSubmissions.length} submission(s). 
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleBulkDelete}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground"
              >
                {isDeleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="border rounded-lg divide-y">
        {submissions.map((submission) => (
          <div key={submission._id} className="flex items-center space-x-4 p-4">
            <Checkbox
              checked={selectedSubmissions.includes(submission._id)}
              onCheckedChange={() => toggleSubmissionSelection(submission._id)}
            />
            <div className="flex-1">
              <p className="font-medium">
                {submission.student?.name || 'Unknown Student'} - 
                {submission.task?.title || 'Unknown Task'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}