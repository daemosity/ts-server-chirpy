import { Request, Response, NextFunction } from "express";
import { createUser } from "../../db/queries/users.js";
import { BadRequestError } from "../../types/errors.js";
import { hasEmailAndPassword, hashPassword } from "../../auth.js";


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

