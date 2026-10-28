import { Router } from 'express';
import {
  get,
  getCapPlanData,
  getFabStsData,
  getOcrPending,
  getOrderStatusBuyerWise,
  getPlanedVsActualSalesVal,
  getPreBudget,
  getProfitLossData,
  getShippedData,
  getWIPData,
  getYFActVsPln,
  getOrderManagement,
  getShippedOrders,
  getPendingOcr,
  getWorkInProgressData,
  getProfitAndLossData,
  getCapacityPlanData,
  getFabricStatusData,
  getYfActualVsPlanned,
  getPreBudgetSummary,
  getOrderStatusByBuyer,
  getPlannedVsActualSalesValue,
} from '../services/orderManagement.service.js';

const router = Router();

// Legacy routes
router.get('/', get);
router.get('/getShippedData', getShippedData);
router.get('/getOcrPending', getOcrPending);
router.get('/getWIPData', getWIPData);
router.get('/getProfitLossData', getProfitLossData);
router.get('/getCapPlanData', getCapPlanData);
router.get('/getFabStsData', getFabStsData);
router.get('/getYFActVsPln', getYFActVsPln);
router.get('/getPreBudget', getPreBudget);
router.get('/orderStsBuyerWise', getOrderStatusBuyerWise);
router.get('/plannedVsActualSalesval', getPlanedVsActualSalesVal);

// Standard aliases
router.get('/summary', getOrderManagement);
router.get('/shipped', getShippedOrders);
router.get('/ocr-pending', getPendingOcr);
router.get('/wip', getWorkInProgressData);
router.get('/profit-loss', getProfitAndLossData);
router.get('/capacity-plan', getCapacityPlanData);
router.get('/fabric-status', getFabricStatusData);
router.get('/actual-vs-planned', getYfActualVsPlanned);
router.get('/pre-budget', getPreBudgetSummary);
router.get('/buyer-status', getOrderStatusByBuyer);
router.get('/planned-vs-actual-sales', getPlannedVsActualSalesValue);

export default router;
