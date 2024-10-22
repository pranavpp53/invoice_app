import express from "express";
import { addPlan, fetchplans } from "../../controllers/planController.js";
import { verifyToken } from "../../middlewares/jwtToken.js";


const router = express.Router();

router.post("/addplan",verifyToken, addPlan)

export default router;
