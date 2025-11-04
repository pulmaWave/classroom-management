import { Request, Response } from 'express';
import * as classroomService from '../services/classroom.service';
import { sendSuccess } from '../utils/response.util';

export const getAllClassrooms = async (req: Request, res: Response) => {
  const classrooms = await classroomService.getAllClassrooms();
  sendSuccess(res, classrooms, 'Lấy danh sách lớp học thành công');
};

export const getClassroomById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const classroom = await classroomService.getClassroomById(id);
  sendSuccess(res, classroom, 'Lấy thông tin lớp học thành công');
};

export const createClassroom = async (req: Request, res: Response) => {
  const classroom = await classroomService.createClassroom(req.body);
  sendSuccess(res, classroom, 'Tạo lớp học thành công', 201);
};

export const updateClassroom = async (req: Request, res: Response) => {
  const { id } = req.params;
  const classroom = await classroomService.updateClassroom(id, req.body);
  sendSuccess(res, classroom, 'Cập nhật lớp học thành công');
};

export const deleteClassroom = async (req: Request, res: Response) => {
  const { id } = req.params;
  await classroomService.deleteClassroom(id);
  sendSuccess(res, null, 'Xóa lớp học thành công');
};

export const enrollStudent = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { studentId } = req.body;
  const enrollment = await classroomService.enrollStudent(id, studentId);
  sendSuccess(res, enrollment, 'Đăng ký lớp học thành công', 201);
};

export const getClassroomStudents = async (req: Request, res: Response) => {
  const { id } = req.params;
  const students = await classroomService.getClassroomStudents(id);
  sendSuccess(res, students, 'Lấy danh sách sinh viên thành công');
};