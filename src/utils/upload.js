import path from "path";
import fs from "fs";

export async function uploadFile(file, folder) {
    const fileName = Date.now() + "-" + Math.round(Math.random() * 10000) + path.extname(file.name);
    const folderPath = path.join(process.cwd(), "uploads", folder);

    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
    }

    await file.mv(path.join(folderPath, fileName));

    return fileName;
}

export function deleteFile(folder, fileName) {
    if (!fileName) return;

    const filePath = path.join(process.cwd(), "uploads", folder, fileName);

    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
}

export function isImage(file) {
    return file.mimetype.startsWith("image/");
}

export function isVideo(file) {
    return file.mimetype.startsWith("video/");
}
