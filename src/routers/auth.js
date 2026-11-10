import express from "express";
import authController from "../controllers/auth.js";
import validation from "../middleware/validation.js";

const router = express.Router();

router.post('/auth/login', validation.login, authController.login);
router.post('/auth/teacher/login', validation.login, authController.teacherLogin);
router.post('/auth/student/login', validation.login, authController.studentLogin);
router.post('/auth/refresh', validation.refresh, authController.refresh);

export default router;
