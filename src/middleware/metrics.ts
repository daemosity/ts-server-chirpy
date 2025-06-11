import { Request, Response, NextFunction } from "express";
import { getConfig } from "../config.js";


export function middlewareMetricsInc(req: Request, res: Response, next: NextFunction) {
    getConfig().fileserverHits += 1;
    next();
}
