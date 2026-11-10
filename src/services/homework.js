import pool from "../config/db.js";
import { InternalServerError, NotFoundError, ValidationError } from "../utils/error.js";
import { uploadFile, deleteFile } from "../utils/upload.js";

class HomeworkService {
    async getAllHomeworks(req, res, next) {
        try {
            const { lessonId } = req.query;

            if (!lessonId || isNaN(lessonId)) {
                return next(new ValidationError(400, "lessonId is required!"));
            }

            let data = await pool.query("select * from homeworks where lesson_id=$1 order by id", [lessonId]);

            return {
                status: 200,
                data: data.rows
            }
        } catch (error) {
            return next(new InternalServerError(500, error.message));
        }
    }

    async createHomework(req, res, next) {
        try {
            const { task, lesson_id } = req.body;

            let lesson = await pool.query("select * from lessons where id=$1", [lesson_id]);

            if (!lesson.rows.length) {
                return next(new NotFoundError(404, "Lesson not found!"));
            }

            let file = null;

            if (req.files && req.files.file) {
                file = await uploadFile(req.files.file, "homeworks");
            }

            let data = await pool.query(
                "insert into homeworks (task, file, lesson_id) values ($1, $2, $3) returning *",
                [task, file, lesson_id]
            );

            return {
                status: 201,
                message: "Homework created successfully!",
                data: data.rows[0]
            }
        } catch (error) {
            return next(new InternalServerError(500, error.message));
        }
    }

    async updateHomework(req, res, next) {
        try {
            const { homeworkId } = req.params;
            const { task } = req.body;

            let exist = await pool.query("select * from homeworks where id=$1", [homeworkId]);

            if (!exist.rows.length) {
                return next(new NotFoundError(404, "Homework not found!"));
            }

            let file = exist.rows[0].file;

            if (req.files && req.files.file) {
                file = await uploadFile(req.files.file, "homeworks");
                deleteFile("homeworks", exist.rows[0].file);
            }

            await pool.query("update homeworks set task=$1, file=$2 where id=$3", [task, file, homeworkId]);

            return {
                status: 200,
                message: "Homework updated successfully!"
            }
        } catch (error) {
            return next(new InternalServerError(500, error.message));
        }
    }

    async deleteHomework(req, res, next) {
        try {
            const { homeworkId } = req.params;

            let exist = await pool.query("select * from homeworks where id=$1", [homeworkId]);

            if (!exist.rows.length) {
                return next(new NotFoundError(404, "Homework not found!"));
            }

            await pool.query("delete from homeworks where id=$1", [homeworkId]);
            deleteFile("homeworks", exist.rows[0].file);

            return {
                status: 200,
                message: "Homework deleted successfully!"
            }
        } catch (error) {
            return next(new InternalServerError(500, error.message));
        }
    }
}

const homeworkService = new HomeworkService();

export default homeworkService;
