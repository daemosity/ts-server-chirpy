import express from "express";
import { config } from "./config.js";
import { isChirp } from "./chirp.js";
import { cleanFilth } from "./filteredWords.js";
const app = express();
const PORT = 8080;
const rootPath = "/app";
const staticPath = "./src/app";
app.use(express.json());
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
async function handlerReadiness(_, res, next) {
    try {
        res.set('Content-Type', 'text/plain; charset=utf-8');
        res.send("OK");
    }
    catch (err) {
        next(err);
    }
}
;
async function handlerRequestHitCount(_, res, next) {
    try {
        res.set('Content-Type', 'text/html; charset=utf-8');
        res.send(`<html>
                    <body>
                        <h1>Welcome, Chirpy Admin</h1>
                        <p>Chirpy has been visited ${config.fileserverHits} times!</p>
                    </body>
                </html>`);
    }
    catch (err) {
        next(err);
    }
}
async function handlerRequestHitCountReset(_, res, next) {
    try {
        config.fileserverHits = 0;
        res.set('Content-Type', 'text/plain; charset=utf-8');
        res.send("Reset Confirmed");
    }
    catch (err) {
        next(err);
    }
}
async function handlerValidateChirp(req, res, next) {
    try {
        const params = req.body;
        if (isChirp(params)) {
            const chirp = params.body;
            if (chirp.length > 140) {
                throw new Error("Chirp is too long");
                // res.status(400).json({"error": "Chirp is too long"});
            }
            else {
                const cleanedChirp = cleanFilth(chirp);
                res.status(200).json({ "cleanedBody": cleanedChirp });
            }
        }
        else {
            res.status(400).json({ "error": "Invalid JSON" });
        }
    }
    catch (err) {
        next(err);
    }
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
function errorHandlerMiddleware(err, req, res, next) {
    console.error(err.message);
    res.status(500).json({
        "error": "Something went wrong on our end",
    });
}
app.use(errorHandlerMiddleware);
// run server
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}/app/`);
});
