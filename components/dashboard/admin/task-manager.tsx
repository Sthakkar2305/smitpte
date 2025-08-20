'use client';

import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Plus, Calendar, Users, FileText, Edit, Trash2 } from 'lucide-react';
import LoadingSpinner from '@/components/ui/loading-spinner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const TASK_TYPES = [
  'Personal Introduction',
  'Read Aloud',
  'Repeat Sentence',
  'Describe Image',
  'Retell Lecture',
  'Answer Short Question',
  'Summarize Written Text',
  'Essay',
  'Multiple Choice, Choose Single Answer',
  'Multiple Choice, Choose Multiple Answers',
  'Re-order Paragraphs',
  'Reading Fill in the Blanks',
  'Reading & Writing Fill in the Blanks',
  'Summarize Spoken Text',
  'Multiple Choice, Choose Multiple Answers (Listening)',
  'Fill in the Blanks (Listening)',
  'Highlight Correct Summary',
  'Multiple Choice, Choose Single Answer (Listening)',
  'Select Missing Word',
  'Highlight Incorrect Words',
  'Write from Dictation'
];

interface Student {
  _id: string;
  name: string;
  email: string;
  isActive: boolean;
}

interface Task {
  _id: string;
  title: string;
  type: string;
  description: string;
  quantity: number;
  deadline?: string;
  assignedTo: Array<Student | string>;
  assignToAll?: boolean;
  createdAt: string;
}

interface TaskFormData {
  title: string;
  type: string;
  description: string;
  quantity: number;
  deadline: string;
  assignedTo: string[];
  assignToAll: boolean;
}

interface TaskManagerProps {
  token: string;
}

export default function TaskManager({ token }: TaskManagerProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState<boolean>(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [createFormData, setCreateFormData] = useState<TaskFormData>({
    title: '',
    type: '',
    description: '',
    quantity: 1,
    deadline: '',
    assignedTo: [],
    assignToAll: false
  });

  const [editFormData, setEditFormData] = useState<TaskFormData>({
    title: '',
    type: '',
    description: '',
    quantity: 1,
    deadline: '',
    assignedTo: [],
    assignToAll: false
  });

  const fetchTasks = async (): Promise<void> => {
    try {
      const response = await fetch('/api/tasks', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data: Task[] = await response.json();
        setTasks(data);
      } else {
        console.error('Failed to fetch tasks');
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async (): Promise<void> => {
    try {
      const response = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data: Student[] = await response.json();
        setStudents(data.filter((user) => user.isActive));
      } else {
        console.error('Failed to fetch students');
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const handleCreateSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createFormData),
      });

      if (response.ok) {
        setIsCreateDialogOpen(false);
        setCreateFormData({
          title: '',
          type: '',
          description: '',
          quantity: 1,
          deadline: '',
          assignedTo: [],
          assignToAll: false
        });
        fetchTasks();
      } else {
        console.error('Failed to create task');
      }
    } catch (error) {
      console.error('Error creating task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!editingTask) return;

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/tasks/${editingTask._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editFormData),
      });

      if (response.ok) {
        setIsEditDialogOpen(false);
        setEditingTask(null);
        setEditFormData({
          title: '',
          type: '',
          description: '',
          quantity: 1,
          deadline: '',
          assignedTo: [],
          assignToAll: false
        });
        fetchTasks();
      } else {
        console.error('Failed to update task');
      }
    } catch (error) {
      console.error('Error updating task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTask = async (taskId: string): Promise<void> => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchTasks();
      } else {
        console.error('Failed to delete task');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleEditTask = (task: Task): void => {
    setEditingTask(task);
    setEditFormData({
      title: task.title,
      type: task.type,
      description: task.description,
      quantity: task.quantity,
      deadline: task.deadline || '',
      assignedTo: task.assignedTo.map(student => typeof student === 'string' ? student : student._id),
      assignToAll: task.assignedTo.length === 0
    });
    setIsEditDialogOpen(true);
  };

  const handleCreateStudentSelection = (studentId: string, checked: boolean): void => {
    if (checked) {
      setCreateFormData(prev => ({
        ...prev,
        assignedTo: [...prev.assignedTo, studentId]
      }));
    } else {
      setCreateFormData(prev => ({
        ...prev,
        assignedTo: prev.assignedTo.filter(id => id !== studentId)
      }));
    }
  };

  const handleEditStudentSelection = (studentId: string, checked: boolean): void => {
    if (checked) {
      setEditFormData(prev => ({
        ...prev,
        assignedTo: [...prev.assignedTo, studentId]
      }));
    } else {
      setEditFormData(prev => ({
        ...prev,
        assignedTo: prev.assignedTo.filter(id => id !== studentId)
      }));
    }
  };

  const handleCreateAssignToAll = (checked: boolean): void => {
    setCreateFormData(prev => ({
      ...prev,
      assignToAll: checked,
      assignedTo: checked ? [] : prev.assignedTo
    }));
  };

  const handleEditAssignToAll = (checked: boolean): void => {
    setEditFormData(prev => ({
      ...prev,
      assignToAll: checked,
      assignedTo: checked ? [] : prev.assignedTo
    }));
  };

  useEffect(() => {
    fetchTasks();
    fetchStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderCreateTaskForm = () => (
    <form onSubmit={handleCreateSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Task Title</Label>
        <Input
          id="title"
          value={createFormData.title}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setCreateFormData(prev => ({ ...prev, title: e.target.value }))
          }
          required
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="type">Task Type</Label>
        <Select
          value={createFormData.type}
          onValueChange={(value: string) =>
            setCreateFormData(prev => ({ ...prev, type: value }))
          }
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select task type" />
          </SelectTrigger>
          <SelectContent>
            {TASK_TYPES.map(type => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={createFormData.description}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
            setCreateFormData(prev => ({ ...prev, description: e.target.value }))
          }
          required
          className="mt-1"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="quantity">Quantity</Label>
          <Input
            id="quantity"
            type="number"
            min={1}
            value={createFormData.quantity}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setCreateFormData(prev => ({ ...prev, quantity: parseInt(e.target.value, 10) || 1 }))
            }
            required
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="deadline">Deadline (Optional)</Label>
          <Input
            id="deadline"
            type="date"
            value={createFormData.deadline}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setCreateFormData(prev => ({ ...prev, deadline: e.target.value }))
            }
            className="mt-1"
          />
        </div>
      </div>

      <div>
        <Label>Assignment</Label>
        <div className="mt-2 space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="create-assignToAll"
              checked={createFormData.assignToAll}
              onCheckedChange={(checked: boolean) => handleCreateAssignToAll(checked)}
            />
            <Label htmlFor="create-assignToAll" className="text-sm">
              Assign to all students
            </Label>
          </div>

          {!createFormData.assignToAll && (
            <div className="border rounded-md p-3 max-h-40 overflow-y-auto">
              <Label className="text-sm font-medium">Select Students:</Label>
              <div className="mt-2 space-y-2">
                {students.map((student) => (
                  <div key={student._id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`create-${student._id}`}
                      checked={createFormData.assignedTo.includes(student._id)}
                      onCheckedChange={(checked: boolean) =>
                        handleCreateStudentSelection(student._id, checked)
                      }
                    />
                    <Label htmlFor={`create-${student._id}`} className="text-sm truncate">
                      {student.name} ({student.email})
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? <LoadingSpinner size="sm" /> : 'Create Task'}
      </Button>
    </form>
  );

  const renderEditTaskForm = () => (
    <form onSubmit={handleEditSubmit} className="space-y-4">
      <div>
        <Label htmlFor="edit-title">Task Title</Label>
        <Input
          id="edit-title"
          value={editFormData.title}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setEditFormData(prev => ({ ...prev, title: e.target.value }))
          }
          required
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="edit-type">Task Type</Label>
        <Select
          value={editFormData.type}
          onValueChange={(value: string) =>
            setEditFormData(prev => ({ ...prev, type: value }))
          }
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select task type" />
          </SelectTrigger>
          <SelectContent>
            {TASK_TYPES.map(type => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="edit-description">Description</Label>
        <Textarea
          id="edit-description"
          value={editFormData.description}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
            setEditFormData(prev => ({ ...prev, description: e.target.value }))
          }
          required
          className="mt-1"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="edit-quantity">Quantity</Label>
          <Input
            id="edit-quantity"
            type="number"
            min={1}
            value={editFormData.quantity}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setEditFormData(prev => ({ ...prev, quantity: parseInt(e.target.value, 10) || 1 }))
            }
            required
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="edit-deadline">Deadline (Optional)</Label>
          <Input
            id="edit-deadline"
            type="date"
            value={editFormData.deadline}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setEditFormData(prev => ({ ...prev, deadline: e.target.value }))
            }
            className="mt-1"
          />
        </div>
      </div>

      <div>
        <Label>Assignment</Label>
        <div className="mt-2 space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="edit-assignToAll"
              checked={editFormData.assignToAll}
              onCheckedChange={(checked: boolean) => handleEditAssignToAll(checked)}
            />
            <Label htmlFor="edit-assignToAll" className="text-sm">
              Assign to all students
            </Label>
          </div>

          {!editFormData.assignToAll && (
            <div className="border rounded-md p-3 max-h-40 overflow-y-auto">
              <Label className="text-sm font-medium">Select Students:</Label>
              <div className="mt-2 space-y-2">
                {students.map((student) => (
                  <div key={student._id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`edit-${student._id}`}
                      checked={editFormData.assignedTo.includes(student._id)}
                      onCheckedChange={(checked: boolean) =>
                        handleEditStudentSelection(student._id, checked)
                      }
                    />
                    <Label htmlFor={`edit-${student._id}`} className="text-sm truncate">
                      {student.name} ({student.email})
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? <LoadingSpinner size="sm" /> : 'Update Task'}
      </Button>
    </form>
  );

  return (
    <div className="space-y-6 p-4 md:p-6">
      <Card className="w-full overflow-hidden">
        <CardHeader className="px-4 py-5 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-xl sm:text-2xl">Task Management</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Create and manage daily tasks for students
              </CardDescription>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  New Task
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Task</DialogTitle>
                  <DialogDescription>Add a new task for students to complete</DialogDescription>
                </DialogHeader>
                {renderCreateTaskForm()}
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="px-2 sm:px-6 pb-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[20%]">Title</TableHead>
                      <TableHead className="w-[15%]">Type</TableHead>
                      <TableHead className="w-[10%]">Quantity</TableHead>
                      <TableHead className="w-[15%]">Assigned To</TableHead>
                      <TableHead className="w-[15%]">Deadline</TableHead>
                      <TableHead className="w-[15%]">Created</TableHead>
                      <TableHead className="w-[10%]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tasks.map((task) => (
                      <TableRow key={task._id}>
                        <TableCell className="font-medium truncate max-w-[200px]">{task.title}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="truncate max-w-[150px]">{task.type}</Badge>
                        </TableCell>
                        <TableCell>{task.quantity}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-2 flex-shrink-0" />
                            <span className="truncate">
                              {task.assignedTo.length === 0 ? 'All students' : `${task.assignedTo.length} students`}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {task.deadline ? (
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                              <span>{new Date(task.deadline).toLocaleDateString()}</span>
                            </div>
                          ) : (
                            'No deadline'
                          )}
                        </TableCell>
                        <TableCell>{new Date(task.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditTask(task)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the task.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteTask(task._id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4">
                {tasks.map((task) => (
                  <Card key={task._id} className="w-full">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start gap-2">
                        <CardTitle className="text-lg truncate">{task.title}</CardTitle>
                        <Badge variant="outline">{task.quantity}</Badge>
                      </div>
                      <CardDescription className="truncate">{task.type}</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-2 text-muted-foreground flex-shrink-0" />
                          <span className="text-sm">
                            {task.assignedTo.length === 0 ? 'All students' : `${task.assignedTo.length} students`}
                          </span>
                        </div>

                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-muted-foreground flex-shrink-0" />
                          <span className="text-sm">
                            {task.deadline ? `Due: ${new Date(task.deadline).toLocaleDateString()}` : 'No deadline'}
                          </span>
                        </div>

                        <div className="text-sm text-muted-foreground">
                          Created: {new Date(task.createdAt).toLocaleDateString()}
                        </div>

                        <div className="flex space-x-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditTask(task)}
                            className="flex-1"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm" className="flex-1">
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete the task.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteTask(task._id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
          {tasks.length === 0 && !loading && (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4" />
              <p>No tasks found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Task Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>Update task details</DialogDescription>
          </DialogHeader>
          {renderEditTaskForm()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
