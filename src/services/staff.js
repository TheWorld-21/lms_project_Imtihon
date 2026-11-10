import pool from '../config/db.js'
import argon2 from 'argon2';
import { ConflictError, ForbiddenError, InternalServerError, NotFoundError, ValidationError } from '../utils/error.js';
import { uploadFile, deleteFile, isImage } from '../utils/upload.js';

class StaffService {
    async getAllStaff(req, res, next) {
        try {
            const { role } = req.query;

            let data;

            if (role) {
                data = await pool.query("select id, fullname, phone, photo, role, status, createdat from staff where role=$1 order by id", [role]);
            } else {
                data = await pool.query("select id, fullname, phone, photo, role, status, createdat from staff order by id");
            }

            return {
                status: 200,
                data: data.rows
            }

        } catch (error) {
            return next(new InternalServerError(500, error.message));
        }
    }

    async getOneStaff(req, res, next) {
        try {
            const { userId } = req.params;

            let data = await pool.query("select id, fullname, phone, photo, role, status, createdat from staff where id=$1", [userId]);

            if (!data.rows.length) {
                return next(new NotFoundError(404, "User not found!"));
            }

            return {
                status: 200,
                data: data.rows[0]
            }
        } catch (error) {
            return next(new InternalServerError(500, error.message));
        }
    }

    async createStaff(req, res, next) {
        try {
            const { fullname, phone, password, role } = req.body;

            let exist = await pool.query('select * from staff where phone=$1', [phone]);

            if (exist.rows.length) {
                return next(new ConflictError(409, "User already exists with this phone number!"));
            }

            let photo = null;

            if (req.files && req.files.photo) {
                if (!isImage(req.files.photo)) {
                    return next(new ValidationError(400, "Photo must be an image!"));
                }
                photo = await uploadFile(req.files.photo, "photos");
            }

            const hashshedPassword = await argon2.hash(password);

            await pool.query('insert into staff (fullname, phone, password, role, photo) values ($1, $2, $3, $4, $5)', [fullname, phone, hashshedPassword, role, photo]);

            return {
                status: 201,
                message: "Staff created successfully"
            }
        } catch (error) {
            return next(new InternalServerError(500, error.message));
        }
    }

    async updateStaff(req, res, next) {
        try {
            const { userId } = req.params;

            let existUser = await pool.query('select * from staff where id=$1', [userId]);

            if (!existUser.rows.length) {
                return next(new NotFoundError(404, "User not found!"));
            }

            let user = existUser.rows[0];

            if (user.role === "superadmin" && req.user.role !== "superadmin") {
                return next(new ForbiddenError(403, "You can't update superadmin!"));
            }

            if (req.body.phone && req.body.phone !== user.phone) {
                let existPhone = await pool.query('select * from staff where phone=$1', [req.body.phone]);

                if (existPhone.rows.length) {
                    return next(new ConflictError(409, "User already exists with this phone number!"));
                }
            }

            let fullname = req.body.fullname || user.fullname;
            let phone = req.body.phone || user.phone;
            let role = req.body.role || user.role;
            let status = req.body.status || user.status;
            let password = user.password;
            let photo = user.photo;

            if (user.role === "superadmin") {
                role = "superadmin";
            }

            if (req.body.password) {
                password = await argon2.hash(req.body.password);
            }

            if (req.files && req.files.photo) {
                if (!isImage(req.files.photo)) {
                    return next(new ValidationError(400, "Photo must be an image!"));
                }
                photo = await uploadFile(req.files.photo, "photos");
                deleteFile("photos", user.photo);
            }

            await pool.query(
                "update staff set fullname=$1, phone=$2, password=$3, role=$4, status=$5, photo=$6 where id=$7",
                [fullname, phone, password, role, status, photo, userId]
            );

            return {
                status: 200,
                message: "Staff updated successfully"
            }
        } catch (error) {
            return next(new InternalServerError(500, error.message));
        }
    }

    async deleteStaff(req, res, next) {
        try {
            const { userId } = req.params;

            let existUser = await pool.query('select * from staff where id=$1', [userId]);

            if (!existUser.rows.length) {
                return next(new NotFoundError(404, "User not found!"));
            }

            if (existUser.rows[0].role === "superadmin") {
                return next(new ForbiddenError(403, "You can't delete superadmin!"));
            }

            await pool.query("update staff set status='inactive' where id=$1", [userId]);

            return {
                status: 200,
                message: "User deleted successfully"
            }
        } catch (error) {
            return next(new InternalServerError(500, error.message));
        }

    }
}

const staffService = new StaffService();

export default staffService;
