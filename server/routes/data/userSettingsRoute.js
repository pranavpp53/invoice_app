import express from 'express';
import { applyNewSettingsChange, getSettings } from '../../controllers/userSettingsController.js';
import asyncHandler from '../../utils/asyncHandler.js';
import { verifyToken } from '../../middlewares/jwtToken.js';

const router=express.Router();

router.post('/applynewsettings/:id',verifyToken,asyncHandler(applyNewSettingsChange))
router.get('/getsettingsdata/:id',verifyToken,asyncHandler(getSettings))

export default router