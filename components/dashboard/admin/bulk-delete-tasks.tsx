"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Trash2, Loader2 } from "lucide-react";

interface Task {
  _id: string;
  title: string;
}

interface BulkDeleteTasksProps {
  tasks: Task[];
  token: string;
  onSuccess: () => void;
}

export function BulkDeleteTasks({ tasks, token, onSuccess }: BulkDeleteTasksProps) {
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [deleteSubmissions, setDeleteSubmissions] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleBulkDelete = async () => {
    if (selectedTasks.length === 0) return;

    setIsDeleting(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await fetch('/api/tasks/bulk-delete', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          taskIds: selectedTasks,
          deleteSubmissions
        }),
      });

      if (response.ok) {
        setSuccess(`Deleted ${selectedTasks.length} task(s) successfully`);
        setSelectedTasks([]);
        setDeleteSubmissions(false);
        onSuccess();
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete tasks');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete tasks');
      
      // Clear error message after 5 seconds
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedTasks.length === tasks.length) {
      setSelectedTasks([]);
    } else {
      setSelectedTasks(tasks.map(task => task._id));
    }
  };

  const toggleTaskSelection = (taskId: string) => {
    setSelectedTasks(prev =>
      prev.includes(taskId)
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
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
            checked={selectedTasks.length === tasks.length && tasks.length > 0}
            onCheckedChange={toggleSelectAll}
          />
          <span className="text-sm">
            {selectedTasks.length} of {tasks.length} selected
          </span>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              disabled={selectedTasks.length === 0}
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
                This will delete {selectedTasks.length} task(s). 
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="delete-submissions"
                  checked={deleteSubmissions}
                  onCheckedChange={(checked) => setDeleteSubmissions(checked === true)}
                />
                <label htmlFor="delete-submissions" className="text-sm">
                  Also delete all submissions for these tasks
                </label>
              </div>
            </div>
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
        {tasks.map((task) => (
          <div key={task._id} className="flex items-center space-x-4 p-4">
            <Checkbox
              checked={selectedTasks.includes(task._id)}
              onCheckedChange={() => toggleTaskSelection(task._id)}
            />
            <div className="flex-1">
              <p className="font-medium">{task.title}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}