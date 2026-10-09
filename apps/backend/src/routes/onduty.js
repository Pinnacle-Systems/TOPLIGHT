
import { Router } from 'express';
import { Add__vechilekm, addOnduty_master, get__Date_Wise_Fuel, get__Date_Wise_Fuel_Individual, get__Onduty, get__Onduty_edit, get__Vechile, get__vechilekm, get_all_Onduty_reason, get_history_location, get_live_location, get_live_user, get_reached, get_Uploaded_IMAG, getDocId, getIn, requestOnduty, requestonduty_Approval, requestOndutyOut, requestReachedOut, send_location, stTrack } from '../services/Onduty.service.js';
import { upload } from '../Utiles/Multer.js';






const router = Router();

router.get("/",get__Onduty)
router.get("/get__Onduty_edit",get__Onduty_edit)
router.post('/requestOnduty',upload?.single("file"), requestOnduty);
router.post('/requestOndutyOut', requestOndutyOut);
router.post("/requestonduty_Approval",requestonduty_Approval)
router.post("/addOnduty_master",addOnduty_master)
router.get("/get_all_Onduty_reason",get_all_Onduty_reason)
router.get('/getDocId', getDocId);
router.get("/Onduty_uploaded_image",get_Uploaded_IMAG)
router.get('/getIn', getIn);
router?.get("/get__Vechile",get__Vechile)
router?.get("/get_history_location",get_history_location)
router?.get("/get__Date_Wise_Fuel",get__Date_Wise_Fuel)
router?.get("/get__Date_Wise_Fuel_Individual",get__Date_Wise_Fuel_Individual)
router?.post("/send_location",send_location)
router?.get("/get_live_location",get_live_location)
router?.get("/get_live_user",get_live_user)
router?.get("/get_reached",get_reached)
router?.get("/get__vechilekm",get__vechilekm)
router?.post("/add__vechilekm",Add__vechilekm)
router?.post("/stTrack",stTrack)
router?.post("/requestReachedOut",requestReachedOut)
router.get("/redir",(req,res)=>{
  res?.json({status:1})
})
//router.post("/requestPermission",requestPermission)

export default router;