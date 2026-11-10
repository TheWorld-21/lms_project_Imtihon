import staffRouter from "../routers/staff.js";
import authRouter from "../routers/auth.js"
import teacherRouter from "../routers/teacher.js"
import studentRouter from "../routers/student.js";
import courseRouter from "../routers/course.js";
import sectionRouter from "../routers/section.js";
import lessonRouter from "../routers/lesson.js";
import materialRouter from "../routers/material.js";
import homeworkRouter from "../routers/homework.js";
import examRouter from "../routers/exam.js";
import resultRouter from "../routers/result.js";
import express from "express";

const main = express.Router();

main.use(
    "/api/v1",
    staffRouter,
    authRouter,
    teacherRouter,
    studentRouter,
    courseRouter,
    sectionRouter,
    lessonRouter,
    materialRouter,
    homeworkRouter,
    examRouter,
    resultRouter
);

export default main;
