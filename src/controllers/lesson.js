import lessonService from "../services/lesson.js";

class LessonController {
    async getAllLessons(req, res, next) {
        let resData = await lessonService.getAllLessons(req, res, next);
        if (resData) return res.status(resData.status).json(resData);
    }

    async getOneLesson(req, res, next) {
        let resData = await lessonService.getOneLesson(req, res, next);
        if (resData) return res.status(resData.status).json(resData);
    }

    async createLesson(req, res, next) {
        let resData = await lessonService.createLesson(req, res, next);
        if (resData) return res.status(resData.status).json(resData);
    }

    async updateLesson(req, res, next) {
        let resData = await lessonService.updateLesson(req, res, next);
        if (resData) return res.status(resData.status).json(resData);
    }

    async deleteLesson(req, res, next) {
        let resData = await lessonService.deleteLesson(req, res, next);
        if (resData) return res.status(resData.status).json(resData);
    }
}

const lessonController = new LessonController();

export default lessonController;
