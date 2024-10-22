import express from "express";
import { addRole, deleteRole, editRole, getAllRoles, getFilteredRoles, getRoleById } from "../../controllers/roleController.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { verifyToken } from "../../middlewares/jwtToken.js";
import checkPermission from "../../middlewares/auth.js";

const router = express.Router();

router.post("/addrole", verifyToken, checkPermission("roles","create"), asyncHandler(addRole));
router.get("/getallroles", verifyToken, checkPermission("roles","view"), asyncHandler(getAllRoles));
router.get("/getfilteredroles",verifyToken,checkPermission("roles","view"),asyncHandler(getFilteredRoles))
router.get("/getrole/:id", verifyToken, checkPermission("roles","view"), asyncHandler(getRoleById));
router.put("/editrole/:id", verifyToken, checkPermission("roles","edit"), asyncHandler(editRole));
router.delete("/deleterole/:id", verifyToken, checkPermission("roles","delete"), asyncHandler(deleteRole));

export default router;
