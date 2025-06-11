// Middleware
export function middlewareLogResponses(req, res, next) {
    res.on("finish", () => {
        const { statusCode } = res;
        const { method, url } = req;
        if (statusCode >= 400) {
            console.log(`[NON-OK] ${method} ${url} - Status: ${statusCode}`);
        }
    });
    next();
}
