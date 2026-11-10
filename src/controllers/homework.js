import homeworkService from "../services/homework.js";

class HomeworkController {
    async getAllHomeworks(req, res, next) {
        let resData = await homeworkService.getAllHomeworks(req, res, next);
        if (resData) return res.status(resData.status).json(resData);
    }

    async createHomework(req, res, next) {
        let resData = await homeworkService.createHomework(req, res, next);
        if (resData) return res.status(resData.status).json(resData);
    }

    async updateHomework(req, res, next) {
        let resData = await homeworkService.updateHomework(req, res, next);
        if (resData) return res.status(resData.status).json(resData);
    }

    async deleteHomework(req, res, next) {
        let resData = await homeworkService.deleteHomework(req, res, next);
        if (resData) return res.status(resData.status).json(resData);
    }
}

const homeworkController = new HomeworkController();

export default homeworkController;
