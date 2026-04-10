import { Router } from 'express';

import { get, getArticleId, getFinYr, getSupplier, getSuppEfficency, getTopItems, getMonthlyReceivables, getTopFiveSuppTurnOvr, getOverAllSupplierContribution, getMostPaidTaxVal } from '../services/podata.service.js'

const router = Router();

router.get('/', get);

router.get('/getFinYr', getFinYr)

router.get('/getSupplier', getSupplier)

router.get('/getArticleId', getArticleId)

router.get('/getSuppEfficency', getSuppEfficency)

router.get('/getTopItems', getTopItems)

router.get('/getMonthlyReceivables', getMonthlyReceivables)

router.get('/getTopFiveSuppTurnOvr', getTopFiveSuppTurnOvr)

router.get('/getOverAllSupplierContribution', getOverAllSupplierContribution)

router.get('/getMostPaidTaxVal', getMostPaidTaxVal)

export default router;