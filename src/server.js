import express from "express";
import { configDotenv } from "dotenv";
import fileUpload from "express-fileupload";
import main from "./routers/index.js";
import fs from "fs";
import path from "path";

configDotenv();

const app = express();
const PORT = process.env.PORT;

app.use(fileUpload());
app.use(express.json());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use(main);

app.use((req, res) => {
    return res.status(404).json({
        status: 404,
        message: "Route not found!"
    })
})

app.use((error, req, res, next) => {
    let status = error.status || 500;

    if (status < 500) {
        return res.status(status).json({
            status: status,
            message: error.message
        })
    } else {
        let errData = `[${new Date().toLocaleString()}]-${req.method}-${req.url}-${error.message}\n`;
        fs.appendFileSync(path.join(process.cwd(), 'src', 'log', 'logger.txt'), errData);

        return res.status(status).json({
            status: status,
            message: "Internal Server Error"
        })
    }
})

app.listen(PORT, () => console.log(`Server is running on ${PORT}`));
