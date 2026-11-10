import express from "express";
import teacherController from "../controllers/teacher.js";
import validation from "../middleware/validation.js";
import checkToken from "../middleware/checkToken.js";
import checkRole from "../middleware/checkRole.js";
import { ADMINS } from "../utils/roles.js";

const router = express.Router();

router.get('/teacher', checkToken, teacherController.getAllTeachers);
router.get('/teacher/:teacherId', checkToken, validation.checkId, teacherController.getOneTeacher);
router.post('/teacher', checkToken, checkRole(...ADMINS), validation.createTeacher, teacherController.createTeacher);
router.put('/teacher/:teacherId', checkToken, checkRole(...ADMINS), validation.checkId, validation.updateTeacher, teacherController.updateTeacher);
router.delete('/teacher/:teacherId', checkToken, checkRole(...ADMINS), validation.checkId, teacherController.deleteTeacher);

export default router;
