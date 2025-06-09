import express from "express";
import { config } from "./config.js";
const app = express();
const PORT = 8080;
const rootPath = "/app";
const staticPath = "./src/app";
app.use(middlewareLogResponses);
app.use(rootPath, middlewareMetricsInc, express.static(staticPath));
app.get("/healthz", handlerReadiness);
app.get("/metrics", handlerRequestHitCount);
app.get("/reset", handlerRequestHitCountReset);
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}/app/`);
});
async function handlerReadiness(_, res) {
    res.set('Content-Type', 'text/plain; charset=utf-8');
    res.send("OK");
}
;
async function handlerRequestHitCount(_, res) {
    res.set('Content-Type', 'text/plain; charset=utf-8');
    res.send(`Hits: ${config.fileserverHits}`);
}
async function handlerRequestHitCountReset(_, res) {
    config.fileserverHits = 0;
    res.set('Content-Type', 'text/plain; charset=utf-8');
    res.send("Reset Confirmed");
}
function middlewareLogResponses(req, res, next) {
    res.on("finish", () => {
        const statusCode = res.statusCode;
        if (statusCode >= 400) {
            console.log(`[NON-OK] ${req.method} ${req.url} - Status: ${statusCode}`);
        }
    });
    next();
}
function middlewareMetricsInc(req, res, next) {
    config.fileserverHits += 1;
    next();
}
