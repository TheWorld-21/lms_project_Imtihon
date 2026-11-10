import express from "express";
import sectionController from "../controllers/section.js";
import validation from "../middleware/validation.js";
import checkToken from "../middleware/checkToken.js";
import checkRole from "../middleware/checkRole.js";
import { MANAGERS } from "../utils/roles.js";

const router = express.Router();

router.get('/section', checkToken, sectionController.getAllSections);
router.post('/section', checkToken, checkRole(...MANAGERS), validation.createSection, sectionController.createSection);
router.put('/section/:sectionId', checkToken, checkRole(...MANAGERS), validation.checkId, validation.updateSection, sectionController.updateSection);
router.delete('/section/:sectionId', checkToken, checkRole(...MANAGERS), validation.checkId, sectionController.deleteSection);

export default router;
