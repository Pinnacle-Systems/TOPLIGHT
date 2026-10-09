import { Router } from 'express';

import {
    get
} from '../services/supplier.service.js'

const router = Router();

router.get('/', get);

export default router;