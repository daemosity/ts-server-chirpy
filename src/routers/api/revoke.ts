import { Request, Response, NextFunction } from "express";
import { getBearerToken } from "../../auth.js";
import { getRefreshTokenInfo, revokeRefreshToken } from "../../db/queries/refreshTokens.js";
import { ValidationError } from "../../types/errors.js";

export async function handlerRevoke(req: Request, res: Response, next: NextFunction) {
    try {
        const refreshToken = await getBearerToken(req);
        const after = await revokeRefreshToken(refreshToken);
        
        if (!after) {
            throw new ValidationError("Invalid token provided")
        }

        res.status(204).end();


    } catch (err) {
        next(err);
    }
};