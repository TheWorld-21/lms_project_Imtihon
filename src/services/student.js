import pool from "../config/db.js";
import argon2 from "argon2";
import { ConflictError, InternalServerError, NotFoundError, ValidationError } from "../utils/error.js";
import { uploadFile, deleteFile, isImage } from "../utils/upload.js";
import getPagination from "../utils/pagination.js";

class StudentService {
    async getAllStudents(req, res, next) {
        try {
            const { page, limit, offset } = getPagination(req.query);
            const search = req.query.search || "";

            let data = await pool.query(
                `select id, fullname, phone, photo, status, createdat from students
                where fullname ilike $1 or phone ilike $1 order by id limit $2 offset $3`,
                ["%" + search + "%", limit, offset]
            );

            let count = await pool.query("select count(*) from students where fullname ilike $1 or phone ilike $1", ["%" + search + "%"]);

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

    async getOneStudent(req, res, next) {
        try {
            const { studentId } = req.params;

            let data = await pool.query("select id, fullname, phone, photo, status, createdat from students where id=$1", [studentId]);

            if (!data.rows.length) {
                return next(new NotFoundError(404, "Student not found!"));
            }

            return {
                status: 200,
                data: data.rows[0]
            }
        } catch (error) {
            return next(new InternalServerError(500, error.message));
        }
    }

    async createStudent(req, res, next) {
        try {
            const { fullname, phone, password } = req.body;

            let exist = await pool.query("select * from students where phone=$1", [phone]);

            if (exist.rows.length) {
                return next(new ConflictError(409, "Student already exists with this phone number!"));
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
                "insert into students (fullname, phone, password, photo) values ($1, $2, $3, $4)",
                [fullname, phone, hash, photo]
            );

            return {
                status: 201,
                message: "Student created successfully!"
            }
        } catch (error) {
            return next(new InternalServerError(500, error.message));
        }
    }

    async updateStudent(req, res, next) {
        try {
            const { studentId } = req.params;

            let exist = await pool.query("select * from students where id=$1", [studentId]);

            if (!exist.rows.length) {
                return next(new NotFoundError(404, "Student not found!"));
            }

            let student = exist.rows[0];

            if (req.body.phone && req.body.phone !== student.phone) {
                let existPhone = await pool.query("select * from students where phone=$1", [req.body.phone]);

                if (existPhone.rows.length) {
                    return next(new ConflictError(409, "Student already exists with this phone number!"));
                }
            }

            let fullname = req.body.fullname || student.fullname;
            let phone = req.body.phone || student.phone;
            let status = req.body.status || student.status;
            let password = student.password;
            let photo = student.photo;

            if (req.body.password) {
                password = await argon2.hash(req.body.password);
            }

            if (req.files && req.files.photo) {
                if (!isImage(req.files.photo)) {
                    return next(new ValidationError(400, "Photo must be an image!"));
                }
                photo = await uploadFile(req.files.photo, "photos");
                deleteFile("photos", student.photo);
            }

            await pool.query(
                "update students set fullname=$1, phone=$2, password=$3, status=$4, photo=$5 where id=$6",
                [fullname, phone, password, status, photo, studentId]
            );

            return {
                status: 200,
                message: "Student updated successfully!"
            }
        } catch (error) {
            return next(new InternalServerError(500, error.message));
        }
    }

    async deleteStudent(req, res, next) {
        try {
            const { studentId } = req.params;

            let exist = await pool.query("select * from students where id=$1", [studentId]);

            if (!exist.rows.length) {
                return next(new NotFoundError(404, "Student not found!"));
            }

            await pool.query("update students set status='inactive' where id=$1", [studentId]);

            return {
                status: 200,
                message: "Student deleted successfully!"
            }
        } catch (error) {
            return next(new InternalServerError(500, error.message));
        }
    }
}

const studentService = new StudentService();

export default studentService;
