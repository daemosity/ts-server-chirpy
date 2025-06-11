import { Request, Response, NextFunction } from "express";


// Middleware
export function middlewareLogResponses(req: Request, res: Response, next: NextFunction) {
    res.on("finish", () => {
        const { statusCode } = res;
        const { method, url } = req;
        if (statusCode >= 400) {
            console.log(`[NON-OK] ${method} ${url} - Status: ${statusCode}`);
        }
    });
    next();
}
