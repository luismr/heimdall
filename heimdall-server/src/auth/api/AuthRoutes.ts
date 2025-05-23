import { Router } from 'express';
import * as authController from './AuthController';
import * as adminController from './AdminController';
import { requireAuth, requireAdmin } from '@luismr/heimdall-middleware-express';

const router = Router();

// Auth endpoints
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/logout', requireAuth, authController.logout);

// Admin endpoints
router.post('/admin/block', requireAdmin, adminController.blockUser);
router.post('/admin/unblock', requireAdmin, adminController.unblockUser);
router.post('/admin/remove', requireAdmin, adminController.removeUser);

export default router; 