import { Router } from 'express';
import {
  Add__vechilekm,
  addOnduty_master,
  get__Onduty,
  get__Onduty_edit,
  get__Vechile,
  get__vechilekm,
  get_all_Onduty_reason,
  get_history_location,
  get_live_location,
  get_live_user,
  get_tracking_users,
  get_reached,
  get_Uploaded_IMAG,
  getDocId,
  getIn,
  requestOnduty,
  requestonduty_Approval,
  requestOndutyOut,
  requestReachedOut,
  send_location,
  stTrack,
} from '../services/onDuty.service.js';
import { upload } from '../utils/multer.js';

const router = Router();

// ── On-Duty Entries & Edits ──────────────────────────────────────────────────
router.get('/', get__Onduty);
router.get('/entries', get__Onduty);
router.get('/get__Onduty_edit', get__Onduty_edit);

// ── Trips & Check-Ins ────────────────────────────────────────────────────────
router.get('/getDocId', getDocId);
router.get('/doc-id', getDocId);
router.get('/getIn', getIn);
router.post('/requestOnduty', upload?.single('file'), requestOnduty);
router.post('/request', upload?.single('file'), requestOnduty);
router.post('/requestOndutyOut', requestOndutyOut);
router.post('/requestReachedOut', requestReachedOut);
router.get('/get_reached', get_reached);

// ── Approvals & Reasons ──────────────────────────────────────────────────────
router.post('/requestonduty_Approval', requestonduty_Approval);
router.post('/approve', requestonduty_Approval);
router.post('/addOnduty_master', addOnduty_master);
router.get('/get_all_Onduty_reason', get_all_Onduty_reason);
router.get('/reasons', get_all_Onduty_reason);
router.get('/Onduty_uploaded_image', get_Uploaded_IMAG);
router.get('/image', get_Uploaded_IMAG);

// ── Vehicles & Odometer ──────────────────────────────────────────────────────
router.get('/get__Vechile', get__Vechile);
router.get('/vehicles', get__Vechile);
router.get('/get__vechilekm', get__vechilekm);
router.post('/add__vechilekm', Add__vechilekm);

// ── Live Location Tracking ───────────────────────────────────────────────────
router.post('/send_location', send_location);
router.post('/stTrack', stTrack);
router.get('/get_history_location', get_history_location);
router.get('/get_live_location', get_live_location);
router.get('/get_live_user', get_live_user);
router.get('/get_tracking_users', get_tracking_users);

router.get('/redir', (req, res) => {
  res.json({ status: 1 });
});

export default router;
