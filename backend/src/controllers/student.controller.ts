import { Request, Response } from 'express';
import * as studentService from '../services/student.service';
import { sendSuccess } from '../utils/response.util';

export const getStudents = async (req: Request, res: Response) => {
  const students = await studentService.getAllStudents();
  sendSuccess(res, students, 'Fetched students successfully');
};

export const getStudentById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const student = await studentService.getStudentById(id);
  sendSuccess(res, student, 'Fetched student successfully');
};

export const createStudent = async (req: Request, res: Response) => {
  const student = await studentService.createStudent(req.body);
  sendSuccess(res, student, 'Created student successfully', 201);
};

export const updateStudent = async (req: Request, res: Response) => {
  const { id } = req.params;
  const student = await studentService.updateStudent(id, req.body);
  sendSuccess(res, student, 'Updated student successfully');
};

export const deleteStudent = async (req: Request, res: Response) => {
  const { id } = req.params;
  await studentService.deleteStudent(id);
  sendSuccess(res, null, 'Deleted student successfully');
};
