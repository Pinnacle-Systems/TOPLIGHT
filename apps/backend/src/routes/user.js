import { Router } from 'express';
import {
  login,
  create,
  get,
  remove,
  getOne,
  getUserDet,
  getDesignation,
  getRolesOnPage,
  createRoleOnPage,
  getUserDetails,
  UpdateRoleOnPage,
  UploadImage,
  getUserImage,
  getCompanyCode,
  getEmployeeIds,
  update_fcm,
  get_hod_token,
  get_refresh_token,
  get_fcm_token,
  send_Otp,
  verify_Otp_and_change_pass,
  getUserRolesOnPage,
  getCreatedRolesOnPage,
  Change_Settings,
  get_Change_Settings,
  get_Hod_Details,
  UserLogs,
  getEmployeeIdsWithAtt,
} from '../services/user.service.js';
import { upload_profile } from '../utils/multer.js';

const router = Router();

// ── Authentication & Password ──────────────────────────────────────────────
router.post('/login', login);
router.post('/send_Otp', send_Otp);
router.post('/otp/send', send_Otp);
router.post('/change_password', verify_Otp_and_change_pass);
router.post('/password/change', verify_Otp_and_change_pass);
router.get('/get_refresh_token', get_refresh_token);
router.get('/refresh-token', get_refresh_token);

// ── User CRUD ──────────────────────────────────────────────────────────────
router.post('/', create);
router.get('/', get);
router.delete('/', remove);
router.get('/getUserDet', getUserDet);
router.get('/details', getUserDet);
router.get('/userDetails', getOne);
router.get('/getUserBasicDetails', getUserDetails);
router.get('/basic-details', getUserDetails);

// ── Profile Image ──────────────────────────────────────────────────────────
router.post('/upload', upload_profile.single('file'), UploadImage);
router.get('/getUserImage/:USERNAME', getUserImage);
router.get('/image/:USERNAME', getUserImage);

// ── Roles & Designations ───────────────────────────────────────────────────
router.get('/getDesignation', getDesignation);
router.get('/designations', getDesignation);
router.get('/getRolesOnPage', getRolesOnPage);
router.get('/roles', getRolesOnPage);
router.post('/createRoleOnPage', createRoleOnPage);
router.post('/roles/create', createRoleOnPage);
router.post('/UpdateRoleOnPage', UpdateRoleOnPage);
router.post('/roles/update', UpdateRoleOnPage);
router.get('/getUserRolesOnPage', getUserRolesOnPage);
router.get('/user-roles', getUserRolesOnPage);
router.get('/getCreatedRolesOnPage', getCreatedRolesOnPage);
router.get('/created-roles', getCreatedRolesOnPage);

// ── Company & Employee Information ─────────────────────────────────────────
router.get('/getCompanyCode', getCompanyCode);
router.get('/company-codes', getCompanyCode);
router.get('/getEmployeeIds', getEmployeeIds);
router.get('/employee-ids', getEmployeeIds);
router.get('/getEmployeeIdsWithAtt', getEmployeeIdsWithAtt);
router.get('/employee-ids-with-attendance', getEmployeeIdsWithAtt);

// ── FCM & Notifications ────────────────────────────────────────────────────
router.post('/update_fcm', update_fcm);
router.post('/fcm-token', update_fcm);
router.get('/get_fcm_token', get_fcm_token);
router.get('/fcm-token', get_fcm_token);
router.get('/get_hod_token', get_hod_token);
router.get('/hod-token', get_hod_token);
router.get('/get_Hod_Details', get_Hod_Details);
router.get('/hod-details', get_Hod_Details);

// ── System Logs & Settings ─────────────────────────────────────────────────
router.get('/LoginLogs', UserLogs);
router.get('/logs', UserLogs);
router.get('/get_Change_Settings', get_Change_Settings);
router.get('/settings', get_Change_Settings);
router.post('/Change_Settings', Change_Settings);
router.post('/settings', Change_Settings);

export default router;
