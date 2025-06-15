import express from "express";
import { getConfig } from "./config.js";
import { middlewareLogResponses } from "./middleware/logger.js";
import { errorHandlerMiddleware } from "./middleware/errorHandler.js";
import { middlewareMetricsInc } from "./middleware/metrics.js";
import { handlerRequestHitCountReset } from "./routers/admin/metrics.js";
import { handlerReadiness } from "./routers/api/healthz.js";
import { handlerRequestHitCount } from "./routers/admin/metrics.js";
import { handlerCreateUser, handlerUpdateUser } from "./routers/api/users.js";
import { handlerCreateChirp, handlerGetChirpById, handlerGetChirps } from "./routers/api/chirps.js";
import { handlerLogin } from "./routers/api/login.js";
import { handlerRefresh } from "./routers/api/refresh.js";
import { handlerRevoke } from "./routers/api/revoke.js";

const app = express();
export const config = getConfig();
const PORT = 8080;
const rootPath = "/app";
const staticPath = "./src/app";

app.use(express.json({
  strict: true,
  type: "application/json"
}));
app.use(middlewareLogResponses);

// /app route
app.use(rootPath, middlewareMetricsInc, express.static(staticPath));

// /admin path routes
app.get("/admin/metrics", handlerRequestHitCount);
app.post("/admin/reset", handlerRequestHitCountReset);

// /api path routes
app.get("/api/healthz", handlerReadiness);
app.post(
  "/api/users", handlerCreateUser
).put(
  "/api/users",
  handlerUpdateUser
);
app.post("/api/login", handlerLogin);
app.post("/api/refresh", handlerRefresh);
app.post("/api/revoke", handlerRevoke);
app.post("/api/chirps", handlerCreateChirp);
app.get("/api/chirps", handlerGetChirps);
app.get("/api/chirps/:chirpID", handlerGetChirpById);


app.use(errorHandlerMiddleware);

// run server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}/app/`);
});