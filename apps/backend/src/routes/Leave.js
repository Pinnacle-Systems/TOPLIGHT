import { Router } from 'express';
import { add_requestLeave, get__per, get_Current_Fin_Year, get_Lcode, get_leave_available, get_lcode_leave_available, getDocId, getLeaves, InsertLeave, requestLeave_Approval } from '../services/LeaveData.service.js';


const router = Router();
router.get('/', get__per);
router.get('/leaveReg', InsertLeave);
router.get('/getDocId', getDocId);
router.get("/get_Current_Fin_Year",get_Current_Fin_Year)
router.post("/add_requestLeave",add_requestLeave)
router?.get("/get_Lcode",get_Lcode)
router?.get("/get_leave_available",get_leave_available)
router?.get("/get_lcode_leave_available",get_lcode_leave_available)
router?.post("/requestLeave_Approval",requestLeave_Approval)
router?.get("/getLeaves",getLeaves)

export default router;