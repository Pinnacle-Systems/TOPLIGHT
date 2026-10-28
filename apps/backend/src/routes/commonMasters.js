import { Router } from 'express';
import {
  chat,
  delete_Common_Data,
  get,
  get_chat,
  getBuyer,
  getCompCodeData,
  getMonthData,
  Update_Common_Data_prisma,
  getFinancialYears,
  getBuyers,
  getMonths,
  getCompanyCodesData,
  getChatMessages,
  sendChatMessage,
  deleteCommonData,
  updateCommonData,
} from '../services/commonMasters.service.js';

const router = Router();

// ── Financial Years & Masters ───────────────────────────────────────────────
router.get('/', get);
router.get('/financial-years', getFinancialYears);

// ── Buyers & Companies ─────────────────────────────────────────────────────
router.get('/getBuyer', getBuyer);
router.get('/buyers', getBuyers);
router.get('/getMonth', getMonthData);
router.get('/months', getMonths);
router.get('/getCompCodeData', getCompCodeData);
router.get('/company-codes', getCompanyCodesData);

// ── Real-Time Chat ─────────────────────────────────────────────────────────
router.get('/get_chat', get_chat);
router.get('/chat', getChatMessages);
router.get('/chat/messages', getChatMessages);
router.post('/chat', chat);
router.post('/chat/send', sendChatMessage);

// ── Generic Prisma Master Data Operations ──────────────────────────────────
router.post('/update', Update_Common_Data_prisma);
router.put('/update', updateCommonData);
router.post('/delete', delete_Common_Data);
router.delete('/delete', deleteCommonData);

export default router;
