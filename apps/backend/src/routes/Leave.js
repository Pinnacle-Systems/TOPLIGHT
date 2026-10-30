import { Router } from 'express';
import {
  add_requestLeave,
  get__per,
  get_Current_Fin_Year,
  get_Lcode,
  get_leave_available,
  get_lcode_leave_available,
  getDocId,
  getLeaves,
  InsertLeave,
  requestLeave_Approval,
} from '../services/leaveService.js';

const router = Router();

// ── Leave Entries ────────────────────────────────────────────────────────────
router.get('/', get__per);
router.get('/entries', get__per);
router.get('/getLeaves', getLeaves);

// ── Document ID & Financial Year ─────────────────────────────────────────────
router.get('/getDocId', getDocId);
router.get('/doc-id', getDocId);
router.get('/get_Current_Fin_Year', get_Current_Fin_Year);
router.get('/financial-year', get_Current_Fin_Year);

// ── Leave Types & Availability ───────────────────────────────────────────────
router.get('/get_Lcode', get_Lcode);
router.get('/codes', get_Lcode);
router.get('/get_leave_available', get_leave_available);
router.get('/availability', get_leave_available);
router.get('/get_lcode_leave_available', get_lcode_leave_available);

// ── Leave Requests & Approvals ───────────────────────────────────────────────
router.post('/add_requestLeave', add_requestLeave);
router.post('/request', add_requestLeave);
router.post('/requestLeave_Approval', requestLeave_Approval);
router.post('/approve', requestLeave_Approval);
router.get('/leaveReg', InsertLeave);

export default router;
