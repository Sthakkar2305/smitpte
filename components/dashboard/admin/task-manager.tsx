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
  Users,
  User,
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
  assignToAll: boolean;
  assignedTo: string[];
}

interface PteTaskModule {
  id: string;
  name: string;
  type: string;
}

// Add this array of PTE task modules (expanded with new modules)
const PTE_TASK_MODULES: PteTaskModule[] = [
  // Speaking Tasks
  { id: "read_aloud", name: "Read Aloud", type: "speaking" },
  { id: "repeat_sentence", name: "Repeat Sentence", type: "speaking" },
  { id: "describe_image", name: "Describe Image", type: "speaking" },
  { id: "retell_lecture", name: "Retell Lecture", type: "speaking" },
  {
    id: "summrize_group_decision",
    name: "summrizr group decision",
    type: "speaking",
  },
  { id: "response_to_sitution", name: "Rsponse To Sitution", type: "speaking" },
  {
    id: "answer_short_question",
    name: "Answer Short Question",
    type: "speaking",
  },

  // New Speaking Tasks (August 7 update)
  {
    id: "summarize_group_discussion",
    name: "Summarize Group Discussion",
    type: "speaking",
  },
  {
    id: "respond_to_situation",
    name: "Respond to Situation",
    type: "speaking",
  },

  // Writing Tasks
  {
    id: "summarize_written_text",
    name: "Summarize Written Text",
    type: "writing",
  },
  { id: "write_essay", name: "Write Essay", type: "writing" },

  // Reading Tasks
  {
    id: "reading_multiple_choice_single",
    name: "Reading: Multiple Choice (Single Answer)",
    type: "reading",
  },
  {
    id: "reading_multiple_choice_multiple",
    name: "Reading: Multiple Choice (Multiple Answers)",
    type: "reading",
  },
  { id: "reorder_paragraphs", name: "Reorder Paragraphs", type: "reading" },
  {
    id: "reading_fill_blanks_dropdown",
    name: "Reading: Fill in the Blanks (Drop-down)",
    type: "reading",
  },
  {
    id: "reading_fill_blanks_drag",
    name: "Reading: Fill in the Blanks (Drag & Drop)",
    type: "reading",
  },

  // Listening Tasks
  {
    id: "summarize_spoken_text",
    name: "Summarize Spoken Text",
    type: "listening",
  },
  {
    id: "listening_multiple_choice_single",
    name: "Listening: Multiple Choice (Single Answer)",
    type: "listening",
  },
  {
    id: "listening_multiple_choice_multiple",
    name: "Listening: Multiple Choice (Multiple Answers)",
    type: "listening",
  },
  {
    id: "fill_blanks_listening",
    name: "Fill in the Blanks (Listening)",
    type: "listening",
  },
  {
    id: "highlight_correct_summary",
    name: "Highlight Correct Summary",
    type: "listening",
  },
  { id: "select_missing_word", name: "Select Missing Word", type: "listening" },
  {
    id: "highlight_incorrect_words",
    name: "Highlight Incorrect Words",
    type: "listening",
  },
  {
    id: "write_from_dictation",
    name: "Write From Dictation",
    type: "listening",
  },

  // Section Tests
  {
    id: "speaking_section_test",
    name: "Speaking Section Test",
    type: "section_test",
  },
  {
    id: "writing_section_test",
    name: "Writing Section Test",
    type: "section_test",
  },
  {
    id: "reading_section_test",
    name: "Reading Section Test",
    type: "section_test",
  },
  {
    id: "listening_section_test",
    name: "Listening Section Test",
    type: "section_test",
  },

  // Mock Tests
  { id: "full_mock_test", name: "Full Mock Test", type: "mock_test" },
  { id: "mini_mock_test", name: "Mini Mock Test", type: "mock_test" },
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
  assignedTo?: any[];
  assignToAll?: boolean;
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
  const [students, setStudents] = useState<any[]>([]);

  const [formData, setFormData] = useState<FormData>({
    title: "",
    type: "",
    quantity: "",
    deadline: "",
    description: "",
    selectedModule: "",
    assignToAll: true,
    assignedTo: [],
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

  const fetchStudents = async () => {
    try {
      const response = await fetch("/api/users/students", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setStudents(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  // Pagination logic
  useEffect(() => {
    const indexOfLastTask = currentPage * tasksPerPage;
    const indexOfFirstTask = indexOfLastTask - tasksPerPage;
    setFilteredTasks(tasks.slice(indexOfFirstTask, indexOfLastTask));
  }, [tasks, currentPage, tasksPerPage]);

  useEffect(() => {
    fetchTasks();
    fetchStudents();
  }, []);

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
          assignToAll: formData.assignToAll,
          assignedTo: formData.assignedTo,
        }),
      });

      if (response.ok) {
        setIsCreating(false);
        resetForm();
        fetchTasks();
        setCurrentPage(1);
      } else {
        const errorData = await response.json();
        console.error("Error creating task:", errorData.message);
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
          assignToAll: formData.assignToAll,
          assignedTo: formData.assignedTo,
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
        setCurrentPage(1);
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
      selectedModule: "",
      assignToAll: task.assignToAll || true,
      assignedTo: task.assignedTo
        ? task.assignedTo.map((user: any) => user._id || user)
        : [],
    });
    setIsEditing(true);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      type: "",
      quantity: "",
      deadline: "",
      description: "",
      selectedModule: "",
      assignToAll: true,
      assignedTo: [],
    });
  };

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
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto mx-2 sm:mx-0">
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
                  <SelectContent className="max-h-60 overflow-y-auto">
                    // Replace the problematic SelectItem with:
                    <SelectItem
                      value="placeholder"
                      className="text-xs sm:text-sm"
                      disabled
                    >
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
                    {/* Section Tests */}
                    <SelectGroup>
                      <SelectLabel className="text-xs sm:text-sm font-semibold">
                        Section Tests
                      </SelectLabel>
                      {PTE_TASK_MODULES.filter(
                        (module) => module.type === "section_test"
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
                    {/* Mock Tests */}
                    <SelectGroup>
                      <SelectLabel className="text-xs sm:text-sm font-semibold">
                        Mock Tests
                      </SelectLabel>
                      {PTE_TASK_MODULES.filter(
                        (module) => module.type === "mock_test"
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
                <Label htmlFor="title" className="text-sm sm:text-base">
                  Task Title
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="text-xs sm:text-sm"
                />
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
                    <SelectItem value="speaking" className="text-xs sm:text-sm">
                      Speaking
                    </SelectItem>
                    <SelectItem value="writing" className="text-xs sm:text-sm">
                      Writing
                    </SelectItem>
                    <SelectItem value="reading" className="text-xs sm:text-sm">
                      Reading
                    </SelectItem>
                    <SelectItem
                      value="listening"
                      className="text-xs sm:text-sm"
                    >
                      Listening
                    </SelectItem>
                    <SelectItem
                      value="section_test"
                      className="text-xs sm:text-sm"
                    >
                      Section Test
                    </SelectItem>
                    <SelectItem
                      value="mock_test"
                      className="text-xs sm:text-sm"
                    >
                      Mock Test
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

              <div className="grid gap-2">
                <Label
                  htmlFor="assignToAll"
                  className="text-sm sm:text-base flex items-center"
                >
                  <Input
                    id="assignToAll"
                    type="checkbox"
                    checked={formData.assignToAll}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        assignToAll: e.target.checked,
                      })
                    }
                    className="mr-2"
                  />
                  Assign to all students
                </Label>
              </div>

              {!formData.assignToAll && (
                <div className="grid gap-2">
                  <Label htmlFor="assignedTo" className="text-sm sm:text-base">
                    Assign to specific students
                  </Label>
                  <Select
                    onValueChange={(value) => {
                      if (!formData.assignedTo.includes(value)) {
                        setFormData({
                          ...formData,
                          assignedTo: [...formData.assignedTo, value],
                        });
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select students" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60 overflow-y-auto">
                      {students.map((student) => (
                        <SelectItem key={student._id} value={student._id}>
                          {student.name} ({student.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.assignedTo.map((studentId) => {
                      const student = students.find((s) => s._id === studentId);
                      return (
                        <Badge
                          key={studentId}
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          {student ? student.name : studentId}
                          <button
                            type="button"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                assignedTo: formData.assignedTo.filter(
                                  (id) => id !== studentId
                                ),
                              });
                            }}
                            className="ml-1"
                          >
                            ×
                          </button>
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}
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
                                Due:{" "}
                                {new Date(task.deadline).toLocaleDateString()}
                                {overdue && " (Overdue)"}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center">
                            {task.assignedTo && task.assignedTo.length > 0 ? (
                              <>
                                <User className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                <span>
                                  Assigned to {task.assignedTo.length} student
                                  {task.assignedTo.length !== 1 ? "s" : ""}
                                </span>
                              </>
                            ) : (
                              <>
                                <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                <span>Assigned to all students</span>
                              </>
                            )}
                          </div>
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
                  onClick={() =>
                    paginate(Math.min(pageNumbers.length, currentPage + 1))
                  }
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto mx-2 sm:mx-0">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Edit Task</DialogTitle>
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
                  <SelectItem value="speaking" className="text-xs sm:text-sm">
                    Speaking
                  </SelectItem>
                  <SelectItem value="writing" className="text-xs sm:text-sm">
                    Writing
                  </SelectItem>
                  <SelectItem value="reading" className="text-xs sm:text-sm">
                    Reading
                  </SelectItem>
                  <SelectItem value="listening" className="text-xs sm:text-sm">
                    Listening
                  </SelectItem>
                  <SelectItem
                    value="section_test"
                    className="text-xs sm:text-sm"
                  >
                    Section Test
                  </SelectItem>
                  <SelectItem value="mock_test" className="text-xs sm:text-sm">
                    Mock Test
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
              <Label
                htmlFor="edit-description"
                className="text-sm sm:text-base"
              >
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

            <div className="grid gap-2">
              <Label
                htmlFor="edit-assignToAll"
                className="text-sm sm:text-base flex items-center"
              >
                <Input
                  id="edit-assignToAll"
                  type="checkbox"
                  checked={formData.assignToAll}
                  onChange={(e) =>
                    setFormData({ ...formData, assignToAll: e.target.checked })
                  }
                  className="mr-2"
                />
                Assign to all students
              </Label>
            </div>

            {!formData.assignToAll && (
              <div className="grid gap-2">
                <Label
                  htmlFor="edit-assignedTo"
                  className="text-sm sm:text-base"
                >
                  Assign to specific students
                </Label>
                <Select
                  onValueChange={(value) => {
                    if (!formData.assignedTo.includes(value)) {
                      setFormData({
                        ...formData,
                        assignedTo: [...formData.assignedTo, value],
                      });
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select students" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 overflow-y-auto">
                    {students.map((student) => (
                      <SelectItem key={student._id} value={student._id}>
                        {student.name} ({student.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.assignedTo.map((studentId) => {
                    const student = students.find((s) => s._id === studentId);
                    return (
                      <Badge
                        key={studentId}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {student ? student.name : studentId}
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              assignedTo: formData.assignedTo.filter(
                                (id) => id !== studentId
                              ),
                            });
                          }}
                          className="ml-1"
                        >
                          ×
                        </button>
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}
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
