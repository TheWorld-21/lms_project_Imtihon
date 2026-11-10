import Joi from 'joi';

const phone = Joi.string().pattern(/^998(9[0123456789]|3[3]|7[1]|8[8]|5[05]|2[0]|7[7])[0-9]{7}$/);

export default {
    loginSchema: Joi.object({
        phone: Joi.string().required(),
        password: Joi.string().required()
    }),

    refreshSchema: Joi.object({
        refreshToken: Joi.string().required()
    }),

    staffSchema: Joi.object({
        fullname: Joi.string().min(3).max(30).required(),
        phone: phone.required(),
        password: Joi.string().min(6).required(),
        role: Joi.string().valid("admin", "assistant").required()
    }),

    updateStaffSchema: Joi.object({
        fullname: Joi.string().min(3).max(30),
        phone: phone,
        password: Joi.string().min(6),
        role: Joi.string().valid("admin", "assistant"),
        status: Joi.string().valid("active", "inactive")
    }),

    teacherSchema: Joi.object({
        fullname: Joi.string().min(3).max(30).required(),
        phone: phone.required(),
        password: Joi.string().min(6).required(),
        experience: Joi.number().min(0).required(),
        job: Joi.string().max(100).required(),
        description: Joi.string().allow(""),
        portfolio: Joi.string().uri().allow(""),
        github: Joi.string().uri().allow("")
    }),

    updateTeacherSchema: Joi.object({
        fullname: Joi.string().min(3).max(30),
        phone: phone,
        password: Joi.string().min(6),
        experience: Joi.number().min(0),
        job: Joi.string().max(100),
        description: Joi.string().allow(""),
        portfolio: Joi.string().uri().allow(""),
        github: Joi.string().uri().allow(""),
        status: Joi.string().valid("active", "inactive")
    }),

    studentSchema: Joi.object({
        fullname: Joi.string().min(3).max(30).required(),
        phone: phone.required(),
        password: Joi.string().min(6).required()
    }),

    updateStudentSchema: Joi.object({
        fullname: Joi.string().min(3).max(30),
        phone: phone,
        password: Joi.string().min(6),
        status: Joi.string().valid("active", "inactive")
    }),

    courseSchema: Joi.object({
        name: Joi.string().min(2).max(100).required(),
        about: Joi.string().allow(""),
        price: Joi.number().min(0).required(),
        level: Joi.string().valid("beginner", "intermediate", "advanced").required(),
        teacher_id: Joi.number().required(),
        published: Joi.boolean()
    }),

    updateCourseSchema: Joi.object({
        name: Joi.string().min(2).max(100),
        about: Joi.string().allow(""),
        price: Joi.number().min(0),
        level: Joi.string().valid("beginner", "intermediate", "advanced"),
        teacher_id: Joi.number(),
        published: Joi.boolean()
    }),

    sectionSchema: Joi.object({
        name: Joi.string().min(2).max(100).required(),
        course_id: Joi.number().required()
    }),

    updateSectionSchema: Joi.object({
        name: Joi.string().min(2).max(100).required()
    }),

    lessonSchema: Joi.object({
        name: Joi.string().min(2).max(100).required(),
        about: Joi.string().allow(""),
        section_id: Joi.number().required()
    }),

    updateLessonSchema: Joi.object({
        name: Joi.string().min(2).max(100),
        about: Joi.string().allow("")
    }),

    materialSchema: Joi.object({
        name: Joi.string().min(2).max(100).required(),
        lesson_id: Joi.number().required()
    }),

    homeworkSchema: Joi.object({
        task: Joi.string().min(2).required(),
        lesson_id: Joi.number().required()
    }),

    updateHomeworkSchema: Joi.object({
        task: Joi.string().min(2).required()
    }),

    examSchema: Joi.object({
        section_id: Joi.number().required(),
        question: Joi.string().min(2).required(),
        variant_a: Joi.string().required(),
        variant_b: Joi.string().required(),
        variant_c: Joi.string().required(),
        variant_d: Joi.string().required(),
        answer: Joi.string().valid("A", "B", "C", "D").required()
    }),

    updateExamSchema: Joi.object({
        question: Joi.string().min(2),
        variant_a: Joi.string(),
        variant_b: Joi.string(),
        variant_c: Joi.string(),
        variant_d: Joi.string(),
        answer: Joi.string().valid("A", "B", "C", "D")
    }),

    submitExamSchema: Joi.object({
        answers: Joi.object().pattern(Joi.string(), Joi.string().valid("A", "B", "C", "D")).required()
    })
}
