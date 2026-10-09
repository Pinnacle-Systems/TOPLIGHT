import { Router } from 'express';

import { getPermissionRequest } from '../services/Nofification.services.js';


const router = Router();

router.get('/getPermissionRequest', getPermissionRequest);

//router.post("/requestPermission",requestPermission)

export default router;