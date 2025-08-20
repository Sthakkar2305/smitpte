'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

interface TaskManagerProps {
  token: string;
}

interface Task {
  _id: string;
  title: string;
  type: string;
  description: string;
  quantity: number;
  deadline: string | null;
  assignedTo: any[];
  createdAt: string;
  createdBy: any;
}

interface Student {
  _id: string;
  name: string;
  email: string;
  isActive: boolean;
}

const TASK_TYPES = [
  // Speaking & Writing Module
  'Personal Introduction',
  'Read Aloud',
  'Repeat Sentence',
  'Describe Image',
  'Retell Lecture',
  'Answer Short Question',
  'Summarize Written Text',
  'Essay',
  
  // Reading Module
  'Multiple Choice, Choose Single Answer',
  'Multiple Choice, Choose Multiple Answers',
  'Re-order Paragraphs',
  'Reading Fill in the Blanks',
  'Reading & Writing Fill in the Blanks',
  
  // Listening Module
  'Summarize Spoken Text',
  'Multiple Choice, Choose Multiple Answers (Listening)',
  'Fill in the Blanks (Listening)',
  'Highlight Correct Summary',
  'Multiple Choice, Choose Single Answer (Listening)',
  'Select Missing Word',
  'Highlight Incorrect Words',
  'Write from Dictation'
];

export default function TaskManager({ token }: TaskManagerProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    description: '',
    quantity: 1,
    deadline: '',
    assignedTo: [] as string[],
    assignToAll: false
  });

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setStudents(data.filter((user: Student) => user.isActive));
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const url = editingTask ? `/api/tasks/${editingTask._id}` : '/api/tasks';
      const method = editingTask ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setIsDialogOpen(false);
        setIsEditDialogOpen(false);
        setFormData({
          title: '',
          type: '',
          description: '',
          quantity: 1,
          deadline: '',
          assignedTo: [],
          assignToAll: false
        });
        setEditingTask(null);
        fetchTasks();
      }
    } catch (error) {
      console.error('Error creating/updating task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchTasks();
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      type: task.type,
      description: task.description,
      quantity: task.quantity,
      deadline: task.deadline || '',
      assignedTo: task.assignedTo.map((student: any) => student._id),
      assignToAll: task.assignedTo.length === 0
    });
    setIsEditDialogOpen(true);
  };

  const handleStudentSelection = (studentId: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        assignedTo: [...prev.assignedTo, studentId]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        assignedTo: prev.assignedTo.filter(id => id !== studentId)
      }));
    }
  };

  const handleAssignToAll = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      assignToAll: checked,
      assignedTo: checked ? [] : prev.assignedTo
    }));
  };

  useEffect(() => {
    fetchTasks();
    fetchStudents();
  }, []);

  const renderTaskForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Task Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          required
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="type">Task Type</Label>
        <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
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
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
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
            min="1"
            value={formData.quantity}
            onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) }))}
            required
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="deadline">Deadline (Optional)</Label>
          <Input
            id="deadline"
            type="date"
            value={formData.deadline}
            onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
            className="mt-1"
          />
        </div>
      </div>

      <div>
        <Label>Assignment</Label>
        <div className="mt-2 space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="assignToAll"
              checked={formData.assignToAll}
              onCheckedChange={handleAssignToAll}
            />
            <Label htmlFor="assignToAll" className="text-sm">Assign to all students</Label>
          </div>
          
          {!formData.assignToAll && (
            <div className="border rounded-md p-3 max-h-40 overflow-y-auto">
              <Label className="text-sm font-medium">Select Students:</Label>
              <div className="mt-2 space-y-2">
                {students.map((student) => (
                  <div key={student._id} className="flex items-center space-x-2">
                    <Checkbox
                      id={student._id}
                      checked={formData.assignedTo.includes(student._id)}
                      onCheckedChange={(checked) => handleStudentSelection(student._id, checked as boolean)}
                    />
                    <Label htmlFor={student._id} className="text-sm truncate">
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
        {isSubmitting ? <LoadingSpinner size="sm" /> : (editingTask ? 'Update Task' : 'Create Task')}
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
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  New Task
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Task</DialogTitle>
                  <DialogDescription>
                    Add a new task for students to complete
                  </DialogDescription>
                </DialogHeader>
                {renderTaskForm()}
              </DialogContent>
            </Dialog>

            {/* Edit Task Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit Task</DialogTitle>
                  <DialogDescription>
                    Update task details
                  </DialogDescription>
                </DialogHeader>
                {renderTaskForm()}
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
                        <TableCell>
                          {new Date(task.createdAt).toLocaleDateString()}
                        </TableCell>
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
                      <CardDescription className="truncate">
                        {task.type}
                      </CardDescription>
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
                            {task.deadline ? (
                              `Due: ${new Date(task.deadline).toLocaleDateString()}`
                            ) : (
                              'No deadline'
                            )}
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
    </div>
  );
}