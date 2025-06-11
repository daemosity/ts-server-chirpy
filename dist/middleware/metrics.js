import { getConfig } from "../config.js";
export function middlewareMetricsInc(req, res, next) {
    getConfig().fileserverHits += 1;
    next();
}
