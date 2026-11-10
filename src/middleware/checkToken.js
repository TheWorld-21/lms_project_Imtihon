import { UnauthorizedError } from "../utils/error.js";
import { verifyAccessToken } from "../utils/jwt.js";

export default function checkToken(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return next(new UnauthorizedError(401, "Token not found!"));
    }

    const token = authHeader.split(" ")[1];

    try {
        req.user = verifyAccessToken(token);
        return next();
    } catch (error) {
        return next(new UnauthorizedError(401, "Token is invalid or expired!"));
    }
}
