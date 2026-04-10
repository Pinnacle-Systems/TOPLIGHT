import { Router } from 'express';
import { get, getCapPlanData, getFabStsData, getOcrPending, getOrderStatusBuyerWise, getPlanedVsActualSalesVal, getPreBudget, getProfitLossData, getShippedData, getWIPData, getYFActVsPln } from '../services/orderManagement.service.js';
import { getFilterEmployees } from '../services/misDashboard.service.js';





const router = Router();

router.get('/', get);

router.get('/getShippedData', getShippedData);

router.get('/getOcrPending', getOcrPending);

router.get('/getWIPData', getWIPData);

router.get('/getProfitLossData', getProfitLossData)

router.get('/getCapPlanData', getCapPlanData)

router.get('/getFabStsData', getFabStsData)

router.get('/getYFActVsPln', getYFActVsPln)

router.get('/getPreBudget', getPreBudget)

router.get('/orderStsBuyerWise', getOrderStatusBuyerWise)

router.get('/plannedVsActualSalesval', getPlanedVsActualSalesVal)



export default router;