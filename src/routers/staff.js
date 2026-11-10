import express from "express";
import staffController from "../controllers/staff.js"
import validation from "../middleware/validation.js";
import checkToken from "../middleware/checkToken.js";
import checkRole from "../middleware/checkRole.js";
import { ADMINS } from "../utils/roles.js";

const router = express.Router();

router.get('/staff', checkToken, checkRole(...ADMINS), staffController.getAllStaff);
router.get('/staff/:userId', checkToken, checkRole(...ADMINS), validation.checkId, staffController.getOneStaff);
router.post('/staff', validation.createStaff, staffController.createStaff);
router.put('/staff/:userId', checkToken, checkRole(...ADMINS), validation.checkId, validation.updateStaff, staffController.updateStaff);
router.delete('/staff/:userId', checkToken, checkRole(...ADMINS), validation.checkId, staffController.deleteStaff);

export default router;
