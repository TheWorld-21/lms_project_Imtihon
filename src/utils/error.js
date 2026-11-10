export class ConflictError extends Error {
    constructor(status, message) {
        super(status, message);
        this.status = status;
        this.message = message;
        this.name = "ConflictError";
    }
}

export class ValidationError extends Error {
    constructor(status, message) {
        super(status, message);
        this.status = status;
        this.message = message;
        this.name = "ValidationError";
    }
}

export class NotFoundError extends Error {
    constructor(status, message) {
        super(status, message);
        this.status = status;
        this.message = message;
        this.name = "NotFoundError";
    }
}

export class UnauthorizedError extends Error {
    constructor(status, message) {
        super(status, message);
        this.status = status;
        this.message = message;
        this.name = "UnauthorizedError";
    }
}

export class ForbiddenError extends Error {
    constructor(status, message) {
        super(status, message);
        this.status = status;
        this.message = message;
        this.name = "ForbiddenError";
    }
}

export class InternalServerError extends Error {
    constructor(status, message) {
        super(status, message);
        this.status = status;
        this.message = message;
        this.name = "InternalServerError";
    }
}
