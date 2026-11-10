import pool from "../config/db.js";
import { InternalServerError, NotFoundError, ValidationError } from "../utils/error.js";
import { uploadFile, deleteFile, isVideo } from "../utils/upload.js";

class LessonService {
    async getAllLessons(req, res, next) {
        try {
            const { sectionId } = req.query;

            if (!sectionId || isNaN(sectionId)) {
                return next(new ValidationError(400, "sectionId is required!"));
            }

            let data = await pool.query("select * from lessons where section_id=$1 order by id", [sectionId]);

            return {
                status: 200,
                data: data.rows
            }
        } catch (error) {
            return next(new InternalServerError(500, error.message));
        }
    }

    async getOneLesson(req, res, next) {
        try {
            const { lessonId } = req.params;

            let data = await pool.query("select * from lessons where id=$1", [lessonId]);

            if (!data.rows.length) {
                return next(new NotFoundError(404, "Lesson not found!"));
            }

            let materials = await pool.query("select * from materials where lesson_id=$1 order by id", [lessonId]);
            let homeworks = await pool.query("select * from homeworks where lesson_id=$1 order by id", [lessonId]);

            let lesson = data.rows[0];
            lesson.materials = materials.rows;
            lesson.homeworks = homeworks.rows;

            return {
                status: 200,
                data: lesson
            }
        } catch (error) {
            return next(new InternalServerError(500, error.message));
        }
    }

    async createLesson(req, res, next) {
        try {
            const { name, about, section_id } = req.body;

            let section = await pool.query("select * from sections where id=$1", [section_id]);

            if (!section.rows.length) {
                return next(new NotFoundError(404, "Section not found!"));
            }

            if (!req.files || !req.files.video) {
                return next(new ValidationError(400, "Video is required!"));
            }

            if (!isVideo(req.files.video)) {
                return next(new ValidationError(400, "File must be a video!"));
            }

            let video = await uploadFile(req.files.video, "videos");

            let data = await pool.query(
                "insert into lessons (name, about, video, section_id) values ($1, $2, $3, $4) returning *",
                [name, about, video, section_id]
            );

            return {
                status: 201,
                message: "Lesson created successfully!",
                data: data.rows[0]
            }
        } catch (error) {
            return next(new InternalServerError(500, error.message));
        }
    }

    async updateLesson(req, res, next) {
        try {
            const { lessonId } = req.params;

            let exist = await pool.query("select * from lessons where id=$1", [lessonId]);

            if (!exist.rows.length) {
                return next(new NotFoundError(404, "Lesson not found!"));
            }

            let lesson = exist.rows[0];

            let name = req.body.name || lesson.name;
            let about = req.body.about !== undefined ? req.body.about : lesson.about;
            let video = lesson.video;

            if (req.files && req.files.video) {
                if (!isVideo(req.files.video)) {
                    return next(new ValidationError(400, "File must be a video!"));
                }
                video = await uploadFile(req.files.video, "videos");
                deleteFile("videos", lesson.video);
            }

            await pool.query("update lessons set name=$1, about=$2, video=$3 where id=$4", [name, about, video, lessonId]);

            return {
                status: 200,
                message: "Lesson updated successfully!"
            }
        } catch (error) {
            return next(new InternalServerError(500, error.message));
        }
    }

    async deleteLesson(req, res, next) {
        try {
            const { lessonId } = req.params;

            let exist = await pool.query("select * from lessons where id=$1", [lessonId]);

            if (!exist.rows.length) {
                return next(new NotFoundError(404, "Lesson not found!"));
            }

            let materials = await pool.query("select file from materials where lesson_id=$1", [lessonId]);
            let homeworks = await pool.query("select file from homeworks where lesson_id=$1", [lessonId]);

            await pool.query("delete from lessons where id=$1", [lessonId]);

            deleteFile("videos", exist.rows[0].video);
            materials.rows.forEach((material) => deleteFile("materials", material.file));
            homeworks.rows.forEach((homework) => deleteFile("homeworks", homework.file));

            return {
                status: 200,
                message: "Lesson deleted successfully!"
            }
        } catch (error) {
            return next(new InternalServerError(500, error.message));
        }
    }
}

const lessonService = new LessonService();

export default lessonService;
