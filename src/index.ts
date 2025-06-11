import express from "express";
import { getConfig } from "./config.js";
import { middlewareLogResponses } from "./middleware/logger.js";
import { errorHandlerMiddleware } from "./middleware/errorHandler.js";
import { middlewareMetricsInc } from "./middleware/metrics.js";
import { handlerRequestHitCountReset } from "./routers/admin/metrics.js";
import { handlerReadiness } from "./routers/api/healthz.js";
import { handlerRequestHitCount } from "./routers/admin/metrics.js";
import { handlerCreateUser } from "./routers/api/users.js";
import { handlerCreateChirp, handlerGetChirps } from "./routers/api/chirps.js";

const app = express();
export const config = getConfig();
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
app.post("/api/users", handlerCreateUser);
app.post("/api/chirps", handlerCreateChirp);
app.get("/api/chirps", handlerGetChirps);


app.use(errorHandlerMiddleware);

// run server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}/app/`);
});