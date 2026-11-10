import materialService from "../services/material.js";

class MaterialController {
    async getAllMaterials(req, res, next) {
        let resData = await materialService.getAllMaterials(req, res, next);
        if (resData) return res.status(resData.status).json(resData);
    }

    async createMaterial(req, res, next) {
        let resData = await materialService.createMaterial(req, res, next);
        if (resData) return res.status(resData.status).json(resData);
    }

    async deleteMaterial(req, res, next) {
        let resData = await materialService.deleteMaterial(req, res, next);
        if (resData) return res.status(resData.status).json(resData);
    }
}

const materialController = new MaterialController();

export default materialController;
