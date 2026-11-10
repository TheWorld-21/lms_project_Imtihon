import pool from "../config/db.js";
import argon2 from "argon2";
import { InternalServerError, NotFoundError, UnauthorizedError } from "../utils/error.js";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/jwt.js";

class AuthService {
    async checkUser(table, req, next) {
        const { phone, password } = req.body;

        let existUser = await pool.query(`select * from ${table} where phone=$1 and status='active'`, [phone]);

        if (!existUser.rows.length) {
            return null;
        }

        let checkPassword = await argon2.verify(existUser.rows[0].password, password);

        if (!checkPassword) {
            return null;
        }

        return existUser.rows[0];
    }

    createTokens(user, role) {
        let payload = { id: user.id, phone: user.phone, role: role };

        return {
            status: 200,
            message: "User login successfully!",
            accessToken: generateAccessToken(payload),
            refreshToken: generateRefreshToken(payload)
        }
    }

    async login(req, res, next) {
        try {
            let user = await this.checkUser("staff", req, next);

            if (!user) {
                return next(new NotFoundError(404, "User not found with this phone or password!"));
            }

            return this.createTokens(user, user.role);
        } catch (error) {
            return next(new InternalServerError(500, error.message));
        }
    }

    async teacherLogin(req, res, next) {
        try {
            let user = await this.checkUser("teachers", req, next);

            if (!user) {
                return next(new NotFoundError(404, "User not found with this phone or password!"));
            }

            return this.createTokens(user, "teacher");
        } catch (error) {
            return next(new InternalServerError(500, error.message));
        }
    }

    async studentLogin(req, res, next) {
        try {
            let user = await this.checkUser("students", req, next);

            if (!user) {
                return next(new NotFoundError(404, "User not found with this phone or password!"));
            }

            return this.createTokens(user, "student");
        } catch (error) {
            return next(new InternalServerError(500, error.message));
        }
    }

    async refresh(req, res, next) {
        try {
            const { refreshToken } = req.body;

            let data;
            try {
                data = verifyRefreshToken(refreshToken);
            } catch (error) {
                return next(new UnauthorizedError(401, "Refresh token is invalid or expired!"));
            }

            let accessToken = generateAccessToken({ id: data.id, phone: data.phone, role: data.role });

            return {
                status: 200,
                accessToken: accessToken
            }
        } catch (error) {
            return next(new InternalServerError(500, error.message));
        }
    }
}

const authService = new AuthService();

export default authService;
