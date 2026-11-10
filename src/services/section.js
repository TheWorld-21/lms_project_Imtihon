import pool from "../config/db.js";
import { InternalServerError, NotFoundError, ValidationError } from "../utils/error.js";
import { deleteFile } from "../utils/upload.js";

class SectionService {
    async getAllSections(req, res, next) {
        try {
            const { courseId } = req.query;

            if (!courseId || isNaN(courseId)) {
                return next(new ValidationError(400, "courseId is required!"));
            }

            let data = await pool.query(
                `select sections.*, count(lessons.id)::int as lessons_count
                from sections left join lessons on lessons.section_id = sections.id
                where sections.course_id=$1 group by sections.id order by sections.id`,
                [courseId]
            );

            return {
                status: 200,
                data: data.rows
            }
        } catch (error) {
            return next(new InternalServerError(500, error.message));
        }
    }

    async createSection(req, res, next) {
        try {
            const { name, course_id } = req.body;

            let course = await pool.query("select * from courses where id=$1", [course_id]);

            if (!course.rows.length) {
                return next(new NotFoundError(404, "Course not found!"));
            }

            let data = await pool.query("insert into sections (name, course_id) values ($1, $2) returning *", [name, course_id]);

            return {
                status: 201,
                message: "Section created successfully!",
                data: data.rows[0]
            }
        } catch (error) {
            return next(new InternalServerError(500, error.message));
        }
    }

    async updateSection(req, res, next) {
        try {
            const { sectionId } = req.params;
            const { name } = req.body;

            let exist = await pool.query("select * from sections where id=$1", [sectionId]);

            if (!exist.rows.length) {
                return next(new NotFoundError(404, "Section not found!"));
            }

            await pool.query("update sections set name=$1 where id=$2", [name, sectionId]);

            return {
                status: 200,
                message: "Section updated successfully!"
            }
        } catch (error) {
            return next(new InternalServerError(500, error.message));
        }
    }

    async deleteSection(req, res, next) {
        try {
            const { sectionId } = req.params;

            let exist = await pool.query("select * from sections where id=$1", [sectionId]);

            if (!exist.rows.length) {
                return next(new NotFoundError(404, "Section not found!"));
            }

            let lessons = await pool.query("select id, video from lessons where section_id=$1", [sectionId]);
            let materials = await pool.query(
                "select materials.file from materials join lessons on lessons.id = materials.lesson_id where lessons.section_id=$1",
                [sectionId]
            );
            let homeworks = await pool.query(
                "select homeworks.file from homeworks join lessons on lessons.id = homeworks.lesson_id where lessons.section_id=$1",
                [sectionId]
            );

            await pool.query("delete from sections where id=$1", [sectionId]);

            lessons.rows.forEach((lesson) => deleteFile("videos", lesson.video));
            materials.rows.forEach((material) => deleteFile("materials", material.file));
            homeworks.rows.forEach((homework) => deleteFile("homeworks", homework.file));

            return {
                status: 200,
                message: "Section deleted successfully!"
            }
        } catch (error) {
            return next(new InternalServerError(500, error.message));
        }
    }
}

const sectionService = new SectionService();

export default sectionService;
