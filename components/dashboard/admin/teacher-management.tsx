'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
import { Plus, UserPlus } from 'lucide-react';
import LoadingSpinner from '@/components/ui/loading-spinner';

interface TeacherManagementProps {
  token: string;
}

export default function TeacherManagement({ token }: TeacherManagementProps) {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const fetchTeachers = async () => {
    try {
      const response = await fetch('/api/users/teachers', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setTeachers(data);
      }
    } catch (error) {
      console.error('Error fetching teachers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setError('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          role: 'admin'
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsDialogOpen(false);
        setFormData({ name: '', email: '', password: '' });
        fetchTeachers();
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const toggleTeacherStatus = async (teacherId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/users/${teacherId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !isActive }),
      });

      if (response.ok) {
        fetchTeachers();
      }
    } catch (error) {
      console.error('Error updating teacher status:', error);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Teacher Management</CardTitle>
        </CardHeader>
        <CardContent>
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Teacher Management</CardTitle>
            <CardDescription>
              Manage teacher accounts and permissions
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Teacher
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Teacher Account</DialogTitle>
                <DialogDescription>
                  Add a new teacher to the system
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateTeacher} className="space-y-4">
                {error && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                    {error}
                  </div>
                )}
                
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    required
                    className="mt-1"
                    minLength={6}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isCreating}>
                  {isCreating ? <LoadingSpinner size="sm" /> : 'Create Teacher Account'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teachers.map((teacher: any) => (
              <TableRow key={teacher._id}>
                <TableCell className="font-medium">
                  <div className="flex items-center">
                    <UserPlus className="h-4 w-4 mr-2 text-blue-600" />
                    {teacher.name}
                  </div>
                </TableCell>
                <TableCell>{teacher.email}</TableCell>
                <TableCell>
                  <Badge variant={teacher.isActive ? 'default' : 'secondary'}>
                    {teacher.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(teacher.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {teacher.lastLogin 
                    ? new Date(teacher.lastLogin).toLocaleDateString()
                    : 'Never'
                  }
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleTeacherStatus(teacher._id, teacher.isActive)}
                  >
                    {teacher.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {teachers.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <UserPlus className="h-12 w-12 mx-auto mb-4" />
            <p>No teachers found</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}