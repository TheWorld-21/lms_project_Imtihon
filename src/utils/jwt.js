import JWT from "jsonwebtoken";
import { configDotenv } from "dotenv";

configDotenv();

export function generateAccessToken(payload) {
    let token = JWT.sign(payload, process.env.SECRET_KEY, { expiresIn: "30m" });
    return token;
}

export function generateRefreshToken(payload) {
    let token = JWT.sign(payload, process.env.REFRESH_SECRET_KEY, { expiresIn: "24h" });
    return token;
}

export function verifyAccessToken(token) {
    return JWT.verify(token, process.env.SECRET_KEY);
}

export function verifyRefreshToken(token) {
    return JWT.verify(token, process.env.REFRESH_SECRET_KEY);
}
