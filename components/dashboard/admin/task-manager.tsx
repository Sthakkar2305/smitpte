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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Plus,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { SelectGroup, SelectLabel } from "@/components/ui/select";

// Add this interface for PTE task modules
interface FormData {
  title: string;
  type: string;
  quantity: string;
  deadline: string;
  description: string;
  selectedModule: string;
}

interface PteTaskModule {
  id: string;
  name: string;
  type: string;
}

// Add this array of PTE task modules (you can expand this list)
const PTE_TASK_MODULES: PteTaskModule[] = [
  // Speaking Tasks
  { id: "read_aloud", name: "Read Aloud", type: "speaking" },
  { id: "repeat_sentence", name: "Repeat Sentence", type: "speaking" },
  { id: "describe_image", name: "Describe Image", type: "speaking" },
  { id: "retell_lecture", name: "Retell Lecture", type: "speaking" },
  { id: "answer_short_question", name: "Answer Short Question", type: "speaking" },

  // Writing Tasks
  { id: "summarize_written_text", name: "Summarize Written Text", type: "writing" },
  { id: "write_essay", name: "Write Essay", type: "writing" },

  // Reading Tasks
  { id: "reading_multiple_choice", name: "Reading: Multiple Choice", type: "reading" },
  { id: "reorder_paragraphs", name: "Reorder Paragraphs", type: "reading" },
  { id: "reading_fill_blanks", name: "Reading: Fill in the Blanks", type: "reading" },

  // Listening Tasks
  { id: "summarize_spoken_text", name: "Summarize Spoken Text", type: "listening" },
  { id: "listening_multiple_choice", name: "Listening: Multiple Choice", type: "listening" },
  { id: "fill_blanks_listening", name: "Fill in the Blanks (Listening)", type: "listening" },
  { id: "highlight_correct_summary", name: "Highlight Correct Summary", type: "listening" },
  { id: "select_missing_word", name: "Select Missing Word", type: "listening" },
  { id: "highlight_incorrect_words", name: "Highlight Incorrect Words", type: "listening" },
  { id: "write_from_dictation", name: "Write From Dictation", type: "listening" },
];

// Types for your data
interface Task {
  _id: string;
  title: string;
  type: string;
  quantity: number;
  deadline?: string;
  description?: string;
  isOverdue?: boolean;
}

// Props type
interface TaskManagerProps {
  token: string;
}

export default function TaskManager({ token }: TaskManagerProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [tasksPerPage] = useState(5);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // FIX: Update the formData state to include the 'selectedModule' property
  // and initialize with a non-empty string for the Select component.
  const [formData, setFormData] = useState<FormData>({
    title: "",
    type: "",
    quantity: "",
    deadline: "",
    description: "",
    selectedModule: "", // This is the fix to align with the interface.
  });

  const fetchTasks = async () => {
    try {
      const response = await fetch("/api/tasks", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setTasks(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

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

  const handleCreateTask = async () => {
    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title,
          type: formData.type,
          quantity: parseInt(formData.quantity),
          deadline: formData.deadline || undefined,
          description: formData.description || undefined,
        }),
      });

      if (response.ok) {
        setIsCreating(false);
        resetForm();
        fetchTasks();
        setCurrentPage(1); // Reset to first page after creating a task
      }
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  const handleUpdateTask = async () => {
    if (!editingTask) return;

    try {
      const response = await fetch(`/api/tasks/${editingTask._id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title,
          type: formData.type,
          quantity: parseInt(formData.quantity),
          deadline: formData.deadline || undefined,
          description: formData.description || undefined,
        }),
      });

      if (response.ok) {
        setIsEditing(false);
        setEditingTask(null);
        resetForm();
        fetchTasks();
      }
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchTasks();
        setCurrentPage(1); // Reset to first page after deleting a task
      }
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const openEditDialog = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      type: task.type,
      quantity: task.quantity.toString(),
      deadline: task.deadline || "",
      description: task.description || "",
      selectedModule: "", // Correctly set a value here, even if not used in the UI
    });
    setIsEditing(true);
  };
  
  // FIX: Update the resetForm function to include 'selectedModule'
  const resetForm = () => {
    setFormData({
      title: "",
      type: "",
      quantity: "",
      deadline: "",
      description: "",
      selectedModule: "",
    });
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  if (loading) {
    return (
      <Card className="w-full max-w-6xl mx-auto mt-4 md:mt-0">
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl">Task Manager</CardTitle>
        </CardHeader>
        <CardContent>
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto px-2 sm:px-4 mt-4 md:mt-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Task Manager</h2>
          <p className="text-sm sm:text-base text-gray-600">
            Create and manage tasks for students
          </p>
        </div>
        <Dialog
          open={isCreating}
          onOpenChange={(open) => {
            setIsCreating(open);
            if (!open) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button className="text-xs sm:text-sm">
              <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Create Task
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl mx-2 sm:mx-0">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">
                Create New Task
              </DialogTitle>
              <DialogDescription className="text-sm sm:text-base">
                Fill in the details to create a new task for students
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="module" className="text-sm sm:text-base">
                  PTE Task Module
                </Label>
                <Select
                  value={formData.selectedModule}
                  onValueChange={(value) => {
                    const selectedModule = PTE_TASK_MODULES.find(
                      (module) => module.id === value
                    );
                    if (selectedModule) {
                      setFormData({
                        ...formData,
                        selectedModule: value,
                        title: selectedModule.name,
                        type: selectedModule.type,
                      });
                    } else {
                      setFormData({
                        ...formData,
                        selectedModule: value,
                      });
                    }
                  }}
                >
                  <SelectTrigger className="text-xs sm:text-sm">
                    <SelectValue placeholder="Select PTE task module" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* FIX: Changed value from empty string to "placeholder" */}
                    <SelectItem value="placeholder" className="text-xs sm:text-sm" disabled>
                      Select a module
                    </SelectItem>

                    {/* Speaking Tasks */}
                    <SelectGroup>
                      <SelectLabel className="text-xs sm:text-sm font-semibold">
                        Speaking Tasks
                      </SelectLabel>
                      {PTE_TASK_MODULES.filter(
                        (module) => module.type === "speaking"
                      ).map((module) => (
                        <SelectItem
                          key={module.id}
                          value={module.id}
                          className="text-xs sm:text-sm"
                        >
                          {module.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>

                    {/* Writing Tasks */}
                    <SelectGroup>
                      <SelectLabel className="text-xs sm:text-sm font-semibold">
                        Writing Tasks
                      </SelectLabel>
                      {PTE_TASK_MODULES.filter(
                        (module) => module.type === "writing"
                      ).map((module) => (
                        <SelectItem
                          key={module.id}
                          value={module.id}
                          className="text-xs sm:text-sm"
                        >
                          {module.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>

                    {/* Reading Tasks */}
                    <SelectGroup>
                      <SelectLabel className="text-xs sm:text-sm font-semibold">
                        Reading Tasks
                      </SelectLabel>
                      {PTE_TASK_MODULES.filter(
                        (module) => module.type === "reading"
                      ).map((module) => (
                        <SelectItem
                          key={module.id}
                          value={module.id}
                          className="text-xs sm:text-sm"
                        >
                          {module.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>

                    {/* Listening Tasks */}
                    <SelectGroup>
                      <SelectLabel className="text-xs sm:text-sm font-semibold">
                        Listening Tasks
                      </SelectLabel>
                      {PTE_TASK_MODULES.filter(
                        (module) => module.type === "listening"
                      ).map((module) => (
                        <SelectItem
                          key={module.id}
                          value={module.id}
                          className="text-xs sm:text-sm"
                        >
                          {module.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="type" className="text-sm sm:text-base">
                  Task Type
                </Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger className="text-xs sm:text-sm">
                    <SelectValue placeholder="Select task type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reading" className="text-xs sm:text-sm">
                      Reading
                    </SelectItem>
                    <SelectItem value="writing" className="text-xs sm:text-sm">
                      Writing
                    </SelectItem>
                    <SelectItem value="listening" className="text-xs sm:text-sm">
                      Listening
                    </SelectItem>
                    <SelectItem value="speaking" className="text-xs sm:text-sm">
                      Speaking
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="quantity" className="text-sm sm:text-base">
                  Quantity
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({ ...formData, quantity: e.target.value })
                  }
                  className="text-xs sm:text-sm"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="deadline" className="text-sm sm:text-base">
                  Deadline (Optional)
                </Label>
                <Input
                  id="deadline"
                  type="datetime-local"
                  value={formData.deadline}
                  onChange={(e) =>
                    setFormData({ ...formData, deadline: e.target.value })
                  }
                  className="text-xs sm:text-sm"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description" className="text-sm sm:text-base">
                  Description (Optional)
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="text-xs sm:text-sm"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsCreating(false)}
                className="text-xs sm:text-sm"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateTask}
                disabled={
                  !formData.title || !formData.type || !formData.quantity
                }
                className="text-xs sm:text-sm"
              >
                Create Task
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-3 sm:p-6">
          <div className="grid gap-4">
            {filteredTasks.map((task) => {
              const overdue = task.isOverdue || false;

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
                          <p className="mt-2 text-xs sm:text-sm text-gray-700">
                            {task.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(task)}
                          className="text-xs sm:text-sm"
                        >
                          <Edit className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteTask(task._id)}
                          className="text-xs sm:text-sm"
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {tasks.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Clock className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-4" />
                <p className="text-sm sm:text-base">No tasks created yet</p>
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

      {/* Edit Task Dialog */}
      <Dialog
        open={isEditing}
        onOpenChange={(open) => {
          setIsEditing(open);
          if (!open) {
            setEditingTask(null);
            resetForm();
          }
        }}
      >
        <DialogContent className="max-w-2xl mx-2 sm:mx-0">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">
              Edit Task
            </DialogTitle>
            <DialogDescription className="text-sm sm:text-base">
              Update the task details
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-title" className="text-sm sm:text-base">
                Task Title
              </Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="text-xs sm:text-sm"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-type" className="text-sm sm:text-base">
                Task Type
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger className="text-xs sm:text-sm">
                  <SelectValue placeholder="Select task type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="reading" className="text-xs sm:text-sm">
                    Reading
                  </SelectItem>
                  <SelectItem value="writing" className="text-xs sm:text-sm">
                    Writing
                  </SelectItem>
                  <SelectItem value="listening" className="text-xs sm:text-sm">
                    Listening
                  </SelectItem>
                  <SelectItem value="speaking" className="text-xs sm:text-sm">
                    Speaking
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-quantity" className="text-sm sm:text-base">
                Quantity
              </Label>
              <Input
                id="edit-quantity"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: e.target.value })
                }
                className="text-xs sm:text-sm"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-deadline" className="text-sm sm:text-base">
                Deadline (Optional)
              </Label>
              <Input
                id="edit-deadline"
                type="datetime-local"
                value={formData.deadline}
                onChange={(e) =>
                  setFormData({ ...formData, deadline: e.target.value })
                }
                className="text-xs sm:text-sm"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description" className="text-sm sm:text-base">
                Description (Optional)
              </Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="text-xs sm:text-sm"
                rows={3}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsEditing(false);
                setEditingTask(null);
                resetForm();
              }}
              className="text-xs sm:text-sm"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateTask}
              disabled={!formData.title || !formData.type || !formData.quantity}
              className="text-xs sm:text-sm"
            >
              Update Task
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}