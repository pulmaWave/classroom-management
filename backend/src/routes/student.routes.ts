import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import * as studentController from '../controllers/student.controller';

const router = Router();

router.use(authenticate);

router.get('/', studentController.getStudents);
router.get('/:id', studentController.getStudentById);
router.post('/', studentController.createStudent);
router.put('/:id', studentController.updateStudent);
router.delete('/:id', studentController.deleteStudent);

export default router;
