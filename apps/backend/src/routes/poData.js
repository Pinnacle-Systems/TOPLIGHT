import { Router } from 'express';
import {
  get,
  getArticleId,
  getFinYr,
  getSupplier,
  getSuppEfficency,
  getTopItems,
  getMonthlyReceivables,
  getTopFiveSuppTurnOvr,
  getOverAllSupplierContribution,
  getMostPaidTaxVal,
  getPoSummary,
  getPoFinancialYears,
  getPoSuppliers,
  getPoArticles,
  getSupplierEfficiency,
  getTopPoItems,
  getPoMonthlyReceivables,
  getTopFiveSupplierTurnover,
  getSupplierContribution,
  getMostPaidTaxValue,
} from '../services/poData.service.js';

const router = Router();

// Legacy routes
router.get('/', get);
router.get('/getFinYr', getFinYr);
router.get('/getSupplier', getSupplier);
router.get('/getArticleId', getArticleId);
router.get('/getSuppEfficency', getSuppEfficency);
router.get('/getTopItems', getTopItems);
router.get('/getMonthlyReceivables', getMonthlyReceivables);
router.get('/getTopFiveSuppTurnOvr', getTopFiveSuppTurnOvr);
router.get('/getOverAllSupplierContribution', getOverAllSupplierContribution);
router.get('/getMostPaidTaxVal', getMostPaidTaxVal);

// Standard aliases
router.get('/summary', getPoSummary);
router.get('/financial-years', getPoFinancialYears);
router.get('/suppliers', getPoSuppliers);
router.get('/articles', getPoArticles);
router.get('/efficiency', getSupplierEfficiency);
router.get('/top-items', getTopPoItems);
router.get('/receivables/monthly', getPoMonthlyReceivables);
router.get('/turnover/top-five', getTopFiveSupplierTurnover);
router.get('/supplier-contribution', getSupplierContribution);
router.get('/tax-value', getMostPaidTaxValue);

export default router;
