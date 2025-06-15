import { Request, Response, NextFunction } from "express";
import { getRefreshTokenInfo } from "../../db/queries/refreshTokens.js";
import { UnauthorizedError } from "../../types/errors.js";
import { createToken, getBearerToken, makeJWT } from "../../auth.js";


export async function handlerRefresh(req: Request, res: Response, next: NextFunction) {
    try {

        const refreshToken = await getBearerToken(req);

        const result = await getRefreshTokenInfo(refreshToken);
        if (!result) {
            throw new UnauthorizedError("No refresh token found");
        }
        if (result.revokedAt) {
            throw new UnauthorizedError("Token invalid");
        }
        
        const newToken = await createToken(result.userId);
        res.status(200).json({token: newToken});



    } catch (err) {
        next(err);
    }
};