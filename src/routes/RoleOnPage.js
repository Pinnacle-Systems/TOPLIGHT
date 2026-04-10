import { Router } from 'express';
import { createRoleOnPage_Master,get_all_Role_name } from '../services/RoleOnpage.services.js';



const router = Router();
router.post('/create_role_master',createRoleOnPage_Master);
router.get('/get_all_role',get_all_Role_name);



export default router;