import bcrypt from "bcrypt";
import jwt, { JwtPayload } from "jsonwebtoken";
import { UnauthorizedError } from "./types/errors.js";
import { Request } from "express";
import crypto from "crypto";
import { getConfig } from "./config.js";

process.loadEnvFile(".env")

export async function hashPassword(password: string) {
    const saltRounds = process.env.SALT_ROUNDS;

    if (!saltRounds) {
        throw new Error("Error: error occurred during password creation");
    }

    const salt = await bcrypt.genSalt(parseInt(saltRounds));
    const hashed = await bcrypt.hash(password, salt);
    
    if (!hashed) {
        throw new Error("Error: error occured during parsing password")
    }

    return hashed;
}

export async function checkPasswordHash(password: string, hash: string) {
    return await bcrypt.compare(password, hash)
}

export function hasEmailAndPassword(body: any): body is { email: string; password: string; expiresInSeconds?: number} {
    return (
        body &&
        typeof body === 'object' &&
        "email" in body &&
        body.email &&
        (
            typeof body.email === 'string' ||
            body.email instanceof String
        ) &&
        "password" in body &&
        body.password &&
        (
            typeof body.password === 'string' ||
            body.password instanceof String
        )
    );
};

type payload = Pick<JwtPayload, "iss" | "sub" | "iat" | "exp" >
export async function makeJWT(userID: string, expiresIn: number, secret: string): Promise<string> {
    const iss = "chirpy";
    const sub = userID;
    const iat = Math.floor(Date.now() / 1000);
    const exp = iat + expiresIn;
    const payload: payload = { iss, sub, iat, exp }
    return await jwt.sign(payload, secret);
};

export async function validateJWT(tokenString: string, secret: string): Promise<string> {
    let decodedString;
    try {
        decodedString = await jwt.verify(tokenString, secret);
    } catch (err) {
        if (err instanceof Error ) {
            throw new UnauthorizedError("Unauthorized user");
        }
    }

    if (!decodedString || !(typeof decodedString.sub === "string")) {
        throw new Error("Error decoding token");
    }

    return decodedString.sub;
}

export async function getBearerToken(req: Request): Promise<string> {
    const auth = await req.get("Authorization");
    if (!auth || !auth.includes("Bearer")) {
        throw new UnauthorizedError("Error: No token found or incorrect authorization format");
    }

    return auth.split(" ")[1];
};

export async function makeRefreshToken() {
    const randData = await crypto.randomBytes(32);
    return randData.toString("hex");
};
export async function createToken(userId: string): Promise<string> {
    const { serverSecret } = await getConfig();
    const hourExpiration = 60 * 60;

    return await makeJWT(userId, hourExpiration, serverSecret);
}
