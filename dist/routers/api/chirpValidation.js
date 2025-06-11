import { cleanFilth } from "../../filteredWords.js";
import { isChirp } from "../../types/chirp.js";
import { BadRequestError } from "../../types/errors.js";
export async function handlerValidateChirp(req, res, next) {
    try {
        const params = req.body;
        if (isChirp(params)) {
            const chirp = params.body;
            if (chirp.length > 140) {
                throw new BadRequestError("Chirp is too long. Max length is 140");
            }
            else {
                const cleanedChirp = cleanFilth(chirp);
                res.status(200).json({ "cleanedBody": cleanedChirp });
            }
        }
        else {
            throw new BadRequestError("Invalid JSON");
        }
    }
    catch (err) {
        next(err);
    }
}
