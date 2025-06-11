// Request handlers
export async function handlerReadiness(_, res, next) {
    try {
        res.set('Content-Type', 'text/plain; charset=utf-8');
        res.send("OK");
    }
    catch (err) {
        next(err);
    }
}
;
