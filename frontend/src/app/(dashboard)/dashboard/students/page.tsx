'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDate } from '@/lib/utils';
import { studentAPI } from '@/lib/api';
import { RefreshCw, Search, Users } from 'lucide-react';

type Student = {
  id: string;
  studentId: string;
  dateOfBirth: string | null;
  gender: string | null;
  major: string | null;
  academicYear: string | null;
  gpa: number | null;
  enrollmentCount: number;
  user?: {
    fullName: string | null;
    email: string;
    phoneNumber: string | null;
    address: string | null;
    isActive: boolean;
  };
};

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response: any = await studentAPI.getAll();
      setStudents(response.data ?? []);
    } catch (err: any) {
      console.error('Error loading students:', err);
      setError(
        typeof err === 'string'
          ? err
          : err?.message ?? 'Khong the tai danh sach sinh vien.'
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) return students;

    return students.filter((student) => {
      const candidate = [
        student.studentId,
        student.user?.fullName ?? '',
        student.user?.email ?? '',
        student.major ?? '',
        student.academicYear ?? '',
      ]
        .join(' ')
        .toLowerCase();

      return candidate.includes(keyword);
    });
  }, [students, searchTerm]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quản lý sinh viên</h1>
          <p className="mt-1 text-sm text-gray-500">
            Theo dõi hồ sơ và trạng thái sinh viên trong hệ thống quản lý
            lớp học.
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              className="pl-9"
              placeholder="Tim theo ten, ma sinh vien hoac email..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>

          <Button
            variant="outline"
            onClick={loadStudents}
            disabled={loading}
            className="md:w-auto"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Tai lai
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Tổng sinh viên
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-3">
            <Users className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-semibold">{students.length}</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Đang hoạt động
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-semibold">
              {students.filter((student) => student.user?.isActive).length}
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              GPA trung bình
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-semibold">
              {students.length
                ? (
                    students.reduce(
                      (sum, student) => sum + (student.gpa ?? 0),
                      0
                    ) / students.length
                  ).toFixed(2)
                : '0.00'}
            </span>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Danh sách sinh viên</CardTitle>
          {error && (
            <span className="text-sm text-red-600">
              {error} Vui lòng thử lại.
            </span>
          )}
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="py-16 text-center text-sm text-gray-500">
              Đang tải dữ liệu...
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="py-16 text-center text-sm text-gray-500">
              Không có sinh viên phù hợp.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Họ tên</TableHead>
                  <TableHead>Mã sinh viên</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Số điện thoại</TableHead>
                  <TableHead>Chuyên ngành</TableHead>
                  <TableHead>Khoa</TableHead>
                  <TableHead>Ngày sinh</TableHead>
                  <TableHead>GPA sinh</TableHead>
                  <TableHead>GPA</TableHead>
                  <TableHead>Số lớp</TableHead>
                  <TableHead>Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">
                      {student.user?.fullName ?? 'Chua cap nhat'}
                    </TableCell>
                    <TableCell>{student.studentId}</TableCell>
                    <TableCell className="text-xs text-gray-500">
                      {student.user?.email}
                    </TableCell>
                    <TableCell className="text-xs text-gray-500">
                      {student.user?.phoneNumber ?? '---'}
                    </TableCell>
                    <TableCell>{student.major ?? '---'}</TableCell>
                    <TableCell>{student.academicYear ?? '---'}</TableCell>
                    <TableCell>
                      {student.dateOfBirth
                        ? formatDate(student.dateOfBirth)
                        : '---'}
                    </TableCell>
                    <TableCell>
                      {student.gpa !== null && student.gpa !== undefined
                        ? student.gpa.toFixed(2)
                        : '---'}
                    </TableCell>
                    <TableCell>{student.enrollmentCount}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                          student.user?.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {student.user?.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableCaption>
                {filteredStudents.length} sinh viên được hiển thị.
              </TableCaption>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}