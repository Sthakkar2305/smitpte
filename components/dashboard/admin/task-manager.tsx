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
import { Plus, Calendar, Users } from 'lucide-react';
import LoadingSpinner from '@/components/ui/loading-spinner';

interface TaskManagerProps {
  token: string;
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
  const [tasks, setTasks] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
 
  
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
        setStudents(data.filter((user: any) => user.isActive));
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setIsDialogOpen(false);
        setFormData({
          title: '',
          type: '',
          description: '',
          quantity: 1,
          deadline: '',
          assignedTo: [],
          assignToAll: false
        });
        fetchTasks();
      }
    } catch (error) {
      console.error('Error creating task:', error);
    } finally {
      setIsSubmitting(false);
    }
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Task Management</CardTitle>
              <CardDescription>
                Create and manage daily tasks for students
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
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

                  <div>
                    <Label>Assignment</Label>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="assignToAll"
                          checked={formData.assignToAll}
                          onCheckedChange={handleAssignToAll}
                        />
                        <Label htmlFor="assignToAll">Assign to all students</Label>
                      </div>
                      
                      {!formData.assignToAll && (
                        <div className="border rounded-md p-3 max-h-40 overflow-y-auto">
                          <Label className="text-sm font-medium">Select Students:</Label>
                          <div className="mt-2 space-y-2">
                            {students.map((student: any) => (
                              <div key={student._id} className="flex items-center space-x-2">
                                <Checkbox
                                  id={student._id}
                                  checked={formData.assignedTo.includes(student._id)}
                                  onCheckedChange={(checked) => handleStudentSelection(student._id, checked as boolean)}
                                />
                                <Label htmlFor={student._id} className="text-sm">
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
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <LoadingSpinner />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Deadline</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task: any) => (
                  <TableRow key={task._id}>
                    <TableCell className="font-medium">{task.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{task.type}</Badge>
                    </TableCell>
                    <TableCell>{task.quantity}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2" />
                        {task.assignedTo.length === 0 ? 'All students' : `${task.assignedTo.length} students`}
                      </div>
                    </TableCell>
                    <TableCell>
                      {task.deadline ? (
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          {new Date(task.deadline).toLocaleDateString()}
                        </div>
                      ) : (
                        'No deadline'
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(task.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}