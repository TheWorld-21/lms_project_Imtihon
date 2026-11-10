import { ForbiddenError } from "../utils/error.js";

export default function checkRole(...roles) {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new ForbiddenError(403, "You don't have permission!"));
        }

        return next();
    }
}
