import { Router } from 'express';
import { punchIn, punchOut, getAttendanceStatus, getPunchSummary } from '../services/att.services.js';

const router = Router();

router.get("/status",   getAttendanceStatus);
router.get("/summary",  getPunchSummary);      // ← new
router.post("/punch-in",  punchIn);
router.put("/punch-out",  punchOut);

export default router;