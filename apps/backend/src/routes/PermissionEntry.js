import { Router } from 'express';
import {
  getDocId,
  requestPermission,
  requestPermission_Approval,
  get__per,
  addPermission_master,
  get__per_category,
  get_all_Permission_reason,
} from '../services/permissionEntryService.js';

const router = Router();

// ── Permission Entries ───────────────────────────────────────────────────────
router.get('/', get__per);
router.get('/entries', get__per);

// ── Document ID ──────────────────────────────────────────────────────────────
router.get('/getDocId', getDocId);
router.get('/doc-id', getDocId);

// ── Permission Requests & Approvals ──────────────────────────────────────────
router.post('/requestPermission', requestPermission);
router.post('/request', requestPermission);
router.post('/requestPermission_Approval', requestPermission_Approval);
router.post('/approve', requestPermission_Approval);

// ── Permission Categories & Reasons ──────────────────────────────────────────
router.post('/addPermission_Master', addPermission_master);
router.get('/addPermission_Master', addPermission_master);
router.get('/get__per_category', get__per_category);
router.get('/categories', get__per_category);
router.get('/get_all_Permission_reason', get_all_Permission_reason);
router.get('/reasons', get_all_Permission_reason);

export default router;
