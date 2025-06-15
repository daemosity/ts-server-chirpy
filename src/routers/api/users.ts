import { Request, Response, NextFunction } from "express";
import { createUser, updateUser, updateUserToRedByUserId } from "../../db/queries/users.js";
import { BadRequestError, NotFoundError, UnauthorizedError, ValidationError } from "../../types/errors.js";
import { getAPIKey, getBearerToken, hasEmailAndPassword, hashPassword, validateJWT } from "../../auth.js";
import { getConfig } from "../../config.js";

export async function handlerCreateUser(req: Request, res: Response, next: NextFunction) {
    try {
        const { body } = req;
        if (hasEmailAndPassword(body)) {
            const { email, password } = body;

            const hashedPassword = await hashPassword(password);
            console.log("password hashed")
            const newUser = await createUser({email, hashedPassword});

            if (!newUser) {
                throw new BadRequestError("Error: user already exists")
            }
            
            res.status(201).json(newUser);
        } else {
            throw new BadRequestError("Error: email field required");
        }
    } catch (err) {
        next(err);
    }
};

export async function handlerUpdateUser(req: Request, res: Response, next: NextFunction) {
    try {
        const config = await getConfig()
        const token = await getBearerToken(req);
        if (!token) {
            throw new UnauthorizedError("Invalid access token");
        }

        const userId = await validateJWT(token, config.serverSecret);
        

        const { body } = req;
        if (hasEmailAndPassword(body)) {
            const { email, password } = body;

            console.log(body)

            if (!email || !password) {
                throw new BadRequestError("Email and password required");
            }

            const hashedPassword = await hashPassword(password);
            const updatedUser = await updateUser(userId, email, hashedPassword);
            
            res.status(200).json(updatedUser).end();
        } else {
            throw new BadRequestError("Email and password required");
        }
    } catch (err) {
        next(err);
    }
};

export async function handlerUpgradeToRed(req: Request, res: Response, next: NextFunction) {
    const config = getConfig();
    try {
        const apiKey = await getAPIKey(req);
        if (apiKey !== config.polkaKey) {
            throw new UnauthorizedError("Unauthorized: incorrect api key");
        }

        const {body} = req;
        if (!body || !await validateRedUpgradeRequest(body)) {
            throw new BadRequestError("Request does not have required form");
        }
        if (body.event !== "user.upgraded") {
            res.status(204).end();
        }
        const result = await updateUserToRedByUserId(body.data.userId);
        if (!result) {
            throw new NotFoundError("User not found");
        }
        res.status(204).end();
        
    } catch (err) {
        next(err);
    }
};

function validateRedUpgradeRequest(body: any): body is {"event": string, "data": {"userId": string}} {
    return (
        body &&
        "event" in body &&
        body["event"] &&
        typeof body["event"] === "string" &&
        "data" in body &&
        body['data'] &&
        typeof body['data'] === "object" &&
        "userId" in body['data'] &&
        body['data']['userId'] &&
        typeof body['data']['userId'] === "string"
    )
}