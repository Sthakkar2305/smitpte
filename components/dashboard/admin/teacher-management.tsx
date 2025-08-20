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
      <Card className="w-full max-w-6xl mx-auto">
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
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-xl sm:text-2xl">Teacher Management</CardTitle>
            <CardDescription className="mt-1 text-sm sm:text-base">
              Manage teacher accounts and permissions
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Add Teacher
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md mx-4 sm:mx-0">
              <DialogHeader>
                <DialogTitle className="text-lg sm:text-xl">Create New Teacher Account</DialogTitle>
                <DialogDescription className="text-sm sm:text-base">
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
                  <Label htmlFor="name" className="text-sm sm:text-base">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                    className="mt-1 text-sm sm:text-base"
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-sm sm:text-base">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    required
                    className="mt-1 text-sm sm:text-base"
                  />
                </div>

                <div>
                  <Label htmlFor="password" className="text-sm sm:text-base">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    required
                    className="mt-1 text-sm sm:text-base"
                    minLength={6}
                  />
                </div>

                <Button type="submit" className="w-full text-sm sm:text-base" disabled={isCreating}>
                  {isCreating ? <LoadingSpinner size="sm" /> : 'Create Teacher Account'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs sm:text-sm">Name</TableHead>
                <TableHead className="text-xs sm:text-sm">Email</TableHead>
                <TableHead className="text-xs sm:text-sm">Status</TableHead>
                <TableHead className="text-xs sm:text-sm hidden md:table-cell">Joined</TableHead>
                <TableHead className="text-xs sm:text-sm hidden lg:table-cell">Last Login</TableHead>
                <TableHead className="text-xs sm:text-sm">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teachers.map((teacher: any) => (
                <TableRow key={teacher._id}>
                  <TableCell className="font-medium text-xs sm:text-sm">
                    <div className="flex items-center">
                      <UserPlus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-blue-600" />
                      <span className="truncate max-w-[100px] sm:max-w-none">{teacher.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs sm:text-sm">
                    <span className="truncate max-w-[80px] sm:max-w-none">{teacher.email}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={teacher.isActive ? 'default' : 'secondary'} className="text-xs">
                      {teacher.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs sm:text-sm hidden md:table-cell">
                    {new Date(teacher.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-xs sm:text-sm hidden lg:table-cell">
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
                      className="text-xs sm:text-sm"
                    >
                      {teacher.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {teachers.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <UserPlus className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-4" />
            <p className="text-sm sm:text-base">No teachers found</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}