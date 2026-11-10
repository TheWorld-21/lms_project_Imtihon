import staffService from "../services/staff.js";

class StaffController {
    async getAllStaff(req, res, next) {
        let resData = await staffService.getAllStaff(req, res, next);
        if (resData) return res.status(resData.status).json(resData);
    }

    async getOneStaff(req, res, next) {
        let resData = await staffService.getOneStaff(req, res, next);
        if (resData) return res.status(resData.status).json(resData);
    }

    async createStaff(req, res, next) {
        let resData = await staffService.createStaff(req, res, next);
        if (resData) return res.status(resData.status).json(resData);
    }

    async updateStaff(req, res, next) {
        let resData = await staffService.updateStaff(req, res, next);
        if (resData) return res.status(resData.status).json(resData);
    }

    async deleteStaff(req, res, next) {
        let resData = await staffService.deleteStaff(req, res, next);
        if (resData) return res.status(resData.status).json(resData);
    }
}

const staffController = new StaffController();

export default staffController;
