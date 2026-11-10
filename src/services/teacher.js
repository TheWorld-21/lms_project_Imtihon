import pool from "../config/db.js";
import argon2 from "argon2";
import { ConflictError, InternalServerError, NotFoundError, ValidationError } from "../utils/error.js";
import { uploadFile, deleteFile, isImage } from "../utils/upload.js";
import getPagination from "../utils/pagination.js";

class TeacherService {
    async getAllTeachers(req, res, next) {
        try {
            const { page, limit, offset } = getPagination(req.query);
            const search = req.query.search || "";

            let data = await pool.query(
                `select id, fullname, phone, experience, job, description, portfolio, github, photo, status, createdat
                from teachers where fullname ilike $1 order by id limit $2 offset $3`,
                ["%" + search + "%", limit, offset]
            );

            let count = await pool.query("select count(*) from teachers where fullname ilike $1", ["%" + search + "%"]);

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

    async getOneTeacher(req, res, next) {
        try {
            const { teacherId } = req.params;

            let data = await pool.query(
                `select id, fullname, phone, experience, job, description, portfolio, github, photo, status, createdat
                from teachers where id=$1`,
                [teacherId]
            );

            if (!data.rows.length) {
                return next(new NotFoundError(404, "Teacher not found!"));
            }

            let courses = await pool.query("select id, name, price, level, banner, published from courses where teacher_id=$1", [teacherId]);

            let teacher = data.rows[0];
            teacher.courses = courses.rows;

            return {
                status: 200,
                data: teacher
            }
        } catch (error) {
            return next(new InternalServerError(500, error.message));
        }
    }

    async createTeacher(req, res, next) {
        try {
            const { fullname, phone, password, experience, job, description, portfolio, github } = req.body;

            let exist = await pool.query("select * from teachers where phone=$1", [phone]);

            if (exist.rows.length) {
                return next(new ConflictError(409, "Teacher already exists with this phone number!"));
            }

            let photo = null;

            if (req.files && req.files.photo) {
                if (!isImage(req.files.photo)) {
                    return next(new ValidationError(400, "Photo must be an image!"));
                }
                photo = await uploadFile(req.files.photo, "photos");
            }

            let hash = await argon2.hash(password);

            await pool.query(
                "insert into teachers(fullname, phone, password, experience, job, description, portfolio, github, photo) values($1, $2, $3, $4, $5, $6, $7, $8, $9)",
                [fullname, phone, hash, experience, job, description, portfolio, github, photo]
            );

            return {
                status: 201,
                message: "Teacher created successfully!"
            }
        } catch (error) {
            return next(new InternalServerError(500, error.message));
        }
    }

    async updateTeacher(req, res, next) {
        try {
            const { teacherId } = req.params;

            let exist = await pool.query("select * from teachers where id=$1", [teacherId]);

            if (!exist.rows.length) {
                return next(new NotFoundError(404, "Teacher not found!"));
            }

            let teacher = exist.rows[0];

            if (req.body.phone && req.body.phone !== teacher.phone) {
                let existPhone = await pool.query("select * from teachers where phone=$1", [req.body.phone]);

                if (existPhone.rows.length) {
                    return next(new ConflictError(409, "Teacher already exists with this phone number!"));
                }
            }

            let fullname = req.body.fullname || teacher.fullname;
            let phone = req.body.phone || teacher.phone;
            let experience = req.body.experience || teacher.experience;
            let job = req.body.job || teacher.job;
            let description = req.body.description !== undefined ? req.body.description : teacher.description;
            let portfolio = req.body.portfolio !== undefined ? req.body.portfolio : teacher.portfolio;
            let github = req.body.github !== undefined ? req.body.github : teacher.github;
            let status = req.body.status || teacher.status;
            let password = teacher.password;
            let photo = teacher.photo;

            if (req.body.password) {
                password = await argon2.hash(req.body.password);
            }

            if (req.files && req.files.photo) {
                if (!isImage(req.files.photo)) {
                    return next(new ValidationError(400, "Photo must be an image!"));
                }
                photo = await uploadFile(req.files.photo, "photos");
                deleteFile("photos", teacher.photo);
            }

            await pool.query(
                `update teachers set fullname=$1, phone=$2, password=$3, experience=$4, job=$5, description=$6,
                portfolio=$7, github=$8, status=$9, photo=$10 where id=$11`,
                [fullname, phone, password, experience, job, description, portfolio, github, status, photo, teacherId]
            );

            return {
                status: 200,
                message: "Teacher updated successfully!"
            }
        } catch (error) {
            return next(new InternalServerError(500, error.message));
        }
    }

    async deleteTeacher(req, res, next) {
        try {
            const { teacherId } = req.params;

            let exist = await pool.query("select * from teachers where id=$1", [teacherId]);

            if (!exist.rows.length) {
                return next(new NotFoundError(404, "Teacher not found!"));
            }

            await pool.query("update teachers set status='inactive' where id=$1", [teacherId]);

            return {
                status: 200,
                message: "Teacher deleted successfully!"
            }
        } catch (error) {
            return next(new InternalServerError(500, error.message));
        }
    }
}

const teacherService = new TeacherService();

export default teacherService;
