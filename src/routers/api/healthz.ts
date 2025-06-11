import { Request, Response, NextFunction } from "express";


// Request handlers
export async function handlerReadiness(_: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        res.set('Content-Type', 'text/plain; charset=utf-8');
        res.send("OK");
    } catch (err) {
        next(err);
    }
}
;
