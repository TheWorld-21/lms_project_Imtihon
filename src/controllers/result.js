import resultService from "../services/result.js";

class ResultController {
    async getAllResults(req, res, next) {
        let resData = await resultService.getAllResults(req, res, next);
        if (resData) return res.status(resData.status).json(resData);
    }
}

const resultController = new ResultController();

export default resultController;
