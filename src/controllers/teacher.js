import teacherService from "../services/teacher.js";

class TeacherController {
    async getAllTeachers(req, res, next) {
        let resData = await teacherService.getAllTeachers(req, res, next);
        if (resData) return res.status(resData.status).json(resData);
    }

    async getOneTeacher(req, res, next) {
        let resData = await teacherService.getOneTeacher(req, res, next);
        if (resData) return res.status(resData.status).json(resData);
    }

    async createTeacher(req, res, next) {
        let resData = await teacherService.createTeacher(req, res, next);
        if (resData) return res.status(resData.status).json(resData);
    }

    async updateTeacher(req, res, next) {
        let resData = await teacherService.updateTeacher(req, res, next);
        if (resData) return res.status(resData.status).json(resData);
    }

    async deleteTeacher(req, res, next) {
        let resData = await teacherService.deleteTeacher(req, res, next);
        if (resData) return res.status(resData.status).json(resData);
    }
}

const teacherController = new TeacherController();

export default teacherController;
