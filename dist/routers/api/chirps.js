import { cleanFilth } from "../../filteredWords.js";
import { BadRequestError } from "../../types/errors.js";
import { createChirp } from "../../db/queries/chirps.js";
export async function handlerCreateChirp(req, res, next) {
    try {
        const { body, userId } = validateChirp(req.body);
        const cleanedChirp = cleanFilth(body);
        const newChirp = await createChirp(cleanedChirp, userId);
        res.status(201).json(newChirp);
    }
    catch (err) {
        next(err);
    }
}
;
function isChirp(chirp) {
    return (chirp &&
        typeof chirp === 'object' &&
        'body' in chirp &&
        (typeof chirp.body === 'string' ||
            chirp.body instanceof String) &&
        'userId' in chirp &&
        (typeof chirp.userId === 'string' ||
            chirp.userId instanceof String));
}
;
function validateChirp(params) {
    switch (true) {
        case !isChirp(params):
            console.log("not chirp");
            throw new BadRequestError("Invalid JSON format");
        case params.body.length === 0:
            throw new BadRequestError("Chirp must have content");
        case params.body.length > 140:
            throw new BadRequestError("Chirp is too long. Max length is 140");
        default:
            return params;
    }
}
