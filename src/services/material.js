import pool from "../config/db.js";
import { InternalServerError, NotFoundError, ValidationError } from "../utils/error.js";
import { uploadFile, deleteFile } from "../utils/upload.js";

class MaterialService {
    async getAllMaterials(req, res, next) {
        try {
            const { lessonId } = req.query;

            if (!lessonId || isNaN(lessonId)) {
                return next(new ValidationError(400, "lessonId is required!"));
            }

            let data = await pool.query("select * from materials where lesson_id=$1 order by id", [lessonId]);

            return {
                status: 200,
                data: data.rows
            }
        } catch (error) {
            return next(new InternalServerError(500, error.message));
        }
    }

    async createMaterial(req, res, next) {
        try {
            const { name, lesson_id } = req.body;

            let lesson = await pool.query("select * from lessons where id=$1", [lesson_id]);

            if (!lesson.rows.length) {
                return next(new NotFoundError(404, "Lesson not found!"));
            }

            if (!req.files || !req.files.file) {
                return next(new ValidationError(400, "File is required!"));
            }

            let file = await uploadFile(req.files.file, "materials");

            let data = await pool.query(
                "insert into materials (name, file, lesson_id) values ($1, $2, $3) returning *",
                [name, file, lesson_id]
            );

            return {
                status: 201,
                message: "Material created successfully!",
                data: data.rows[0]
            }
        } catch (error) {
            return next(new InternalServerError(500, error.message));
        }
    }

    async deleteMaterial(req, res, next) {
        try {
            const { materialId } = req.params;

            let exist = await pool.query("select * from materials where id=$1", [materialId]);

            if (!exist.rows.length) {
                return next(new NotFoundError(404, "Material not found!"));
            }

            await pool.query("delete from materials where id=$1", [materialId]);
            deleteFile("materials", exist.rows[0].file);

            return {
                status: 200,
                message: "Material deleted successfully!"
            }
        } catch (error) {
            return next(new InternalServerError(500, error.message));
        }
    }
}

const materialService = new MaterialService();

export default materialService;
