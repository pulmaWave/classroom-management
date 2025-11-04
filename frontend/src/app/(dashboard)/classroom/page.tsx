'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Users, Calendar, MapPin } from 'lucide-react';
import { classroomAPI } from '@/lib/api';
import { formatDate } from '@/lib/utils';

export default function ClassroomsPage() {
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClassrooms();
  }, []);

  const loadClassrooms = async () => {
    try {
      const response: any = await classroomAPI.getAll();
      setClassrooms(response.data);
    } catch (error) {
      console.error('Error loading classrooms:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Đang tải...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Danh sách lớp học</h1>
          <p className="text-gray-500 mt-1">Quản lý các lớp học trong hệ thống</p>
        </div>
        <Link href="/dashboard/classrooms/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Tạo lớp học
          </Button>
        </Link>
      </div>

      {classrooms.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">Chưa có lớp học nào</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classrooms.map((classroom: any) => (
            <Link key={classroom.id} href={`/dashboard/classrooms/${classroom.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{classroom.name}</CardTitle>
                      <CardDescription>{classroom.classroomCode}</CardDescription>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded ${
                      classroom.status === 'ACTIVE'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {classroom.status}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="mr-2 h-4 w-4" />
                    {classroom._count.enrollments}/{classroom.maxStudents} sinh viên
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="mr-2 h-4 w-4" />
                    {classroom.room || 'Chưa có phòng'}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="mr-2 h-4 w-4" />
                    {formatDate(classroom.startDate)}
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-sm font-medium">{classroom.teacher.fullName}</p>
                    <p className="text-xs text-gray-500">{classroom.subject}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}