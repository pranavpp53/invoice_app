import express from 'express';
import { addCustomer, customerLogin, deleteCustomer, editCustomer, getPlanValues, getSingleCustomer, getUniqueCustomerCode, listCustomers } from '../../controllers/customerController.js';
import { verifyToken } from '../../middlewares/jwtToken.js';
import checkPermission from '../../middlewares/auth.js';


const router=express.Router();

router.post('/addnewcustomer',verifyToken,checkPermission("customer","create"),addCustomer)
router.put('/editcustomer/:id', verifyToken, checkPermission("customer","edit"),editCustomer)
router.delete('/deletecustomer/:id',verifyToken,checkPermission("customer","delete"),deleteCustomer)
router.get('/listofcustomers',verifyToken,checkPermission("customer","view"),listCustomers)
router.get('/getplanvalues',verifyToken,getPlanValues)
// router.post('/logincustomer',customerLogin)
router.get('/getsinglecustomer/:id',verifyToken,getSingleCustomer)
router.get('/getcustomercode',verifyToken,getUniqueCustomerCode)

export default router