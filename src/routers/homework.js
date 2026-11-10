import express from "express";
import homeworkController from "../controllers/homework.js";
import validation from "../middleware/validation.js";
import checkToken from "../middleware/checkToken.js";
import checkRole from "../middleware/checkRole.js";
import { MANAGERS } from "../utils/roles.js";

const router = express.Router();

router.get('/homework', checkToken, homeworkController.getAllHomeworks);
router.post('/homework', checkToken, checkRole(...MANAGERS), validation.createHomework, homeworkController.createHomework);
router.put('/homework/:homeworkId', checkToken, checkRole(...MANAGERS), validation.checkId, validation.updateHomework, homeworkController.updateHomework);
router.delete('/homework/:homeworkId', checkToken, checkRole(...MANAGERS), validation.checkId, homeworkController.deleteHomework);

export default router;
