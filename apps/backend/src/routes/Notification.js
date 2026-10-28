import { Router } from 'express';
import {
  getPermissionRequest,
  getPendingApprovalRequests,
} from '../services/notification.service.js';

const router = Router();

// Legacy endpoint
router.get('/getPermissionRequest', getPermissionRequest);

// Standard aliases
router.get('/pending', getPendingApprovalRequests);
router.get('/requests', getPendingApprovalRequests);
router.get('/permission-requests', getPendingApprovalRequests);

export default router;
