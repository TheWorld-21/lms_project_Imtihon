import express from "express";
import examController from "../controllers/exam.js";
import validation from "../middleware/validation.js";
import checkToken from "../middleware/checkToken.js";
import checkRole from "../middleware/checkRole.js";
import { MANAGERS } from "../utils/roles.js";

const router = express.Router();

router.get('/exam', checkToken, checkRole(...MANAGERS), examController.getAllExams);
router.post('/exam', checkToken, checkRole(...MANAGERS), validation.createExam, examController.createExam);
router.put('/exam/:examId', checkToken, checkRole(...MANAGERS), validation.checkId, validation.updateExam, examController.updateExam);
router.delete('/exam/:examId', checkToken, checkRole(...MANAGERS), validation.checkId, examController.deleteExam);

router.get('/exam/test/:sectionId', checkToken, checkRole("student"), validation.checkId, examController.getTest);
router.post('/exam/test/:sectionId', checkToken, checkRole("student"), validation.checkId, validation.submitExam, examController.submitTest);

export default router;
