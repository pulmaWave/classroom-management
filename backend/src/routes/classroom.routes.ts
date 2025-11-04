import { Router } from 'express';
import * as classroomController from '../controllers/classroom.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate); // Tất cả routes cần authentication

router.get('/', classroomController.getAllClassrooms);
router.get('/:id', classroomController.getClassroomById);
router.post('/', classroomController.createClassroom);
router.put('/:id', classroomController.updateClassroom);
router.delete('/:id', classroomController.deleteClassroom);

// Enrollment routes
router.post('/:id/enroll', classroomController.enrollStudent);
router.get('/:id/students', classroomController.getClassroomStudents);

export default router;