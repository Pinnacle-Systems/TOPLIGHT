import { Router } from 'express';
import {
  createRoleOnPage_Master,
  get_all_Role_name,
  createRoleMaster,
  getAllRoleNames,
} from '../services/roleOnPageService.js';

const router = Router();

// Legacy endpoints
router.post('/create_role_master', createRoleOnPage_Master);
router.get('/get_all_role', get_all_Role_name);

// Standard aliases
router.post('/master', createRoleMaster);
router.get('/all', getAllRoleNames);

export default router;
