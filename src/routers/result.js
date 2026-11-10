import express from "express";
import resultController from "../controllers/result.js";
import checkToken from "../middleware/checkToken.js";

const router = express.Router();

router.get('/result', checkToken, resultController.getAllResults);

export default router;
