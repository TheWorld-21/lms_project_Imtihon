import { ValidationError } from "../utils/error.js";
import schemas from "../utils/validation.js";

function check(schema) {
    return (req, res, next) => {
        let { error } = schema.validate(req.body || {});

        if (error) {
            return next(new ValidationError(400, error.message));
        }

        return next();
    }
}

export default {
    checkId: (req, res, next) => {
        for (let key in req.params) {
            if (isNaN(req.params[key])) {
                return next(new ValidationError(400, `${key} must be a number`));
            }
        }

        return next();
    },

    login: check(schemas.loginSchema),
    refresh: check(schemas.refreshSchema),

    createStaff: check(schemas.staffSchema),
    updateStaff: check(schemas.updateStaffSchema),

    createTeacher: check(schemas.teacherSchema),
    updateTeacher: check(schemas.updateTeacherSchema),

    createStudent: check(schemas.studentSchema),
    updateStudent: check(schemas.updateStudentSchema),

    createCourse: check(schemas.courseSchema),
    updateCourse: check(schemas.updateCourseSchema),

    createSection: check(schemas.sectionSchema),
    updateSection: check(schemas.updateSectionSchema),

    createLesson: check(schemas.lessonSchema),
    updateLesson: check(schemas.updateLessonSchema),

    createMaterial: check(schemas.materialSchema),

    createHomework: check(schemas.homeworkSchema),
    updateHomework: check(schemas.updateHomeworkSchema),

    createExam: check(schemas.examSchema),
    updateExam: check(schemas.updateExamSchema),
    submitExam: check(schemas.submitExamSchema)
}
