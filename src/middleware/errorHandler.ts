import { Request, Response, NextFunction } from "express";
import { BadRequestError, UnauthorizedError, ForbiddenError, NotFoundError } from "../types/errors.js";


export function errorHandlerMiddleware(
    err: Error,
    _: Request,
    res: Response,
    next: NextFunction) {
    const { message } = err;
    switch (true) {
        case err instanceof BadRequestError:
            res.status(400).json({ "error": message });
            console.error(`400: ${message}`);
            break;
        case err instanceof UnauthorizedError:
            res.status(401).json({ "error": message });
            console.error(`401: ${message}`);
            break;
        case err instanceof ForbiddenError:
            res.status(403).json({ "error": message });
            console.error(`403: ${message}`);
            break;
        case err instanceof NotFoundError:
            res.status(404).json({ "error": message });
            console.error(`404: ${message}`);
            break;
        default:
            res.status(500).json({ "error": "An unknown error occurred" });
            console.error(`500: An unknown error occurred`);
    }
}
