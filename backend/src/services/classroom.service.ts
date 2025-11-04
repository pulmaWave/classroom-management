import prisma from '../config/database';
import { AppError } from '../middlewares/errorHandler';

export const getAllClassrooms = async () => {
  return await prisma.classroom.findMany({
    include: {
      teacher: {
        select: {
          id: true,
          fullName: true,
          email: true
        }
      },
      _count: {
        select: { enrollments: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
};

export const getClassroomById = async (id: string) => {
  const classroom = await prisma.classroom.findUnique({
    where: { id },
    include: {
      teacher: {
        select: {
          id: true,
          fullName: true,
          email: true,
          teacherProfile: true
        }
      },
      enrollments: {
        include: {
          student: {
            include: {
              user: {
                select: {
                  fullName: true,
                  email: true
                }
              }
            }
          }
        }
      }
    }
  });

  if (!classroom) {
    throw new AppError('Không tìm thấy lớp học', 404);
  }

  return classroom;
};

export const createClassroom = async (data: any) => {
  // Kiểm tra mã lớp đã tồn tại
  const existing = await prisma.classroom.findUnique({
    where: { classroomCode: data.classroomCode }
  });

  if (existing) {
    throw new AppError('Mã lớp học đã tồn tại', 400);
  }

  return await prisma.classroom.create({
    data: {
      ...data,
      startDate: new Date(data.startDate),
      endDate: data.endDate ? new Date(data.endDate) : null
    },
    include: {
      teacher: {
        select: {
          fullName: true,
          email: true
        }
      }
    }
  });
};

export const updateClassroom = async (id: string, data: any) => {
  const classroom = await prisma.classroom.findUnique({ where: { id } });

  if (!classroom) {
    throw new AppError('Không tìm thấy lớp học', 404);
  }

  return await prisma.classroom.update({
    where: { id },
    data: {
      ...data,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : undefined
    }
  });
};

export const deleteClassroom = async (id: string) => {
  const classroom = await prisma.classroom.findUnique({ where: { id } });

  if (!classroom) {
    throw new AppError('Không tìm thấy lớp học', 404);
  }

  await prisma.classroom.delete({ where: { id } });
};

export const enrollStudent = async (classroomId: string, studentId: string) => {
  // Kiểm tra lớp học tồn tại
  const classroom = await prisma.classroom.findUnique({
    where: { id: classroomId },
    include: { _count: { select: { enrollments: true } } }
  });

  if (!classroom) {
    throw new AppError('Không tìm thấy lớp học', 404);
  }

  // Kiểm tra lớp đã đầy
  if (classroom._count.enrollments >= classroom.maxStudents) {
    throw new AppError('Lớp học đã đầy', 400);
  }

  // Kiểm tra sinh viên đã đăng ký
  const existing = await prisma.classroomEnrollment.findUnique({
    where: {
      studentId_classroomId: {
        studentId,
        classroomId
      }
    }
  });

  if (existing) {
    throw new AppError('Sinh viên đã đăng ký lớp học này', 400);
  }

  return await prisma.classroomEnrollment.create({
    data: {
      studentId,
      classroomId
    },
    include: {
      student: {
        include: {
          user: {
            select: {
              fullName: true,
              email: true
            }
          }
        }
      }
    }
  });
};

export const getClassroomStudents = async (classroomId: string) => {
  const enrollments = await prisma.classroomEnrollment.findMany({
    where: { classroomId },
    include: {
      student: {
        include: {
          user: {
            select: {
              fullName: true,
              email: true,
              phoneNumber: true
            }
          }
        }
      }
    },
    orderBy: {
      enrolledAt: 'asc'
    }
  });

  return enrollments.map(e => ({
    enrollmentId: e.id,
    enrolledAt: e.enrolledAt,
    grade: e.grade,
    status: e.status,
    student: {
      id: e.student.id,
      studentId: e.student.studentId,
      fullName: e.student.user.fullName,
      email: e.student.user.email,
      phoneNumber: e.student.user.phoneNumber,
      major: e.student.major,
      academicYear: e.student.academicYear,
      gpa: e.student.gpa
    }
  }));
};