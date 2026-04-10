import { Router } from 'express';

import { chat, delete_Common_Data, get, get_chat, getBuyer, getCompCodeData, getMonthData, Update_Common_Data_prisma } from '../services/commonMasters.service.js';

const router = Router();
router.get('/', get);
router.get('/getBuyer', getBuyer)
router.get('/getMonth', getMonthData)
router.get('/getCompCodeData', getCompCodeData)
router?.get("/get_chat",get_chat)
router.post('/update',Update_Common_Data_prisma)
router?.post("/chat",chat)
router.post('/delete',delete_Common_Data)

export default router;