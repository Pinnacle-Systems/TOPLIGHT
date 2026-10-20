import { Router } from 'express';

import { getPermissionRequest } from '../services/notification.service.js';


const router = Router();

router.get('/getPermissionRequest', getPermissionRequest);

//router.post("/requestPermission",requestPermission)

export default router;