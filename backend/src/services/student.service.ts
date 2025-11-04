import bcrypt from 'bcryptjs';
import prisma from '../config/database';
import { AppError } from '../middlewares/errorHandler';

const ALLOWED_GENDERS = ['MALE', 'FEMALE', 'OTHER'] as const;

type AllowedGender = (typeof ALLOWED_GENDERS)[number];

const normaliseGender = (value: any): AllowedGender => {
  if (!value) {
    throw new AppError('Gender is required', 400);
  }

  const gender = String(value).toUpperCase() as AllowedGender;

  if (!ALLOWED_GENDERS.includes(gender)) {
    throw new AppError('Invalid gender value', 400);
  }

  return gender;
};

const parseDate = (value: any, field: string) => {
  if (!value) {
    throw new AppError(`${field} is required`, 400);
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    throw new AppError(`${field} is invalid`, 400);
  }

  return parsed;
};

const buildStudentResponse = (student: any) => ({
  id: student.id,
  studentId: student.studentId,
  dateOfBirth: student.dateOfBirth,
  gender: student.gender,
  major: student.major,
  academicYear: student.academicYear,
  gpa: student.gpa,
  createdAt: student.createdAt,
  updatedAt: student.updatedAt,
  enrollmentCount: student._count?.enrollments ?? student.enrollments?.length ?? 0,
  user: student.user
    ? {
        id: student.user.id,
        email: student.user.email,
        fullName: student.user.fullName,
        phoneNumber: student.user.phoneNumber,
        address: student.user.address,
        avatar: student.user.avatar,
        role: student.user.role,
        isActive: student.user.isActive,
        createdAt: student.user.createdAt,
        updatedAt: student.user.updatedAt
      }
    : undefined,
  enrollments: student.enrollments
    ? student.enrollments.map((enrollment: any) => ({
        id: enrollment.id,
        classroomId: enrollment.classroomId,
        enrolledAt: enrollment.enrolledAt,
        grade: enrollment.grade,
        status: enrollment.status,
        classroom: enrollment.classroom
          ? {
              id: enrollment.classroom.id,
              classroomCode: enrollment.classroom.classroomCode,
              name: enrollment.classroom.name,
              subject: enrollment.classroom.subject,
              semester: enrollment.classroom.semester
            }
          : undefined
      }))
    : undefined
});

export const getAllStudents = async () => {
  const students = await prisma.student.findMany({
    include: {
      user: {
        select: {
          id: true,
          email: true,
          fullName: true,
          phoneNumber: true,
          address: true,
          avatar: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true
        }
      },
      _count: {
        select: { enrollments: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return students.map(buildStudentResponse);
};

export const getStudentById = async (id: string) => {
  const student = await prisma.student.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          fullName: true,
          phoneNumber: true,
          address: true,
          avatar: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true
        }
      },
      enrollments: {
        include: {
          classroom: {
            select: {
              id: true,
              classroomCode: true,
              name: true,
              subject: true,
              semester: true
            }
          }
        }
      }
    }
  });

  if (!student) {
    throw new AppError('Student not found', 404);
  }

  return buildStudentResponse(student);
};

export const createStudent = async (data: any) => {
  const {
    email,
    password,
    fullName,
    phoneNumber,
    address,
    avatar,
    studentId,
    dateOfBirth,
    gender,
    major,
    academicYear,
    gpa
  } = data;

  if (!email || !password || !fullName || !studentId || !major || !academicYear) {
    throw new AppError('Missing required fields', 400);
  }

  const existingEmail = await prisma.user.findUnique({
    where: { email }
  });

  if (existingEmail) {
    throw new AppError('Email is already in use', 400);
  }

  const existingStudentId = await prisma.student.findUnique({
    where: { studentId }
  });

  if (existingStudentId) {
    throw new AppError('Student ID already exists', 400);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const createdUser = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      fullName,
      role: 'STUDENT',
      phoneNumber,
      address,
      avatar,
      studentProfile: {
        create: {
          studentId,
          dateOfBirth: parseDate(dateOfBirth, 'dateOfBirth'),
          gender: normaliseGender(gender),
          major,
          academicYear,
          gpa: gpa ?? 0
        }
      }
    },
    include: {
      studentProfile: true
    }
  });

  if (!createdUser.studentProfile) {
    throw new AppError('Failed to create student profile', 500);
  }

  return getStudentById(createdUser.studentProfile.id);
};

export const updateStudent = async (id: string, data: any) => {
  const student = await prisma.student.findUnique({
    where: { id },
    include: { user: true }
  });

  if (!student) {
    throw new AppError('Student not found', 404);
  }

  const updatesForUser: any = {};
  const updatesForStudent: any = {};

  if (data.email && data.email !== student.user.email) {
    const existingEmail = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existingEmail) {
      throw new AppError('Email is already in use', 400);
    }

    updatesForUser.email = data.email;
  }

  if (data.studentId && data.studentId !== student.studentId) {
    const existingStudentId = await prisma.student.findUnique({
      where: { studentId: data.studentId }
    });

    if (existingStudentId) {
      throw new AppError('Student ID already exists', 400);
    }

    updatesForStudent.studentId = data.studentId;
  }

  if (data.fullName !== undefined) {
    updatesForUser.fullName = data.fullName;
  }
  if (data.phoneNumber !== undefined) {
    updatesForUser.phoneNumber = data.phoneNumber;
  }
  if (data.address !== undefined) {
    updatesForUser.address = data.address;
  }
  if (data.avatar !== undefined) {
    updatesForUser.avatar = data.avatar;
  }
  if (data.isActive !== undefined) {
    updatesForUser.isActive = Boolean(data.isActive);
  }
  if (data.password) {
    updatesForUser.password = await bcrypt.hash(data.password, 10);
  }

  if (data.dateOfBirth) {
    updatesForStudent.dateOfBirth = parseDate(data.dateOfBirth, 'dateOfBirth');
  }
  if (data.gender) {
    updatesForStudent.gender = normaliseGender(data.gender);
  }
  if (data.major !== undefined) {
    updatesForStudent.major = data.major;
  }
  if (data.academicYear !== undefined) {
    updatesForStudent.academicYear = data.academicYear;
  }
  if (data.gpa !== undefined) {
    updatesForStudent.gpa = Number(data.gpa);
  }

  if (Object.keys(updatesForUser).length > 0) {
    await prisma.user.update({
      where: { id: student.userId },
      data: updatesForUser
    });
  }

  if (Object.keys(updatesForStudent).length > 0) {
    await prisma.student.update({
      where: { id },
      data: updatesForStudent
    });
  }

  return getStudentById(id);
};

export const deleteStudent = async (id: string) => {
  const student = await prisma.student.findUnique({
    where: { id },
    select: { userId: true }
  });

  if (!student) {
    throw new AppError('Student not found', 404);
  }

  await prisma.user.delete({
    where: { id: student.userId }
  });
};
