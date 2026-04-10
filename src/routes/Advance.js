import { Router } from 'express';
import { add_requestAdvance, get__Advance, get_advance, get_Paycode, getDocId, requestLoan_Approval } from '../services/Advance.service.js';


const router = Router();
router.get('/', get__Advance);
router.post("/add_requestAdvance",add_requestAdvance)
router.get('/getDocId', getDocId);
router.get("/get_Advance",get_advance)
router?.post("/requestAdvance_Approval",requestLoan_Approval)
router?.get("/get_Paycode",get_Paycode)


export default router;