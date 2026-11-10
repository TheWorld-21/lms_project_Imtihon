import authService from "../services/auth.js";

class AuthController {
    async login(req, res, next) {
        let resData = await authService.login(req, res, next);
        if (resData) return res.status(resData.status).json(resData);
    }

    async teacherLogin(req, res, next) {
        let resData = await authService.teacherLogin(req, res, next);
        if (resData) return res.status(resData.status).json(resData);
    }

    async studentLogin(req, res, next) {
        let resData = await authService.studentLogin(req, res, next);
        if (resData) return res.status(resData.status).json(resData);
    }

    async refresh(req, res, next) {
        let resData = await authService.refresh(req, res, next);
        if (resData) return res.status(resData.status).json(resData);
    }
}

const authController = new AuthController();

export default authController;
