import studentService from "../services/student.js";

class StudentController {
    async getAllStudents(req, res, next) {
        let resData = await studentService.getAllStudents(req, res, next);
        if (resData) return res.status(resData.status).json(resData);
    }

    async getOneStudent(req, res, next) {
        let resData = await studentService.getOneStudent(req, res, next);
        if (resData) return res.status(resData.status).json(resData);
    }

    async createStudent(req, res, next) {
        let resData = await studentService.createStudent(req, res, next);
        if (resData) return res.status(resData.status).json(resData);
    }

    async updateStudent(req, res, next) {
        let resData = await studentService.updateStudent(req, res, next);
        if (resData) return res.status(resData.status).json(resData);
    }

    async deleteStudent(req, res, next) {
        let resData = await studentService.deleteStudent(req, res, next);
        if (resData) return res.status(resData.status).json(resData);
    }
}

const studentController = new StudentController();

export default studentController;
