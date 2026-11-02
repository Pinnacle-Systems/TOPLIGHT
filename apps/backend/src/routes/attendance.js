import { Router } from 'express';
import {
  punchIn,
  punchOut,
  getAttendanceStatus,
  getPunchSummary,
  getAttendanceApprovalList,
  requestAttendance_Approval,
} from '../services/attendanceService.js';

const router = Router();

router.get("/status",   getAttendanceStatus);
router.get("/summary",  getPunchSummary);      // ← new
router.get("/approval-list", getAttendanceApprovalList);
router.post("/punch-in",  punchIn);
router.put("/punch-out",  punchOut);

// Approvals & Rejections
router.post("/requestAttendance_Approval", requestAttendance_Approval);
router.post("/approve", requestAttendance_Approval);
router.post("/approval", requestAttendance_Approval);

export default router;
