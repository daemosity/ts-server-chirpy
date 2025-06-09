import express, {NextFunction, Request, Response} from "express";
import { config } from "./config.js";
import { Chirp, isChirp } from "./chirp.js";
import { connected, nextTick } from "process";
import { cleanFilth } from "./filteredWords.js";
import { BadRequestError, ForbiddenError, NotFoundError, UnauthorizedError } from "./errors.js";

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
async function handlerReadiness(_: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        res.set('Content-Type', 'text/plain; charset=utf-8');
        res.send("OK");
    } catch (err) {
        next(err);
    }
};

async function handlerRequestHitCount(_: Request, res: Response, next: NextFunction) {
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

async function handlerRequestHitCountReset(_: Request, res: Response, next: NextFunction) {
    try {
        config.fileserverHits = 0;
        res.set('Content-Type', 'text/plain; charset=utf-8');
        res.send("Reset Confirmed");
    } catch (err) {
        next(err);
    }
}

async function handlerValidateChirp(req: Request, res: Response, next: NextFunction) {
    try {
        const params = req.body;
        if (isChirp(params)) {
            const chirp = params.body;
            if (chirp.length > 140) {
                throw new BadRequestError("Chirp is too long. Max length is 140");
            } else {
                const cleanedChirp = cleanFilth(chirp);
                res.status(200).json({"cleanedBody": cleanedChirp });
            }
    
        } else {
            throw new BadRequestError("Invalid JSON");
        }
    } catch (err) {
        next(err);
    }
}

// Middleware
function middlewareLogResponses(req: Request, res: Response, next: NextFunction) {
    res.on("finish", () => {
        const statusCode = res.statusCode;
        if (statusCode >= 400) {
            console.log(`[NON-OK] ${req.method} ${req.url} - Status: ${statusCode}`)
        }
    });
    next();
}

function middlewareMetricsInc(req: Request, res: Response, next: NextFunction) {
    config.fileserverHits += 1;
    next();
}

function errorHandlerMiddleware(
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction,
) {
    switch(true) {
        case err instanceof BadRequestError:
            res.status(400).json({"error": err.message});
            console.error(`400: ${err.message}`);
            break;
        case err instanceof UnauthorizedError:
            res.status(401).json({"error": err.message});
            console.error(`401: ${err.message}`);
            break;
        case err instanceof ForbiddenError:
            res.status(403).json({"error": err.message});
            console.error(`403: ${err.message}`);
            break;
        case err instanceof NotFoundError:
            res.status(404).json({"error": err.message});
            console.error(`404: ${err.message}`);
            break;
        default:
            res.status(500).json({"error": "An unknown error occurred"});
            console.error(`500: An unknown error occurred`);
    }
}

app.use(errorHandlerMiddleware);

// run server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}/app/`);
});