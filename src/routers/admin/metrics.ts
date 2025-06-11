import { Request, Response, NextFunction } from "express";
import { getConfig } from "../../config.js";
import { ForbiddenError } from "../../types/errors.js";
import { deleteAllUsers } from "../../db/queries/users.js";

const config = getConfig()

export async function handlerRequestHitCount(_: Request, res: Response, next: NextFunction) {
    try {
        res.set('Content-Type', 'text/html; charset=utf-8');
        res.send(`<html>
                    <body>
                        <h1>Welcome, Chirpy Admin</h1>
                        <p>Chirpy has been visited ${config.fileserverHits} times!</p>
                    </body>
                </html>`);
    } catch (err) {
        next(err);
    }
}

export async function handlerRequestHitCountReset(_: Request, res: Response, next: NextFunction) {
    try {
        if (!config.platform || (config.platform && config.platform !== "dev")) {
            throw new ForbiddenError("Error: Access Forbidden")
        }
        await deleteAllUsers()
        config.fileserverHits = 0;
        res.set('Content-Type', 'text/plain; charset=utf-8');
        res.send("Reset Confirmed");
    } catch (err) {
        next(err);
    }
}

