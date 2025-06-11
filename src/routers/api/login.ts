import { Request, Response, NextFunction } from "express";
import { getUserByEmail } from "../../db/queries/users.js";
import { BadRequestError, UnauthorizedError } from "../../types/errors.js";
import { checkPasswordHash, hasEmailAndPassword } from "../../auth.js";


export async function handlerLogin(req: Request, res: Response, next: NextFunction) {
    try {
        const { body } = req;
        if (!hasEmailAndPassword(body)) {
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

        res.status(200).json(safeUserInfo);

    } catch (err) {
        next(err);
    }
};