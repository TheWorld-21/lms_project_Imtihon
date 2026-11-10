import pool from "../config/db.js";
import { InternalServerError, NotFoundError, ValidationError } from "../utils/error.js";
import { uploadFile, deleteFile, isImage, isVideo } from "../utils/upload.js";
import getPagination from "../utils/pagination.js";

class CourseService {
    async getAllCourses(req, res, next) {
        try {
            const { page, limit, offset } = getPagination(req.query);
            const { teacherId, search } = req.query;

            let where = "where 1=1";
            let params = [];

            if (teacherId) {
                params.push(teacherId);
                where += ` and courses.teacher_id=$${params.length}`;
            }

            if (search) {
                params.push("%" + search + "%");
                where += ` and courses.name ilike $${params.length}`;
            }

            if (req.user.role === "student") {
                where += " and courses.published=true";
            }

            let count = await pool.query(`select count(*) from courses ${where}`, params);

            params.push(limit, offset);

            let data = await pool.query(
                `select courses.*, teachers.fullname as teacher_name
                from courses
                join teachers on teachers.id = courses.teacher_id
                ${where} order by courses.id desc limit $${params.length - 1} offset $${params.length}`,
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

    async getOneCourse(req, res, next) {
        try {
            const { courseId } = req.params;

            let data = await pool.query(
                `select courses.*, teachers.fullname as teacher_name, teachers.photo as teacher_photo
                from courses
                join teachers on teachers.id = courses.teacher_id
                where courses.id=$1`,
                [courseId]
            );

            if (!data.rows.length) {
                return next(new NotFoundError(404, "Course not found!"));
            }

            let sections = await pool.query(
                `select sections.id, sections.name, count(lessons.id)::int as lessons_count
                from sections left join lessons on lessons.section_id = sections.id
                where sections.course_id=$1 group by sections.id order by sections.id`,
                [courseId]
            );

            let course = data.rows[0];
            course.sections = sections.rows;

            return {
                status: 200,
                data: course
            }
        } catch (error) {
            return next(new InternalServerError(500, error.message));
        }
    }

    async createCourse(req, res, next) {
        try {
            const { name, about, price, level, teacher_id, published } = req.body;

            let teacher = await pool.query("select * from teachers where id=$1 and status='active'", [teacher_id]);

            if (!teacher.rows.length) {
                return next(new NotFoundError(404, "Teacher not found!"));
            }

            let banner = null;
            let introVideo = null;

            if (req.files && req.files.banner) {
                if (!isImage(req.files.banner)) {
                    return next(new ValidationError(400, "Banner must be an image!"));
                }
            }

            if (req.files && req.files.intro_video) {
                if (!isVideo(req.files.intro_video)) {
                    return next(new ValidationError(400, "Intro video must be a video!"));
                }
            }

            if (req.files && req.files.banner) {
                banner = await uploadFile(req.files.banner, "banners");
            }

            if (req.files && req.files.intro_video) {
                introVideo = await uploadFile(req.files.intro_video, "videos");
            }

            let data = await pool.query(
                `insert into courses (name, about, price, level, teacher_id, published, banner, intro_video)
                values ($1, $2, $3, $4, $5, $6, $7, $8) returning *`,
                [name, about, price, level, teacher_id, published || false, banner, introVideo]
            );

            return {
                status: 201,
                message: "Course created successfully!",
                data: data.rows[0]
            }
        } catch (error) {
            return next(new InternalServerError(500, error.message));
        }
    }

    async updateCourse(req, res, next) {
        try {
            const { courseId } = req.params;

            let exist = await pool.query("select * from courses where id=$1", [courseId]);

            if (!exist.rows.length) {
                return next(new NotFoundError(404, "Course not found!"));
            }

            let course = exist.rows[0];

            if (req.body.teacher_id) {
                let teacher = await pool.query("select * from teachers where id=$1 and status='active'", [req.body.teacher_id]);

                if (!teacher.rows.length) {
                    return next(new NotFoundError(404, "Teacher not found!"));
                }
            }

            if (req.files && req.files.banner && !isImage(req.files.banner)) {
                return next(new ValidationError(400, "Banner must be an image!"));
            }

            if (req.files && req.files.intro_video && !isVideo(req.files.intro_video)) {
                return next(new ValidationError(400, "Intro video must be a video!"));
            }

            let name = req.body.name || course.name;
            let about = req.body.about !== undefined ? req.body.about : course.about;
            let price = req.body.price !== undefined ? req.body.price : course.price;
            let level = req.body.level || course.level;
            let teacherId = req.body.teacher_id || course.teacher_id;
            let published = req.body.published !== undefined ? req.body.published : course.published;
            let banner = course.banner;
            let introVideo = course.intro_video;

            if (req.files && req.files.banner) {
                banner = await uploadFile(req.files.banner, "banners");
                deleteFile("banners", course.banner);
            }

            if (req.files && req.files.intro_video) {
                introVideo = await uploadFile(req.files.intro_video, "videos");
                deleteFile("videos", course.intro_video);
            }

            await pool.query(
                `update courses set name=$1, about=$2, price=$3, level=$4, teacher_id=$5,
                published=$6, banner=$7, intro_video=$8 where id=$9`,
                [name, about, price, level, teacherId, published, banner, introVideo, courseId]
            );

            return {
                status: 200,
                message: "Course updated successfully!"
            }
        } catch (error) {
            return next(new InternalServerError(500, error.message));
        }
    }

    async deleteCourse(req, res, next) {
        try {
            const { courseId } = req.params;

            let exist = await pool.query("select * from courses where id=$1", [courseId]);

            if (!exist.rows.length) {
                return next(new NotFoundError(404, "Course not found!"));
            }

            let lessons = await pool.query(
                "select lessons.video from lessons join sections on sections.id = lessons.section_id where sections.course_id=$1",
                [courseId]
            );

            let materials = await pool.query(
                `select materials.file from materials join lessons on lessons.id = materials.lesson_id
                join sections on sections.id = lessons.section_id where sections.course_id=$1`,
                [courseId]
            );

            let homeworks = await pool.query(
                `select homeworks.file from homeworks join lessons on lessons.id = homeworks.lesson_id
                join sections on sections.id = lessons.section_id where sections.course_id=$1`,
                [courseId]
            );

            await pool.query("delete from courses where id=$1", [courseId]);

            deleteFile("banners", exist.rows[0].banner);
            deleteFile("videos", exist.rows[0].intro_video);
            lessons.rows.forEach((lesson) => deleteFile("videos", lesson.video));
            materials.rows.forEach((material) => deleteFile("materials", material.file));
            homeworks.rows.forEach((homework) => deleteFile("homeworks", homework.file));

            return {
                status: 200,
                message: "Course deleted successfully!"
            }
        } catch (error) {
            return next(new InternalServerError(500, error.message));
        }
    }
}

const courseService = new CourseService();

export default courseService;
