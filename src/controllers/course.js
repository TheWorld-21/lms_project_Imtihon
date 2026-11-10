import courseService from "../services/course.js";

class CourseController {
    async getAllCourses(req, res, next) {
        let resData = await courseService.getAllCourses(req, res, next);
        if (resData) return res.status(resData.status).json(resData);
    }

    async getOneCourse(req, res, next) {
        let resData = await courseService.getOneCourse(req, res, next);
        if (resData) return res.status(resData.status).json(resData);
    }

    async createCourse(req, res, next) {
        let resData = await courseService.createCourse(req, res, next);
        if (resData) return res.status(resData.status).json(resData);
    }

    async updateCourse(req, res, next) {
        let resData = await courseService.updateCourse(req, res, next);
        if (resData) return res.status(resData.status).json(resData);
    }

    async deleteCourse(req, res, next) {
        let resData = await courseService.deleteCourse(req, res, next);
        if (resData) return res.status(resData.status).json(resData);
    }
}

const courseController = new CourseController();

export default courseController;
