import express from "express";
import studentController from "../controllers/student.js";
import validation from "../middleware/validation.js";
import checkToken from "../middleware/checkToken.js";
import checkRole from "../middleware/checkRole.js";
import { ADMINS } from "../utils/roles.js";

const router = express.Router();

router.get('/student', checkToken, checkRole(...ADMINS), studentController.getAllStudents);
router.get('/student/:studentId', checkToken, checkRole(...ADMINS), validation.checkId, studentController.getOneStudent);
router.post('/student', checkToken, checkRole(...ADMINS), validation.createStudent, studentController.createStudent);
router.put('/student/:studentId', checkToken, checkRole(...ADMINS), validation.checkId, validation.updateStudent, studentController.updateStudent);
router.delete('/student/:studentId', checkToken, checkRole(...ADMINS), validation.checkId, studentController.deleteStudent);

export default router;
