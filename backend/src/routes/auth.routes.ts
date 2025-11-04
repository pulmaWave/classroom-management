import { Router, Request, Response, NextFunction } from 'express';
import * as authController from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { sendSuccess } from '../utils/response.util';
import { AppError } from '../middlewares/errorHandler';

const router = Router();

router.post(
  '/login',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      const authResult = await authController.login(email, password);
      sendSuccess(res, authResult, 'Login successful');
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/register',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await authController.register(req.body);
      sendSuccess(res, user, 'Registration successful', 201);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/me',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        throw new AppError('Unauthorized', 401);
      }

      const profile = await authController.getProfile(userId);
      sendSuccess(res, profile, 'Profile fetched');
    } catch (error) {
      next(error);
    }
  }
);

export default router;
