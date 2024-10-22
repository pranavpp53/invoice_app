import express from 'express';
import { changeDocumentStatus, changeInvoiceStatus, deleteSingleDocument, deleteSingleInvoiceData, editSingleDocument, editSingleInvoice, getAllDocuments, getAllInvoices, getCustomerWiseDocument, getDocumentWiseInvoice, getSingleDocument, getSingleInvoiceData, getUniqueDocumentName, invoiceDataFetchByImage } from '../../controllers/openAiController.js';
import { verifyToken } from '../../middlewares/jwtToken.js';
import checkPermission from '../../middlewares/auth.js';
import { addManualInvoices } from '../../controllers/manualInvoiceController.js';

const router=express.Router();


//other
router.post('/invoicedataprocess',verifyToken,checkPermission("documents","create"),invoiceDataFetchByImage)
router.get('/documentsofcustomer/:id',verifyToken,checkPermission("documents","view"),getCustomerWiseDocument)
router.get('/invoicesindocument/:id',verifyToken,checkPermission("documents","view"),getDocumentWiseInvoice)
router.get('/getalldocuments',verifyToken,checkPermission("documents","view"),getAllDocuments)

//single document
router.delete('/deletedocument/:id',verifyToken,checkPermission("documents","delete"),deleteSingleDocument)
router.patch('/editsingledocument/:id',verifyToken,checkPermission("documents","edit"),editSingleDocument)
router.get('/getsingledocument/:id',verifyToken,checkPermission("documents","view"),getSingleDocument)
router.get('/uniquetitlecode',verifyToken,checkPermission("documents","create"),getUniqueDocumentName)
//change invoice status
router.patch('/changeinvoicestatus/:id',verifyToken,checkPermission("documentStatus","edit"),changeInvoiceStatus)
//change document status
router.patch('/changedocumentstatus/:id',verifyToken,checkPermission("documentStatus","edit"),changeDocumentStatus)
//get all filtered invoice for export
router.get('/getallinvoices',verifyToken,checkPermission("documents","view"),getAllInvoices)

//single invoices
router.get('/getsingleinvoice/:id',verifyToken,checkPermission("documents","view"),getSingleInvoiceData)
router.delete('/deleteinvoicedata/:id',verifyToken,checkPermission("documents","delete"),deleteSingleInvoiceData)
router.patch('/editsingleinvoice/:id',verifyToken,checkPermission("documents","edit"),editSingleInvoice)

//manual invoice
router.post('/addmanualinvoice',verifyToken,checkPermission("documents","create"),addManualInvoices)






export default router