import express from "express";
import { config } from "./config.js";
import { isChirp } from "./chirp.js";
const app = express();
const PORT = 8080;
const rootPath = "/app";
const staticPath = "./src/app";
app.use(middlewareLogResponses);
// /app route
app.use(rootPath, middlewareMetricsInc, express.static(staticPath));
// /admin path routes
app.get("/admin/metrics", handlerRequestHitCount);
app.post("/admin/reset", handlerRequestHitCountReset);
// /api path routes
app.get("/api/healthz", handlerReadiness);
app.post("/api/validate_chirp", handlerValidateChirp);
// Request handlers
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
async function handlerValidateChirp(req, res) {
    let body = "";
    req.on("data", (chunk) => {
        body += chunk;
    });
    req.on("end", () => {
        try {
            console.log(body);
            const parsedBody = JSON.parse(body);
            if (!isChirp(parsedBody)) {
                res.status(400).json({ "error": "Invalid JSON" });
            }
            else {
                if (parsedBody.body.length > 140) {
                    res.status(400).json({ "error": "Chirp is too long" });
                }
                else {
                    res.status(200).json({ "valid": true });
                }
            }
        }
        catch (err) {
            if (err instanceof Error) {
                res.status(400).json({ "error": "Something went wrong" });
            }
        }
    });
}
// Middleware
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
// run server
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}/app/`);
});
