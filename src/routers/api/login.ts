import { Request, Response, NextFunction } from "express";
import { getUserByEmail } from "../../db/queries/users.js";
import { BadRequestError, UnauthorizedError } from "../../types/errors.js";
import { checkPasswordHash, createToken, hasEmailAndPassword, makeRefreshToken } from "../../auth.js";
import { createRefreshToken } from "../../db/queries/refreshTokens.js";


export async function handlerLogin(req: Request, res: Response, next: NextFunction) {
    try {
        const { body } = req;
        if (! await hasEmailAndPassword(body)) {
            throw new BadRequestError("Error: email field required");
        }

        const { email, password } = body;
        const {hashedPassword, ...safeUserInfo} = await getUserByEmail(email);

        if (!safeUserInfo) {
            throw new BadRequestError("Error: user does not exist")
        }

        const userMatch = await checkPasswordHash(password, hashedPassword);
        if (!userMatch) {
            throw new UnauthorizedError("Error: incorrect password")
        }

        const token = await createToken(safeUserInfo.id);
        const refreshToken = await makeRefreshToken();
        await createRefreshToken(refreshToken, safeUserInfo.id);
        
        const returnJSON = {...safeUserInfo, token, refreshToken};

        res.status(200).json(returnJSON);

    } catch (err) {
        next(err);
    }
};

