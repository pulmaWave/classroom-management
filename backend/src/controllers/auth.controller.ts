import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';
import { AppError } from '../middlewares/errorHandler';

export const login = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      studentProfile: true,
      teacherProfile: true
    }
  });

  if (!user || !user.isActive) {
    throw new AppError('Email hoặc mật khẩu không đúng', 401);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new AppError('Email hoặc mật khẩu không đúng', 401);
  }

  const token = jwt.sign(
  { id: user.id, email: user.email, role: user.role },
  process.env.JWT_SECRET!,
  {}
);

const { password: _, ...userWithoutPassword } = user;

return {
  user: userWithoutPassword,
  token
};
};

export const register = async (data: any) => {
  const existing = await prisma.user.findUnique({
    where: { email: data.email }
  });

  if (existing) {
    throw new AppError('Email đã được sử dụng', 400);
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const user = await prisma.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      fullName: data.fullName,
      role: data.role || 'STUDENT',
      phoneNumber: data.phoneNumber,
      address: data.address
    }
  });

  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

export const getProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      studentProfile: true,
      teacherProfile: true
    }
  });

  if (!user) {
    throw new AppError('Người dùng không tồn tại', 404);
  }

  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};
