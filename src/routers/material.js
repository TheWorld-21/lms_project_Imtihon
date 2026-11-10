import express from "express";
import materialController from "../controllers/material.js";
import validation from "../middleware/validation.js";
import checkToken from "../middleware/checkToken.js";
import checkRole from "../middleware/checkRole.js";
import { MANAGERS } from "../utils/roles.js";

const router = express.Router();

router.get('/material', checkToken, materialController.getAllMaterials);
router.post('/material', checkToken, checkRole(...MANAGERS), validation.createMaterial, materialController.createMaterial);
router.delete('/material/:materialId', checkToken, checkRole(...MANAGERS), validation.checkId, materialController.deleteMaterial);

export default router;
