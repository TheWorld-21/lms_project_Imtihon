import pool from "../config/db.js";
import { InternalServerError } from "../utils/error.js";
import getPagination from "../utils/pagination.js";

class ResultService {
    async getAllResults(req, res, next) {
        try {
            const { page, limit, offset } = getPagination(req.query);
            const { sectionId, studentId, passed } = req.query;

            let where = "where 1=1";
            let params = [];

            if (req.user.role === "student") {
                params.push(req.user.id);
                where += ` and results.student_id=$${params.length}`;
            } else if (studentId) {
                params.push(studentId);
                where += ` and results.student_id=$${params.length}`;
            }

            if (sectionId) {
                params.push(sectionId);
                where += ` and results.section_id=$${params.length}`;
            }

            if (passed === "true" || passed === "false") {
                params.push(passed);
                where += ` and results.passed=$${params.length}`;
            }

            let count = await pool.query(`select count(*) from results ${where}`, params);

            params.push(limit, offset);

            let data = await pool.query(
                `select results.*, students.fullname as student_name, sections.name as section_name, courses.name as course_name
                from results
                join students on students.id = results.student_id
                join sections on sections.id = results.section_id
                join courses on courses.id = sections.course_id
                ${where} order by results.id desc limit $${params.length - 1} offset $${params.length}`,
                params
            );

            return {
                status: 200,
                page: page,
                limit: limit,
                total: Number(count.rows[0].count),
                data: data.rows
            }
        } catch (error) {
            return next(new InternalServerError(500, error.message));
        }
    }
}

const resultService = new ResultService();

export default resultService;
