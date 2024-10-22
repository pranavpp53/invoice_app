import express from 'express';

import userRouter from './users/userRouter.js';
import roleRouter from './roles/roleRouter.js';
import customerRouter from './customer/customerRoute.js';
import invoiceDataRouter from './openAi/invoiceDataRouter.js';
import userSettingsRouter from './data/userSettingsRoute.js';
import ledgerRouter from './ledger/ledgerRouter.js';




const router = express.Router();

router.use('/users',userRouter)
router.use('/roles',roleRouter)
router.use('/customer',customerRouter)
router.use('/openai',invoiceDataRouter)
router.use('/settings',userSettingsRouter)
router.use('/ledger',ledgerRouter)

export default router;
