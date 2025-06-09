import express from "express";
import { config } from "./config.js";
const app = express();
const PORT = 8080;
const rootPath = "/app";
const staticPath = "./src/app";
app.use(middlewareLogResponses);
app.use(rootPath, middlewareMetricsInc, express.static(staticPath));
app.get("/admin/metrics", handlerRequestHitCount);
app.post("/admin/reset", handlerRequestHitCountReset);
app.get("/api/healthz", handlerReadiness);
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}/app/`);
});
async function handlerReadiness(_, res) {
    res.set('Content-Type', 'text/plain; charset=utf-8');
    res.send("OK");
}
;
async function handlerRequestHitCount(_, res) {
    res.set('Content-Type', 'text/html; charset=utf-8');
    res.send(`<html>
                <body>
                    <h1>Welcome, Chirpy Admin</h1>
                    <p>Chirpy has been visited ${config.fileserverHits} times!</p>
                </body>
              </html>`);
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
