import pool from "../config/db.js";
import { InternalServerError, NotFoundError, ValidationError } from "../utils/error.js";

class ExamService {
    async getAllExams(req, res, next) {
        try {
            const { sectionId } = req.query;

            if (!sectionId || isNaN(sectionId)) {
                return next(new ValidationError(400, "sectionId is required!"));
            }

            let data = await pool.query("select * from exams where section_id=$1 order by id", [sectionId]);

            return {
                status: 200,
                data: data.rows
            }
        } catch (error) {
            return next(new InternalServerError(500, error.message));
        }
    }

    async createExam(req, res, next) {
        try {
            const { section_id, question, variant_a, variant_b, variant_c, variant_d, answer } = req.body;

            let section = await pool.query("select * from sections where id=$1", [section_id]);

            if (!section.rows.length) {
                return next(new NotFoundError(404, "Section not found!"));
            }

            let data = await pool.query(
                `insert into exams (section_id, question, variant_a, variant_b, variant_c, variant_d, answer)
                values ($1, $2, $3, $4, $5, $6, $7) returning *`,
                [section_id, question, variant_a, variant_b, variant_c, variant_d, answer]
            );

            return {
                status: 201,
                message: "Question created successfully!",
                data: data.rows[0]
            }
        } catch (error) {
            return next(new InternalServerError(500, error.message));
        }
    }

    async updateExam(req, res, next) {
        try {
            const { examId } = req.params;

            let exist = await pool.query("select * from exams where id=$1", [examId]);

            if (!exist.rows.length) {
                return next(new NotFoundError(404, "Question not found!"));
            }

            let exam = exist.rows[0];

            let question = req.body.question || exam.question;
            let variantA = req.body.variant_a || exam.variant_a;
            let variantB = req.body.variant_b || exam.variant_b;
            let variantC = req.body.variant_c || exam.variant_c;
            let variantD = req.body.variant_d || exam.variant_d;
            let answer = req.body.answer || exam.answer;

            await pool.query(
                "update exams set question=$1, variant_a=$2, variant_b=$3, variant_c=$4, variant_d=$5, answer=$6 where id=$7",
                [question, variantA, variantB, variantC, variantD, answer, examId]
            );

            return {
                status: 200,
                message: "Question updated successfully!"
            }
        } catch (error) {
            return next(new InternalServerError(500, error.message));
        }
    }

    async deleteExam(req, res, next) {
        try {
            const { examId } = req.params;

            let exist = await pool.query("select * from exams where id=$1", [examId]);

            if (!exist.rows.length) {
                return next(new NotFoundError(404, "Question not found!"));
            }

            await pool.query("delete from exams where id=$1", [examId]);

            return {
                status: 200,
                message: "Question deleted successfully!"
            }
        } catch (error) {
            return next(new InternalServerError(500, error.message));
        }
    }

    async getTest(req, res, next) {
        try {
            const { sectionId } = req.params;

            let section = await pool.query("select * from sections where id=$1", [sectionId]);

            if (!section.rows.length) {
                return next(new NotFoundError(404, "Section not found!"));
            }

            let data = await pool.query(
                "select id, question, variant_a, variant_b, variant_c, variant_d from exams where section_id=$1 order by id",
                [sectionId]
            );

            return {
                status: 200,
                data: data.rows
            }
        } catch (error) {
            return next(new InternalServerError(500, error.message));
        }
    }

    async submitTest(req, res, next) {
        try {
            const { sectionId } = req.params;
            const { answers } = req.body;

            let section = await pool.query("select * from sections where id=$1", [sectionId]);

            if (!section.rows.length) {
                return next(new NotFoundError(404, "Section not found!"));
            }

            let questions = await pool.query("select id, answer from exams where section_id=$1", [sectionId]);

            if (!questions.rows.length) {
                return next(new NotFoundError(404, "This section has no questions!"));
            }

            let correct = 0;

            questions.rows.forEach((question) => {
                if (answers[question.id] === question.answer) {
                    correct++;
                }
            });

            let wrong = questions.rows.length - correct;
            let passed = correct / questions.rows.length >= 0.6;

            let data = await pool.query(
                "insert into results (student_id, section_id, correct, wrong, passed) values ($1, $2, $3, $4, $5) returning *",
                [req.user.id, sectionId, correct, wrong, passed]
            );

            return {
                status: 201,
                message: passed ? "Congratulations, you passed!" : "You didn't pass, try again!",
                data: data.rows[0]
            }
        } catch (error) {
            return next(new InternalServerError(500, error.message));
        }
    }
}

const examService = new ExamService();

export default examService;
