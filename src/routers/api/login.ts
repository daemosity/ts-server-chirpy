import { Request, Response, NextFunction } from "express";
import { getUserByEmail } from "../../db/queries/users.js";
import { BadRequestError, UnauthorizedError } from "../../types/errors.js";
import { checkPasswordHash, hasEmailAndPassword, makeJWT } from "../../auth.js";
import { getConfig } from "../../config.js";


export async function handlerLogin(req: Request, res: Response, next: NextFunction) {
    try {
        const { body } = req;
        if (!hasEmailAndPassword(body)) {
            throw new BadRequestError("Error: email field required");
        }

        const { email, password, expiresInSeconds } = body;
        const {hashedPassword, ...safeUserInfo} = await getUserByEmail(email);

        if (!safeUserInfo) {
            throw new BadRequestError("Error: user does not exist")
        }

        const userMatch = await checkPasswordHash(password, hashedPassword);
        if (!userMatch) {
            throw new UnauthorizedError("Error: incorrect password")
        }

        const token = createToken(safeUserInfo.id, expiresInSeconds);
        const returnJSON = {...safeUserInfo, token};

        res.status(200).json(returnJSON);

    } catch (err) {
        next(err);
    }
};

function createToken(userId: string, expiresIn: number | undefined): string {
    const { serverSecret } = getConfig()
    const hourExpiration = 60 * 60;

    const expiration = (
        (!expiresIn || expiresIn > hourExpiration) ? 
        hourExpiration 
        : expiresIn
    );

    return makeJWT(userId, expiration, serverSecret);
}