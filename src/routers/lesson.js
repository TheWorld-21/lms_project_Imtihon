import express from "express";
import lessonController from "../controllers/lesson.js";
import validation from "../middleware/validation.js";
import checkToken from "../middleware/checkToken.js";
import checkRole from "../middleware/checkRole.js";
import { MANAGERS } from "../utils/roles.js";

const router = express.Router();

router.get('/lesson', checkToken, lessonController.getAllLessons);
router.get('/lesson/:lessonId', checkToken, validation.checkId, lessonController.getOneLesson);
router.post('/lesson', checkToken, checkRole(...MANAGERS), validation.createLesson, lessonController.createLesson);
router.put('/lesson/:lessonId', checkToken, checkRole(...MANAGERS), validation.checkId, validation.updateLesson, lessonController.updateLesson);
router.delete('/lesson/:lessonId', checkToken, checkRole(...MANAGERS), validation.checkId, lessonController.deleteLesson);

export default router;
