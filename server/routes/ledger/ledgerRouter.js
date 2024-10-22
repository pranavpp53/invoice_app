import express from 'express';
import { createLedgerData, deleteLedger, editLedger, getAllLedgerData } from '../../controllers/ledgerController.js';
import { verifyToken } from '../../middlewares/jwtToken.js';
import checkPermission from '../../middlewares/auth.js';


const router=express.Router();


//add ledger
router.post('/addledger',verifyToken,checkPermission("ledger","create"),createLedgerData)

router.get('/getallledger',verifyToken,checkPermission("ledger","view"),getAllLedgerData)

router.put('/editledger/:id',verifyToken,checkPermission("ledger","edit"),editLedger)

router.delete('/deleteledger/:id',verifyToken,checkPermission("ledger","delete"),deleteLedger)

export default router