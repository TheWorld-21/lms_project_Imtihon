import express from "express";
import courseController from "../controllers/course.js";
import validation from "../middleware/validation.js";
import checkToken from "../middleware/checkToken.js";
import checkRole from "../middleware/checkRole.js";
import { ADMINS } from "../utils/roles.js";

const router = express.Router();

router.get('/course', checkToken, courseController.getAllCourses);
router.get('/course/:courseId', checkToken, validation.checkId, courseController.getOneCourse);
router.post('/course', checkToken, checkRole(...ADMINS), validation.createCourse, courseController.createCourse);
router.put('/course/:courseId', checkToken, checkRole(...ADMINS), validation.checkId, validation.updateCourse, courseController.updateCourse);
router.delete('/course/:courseId', checkToken, checkRole(...ADMINS), validation.checkId, courseController.deleteCourse);

export default router;
