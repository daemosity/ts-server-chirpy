import { createUser } from "../../db/queries/users.js";
import { BadRequestError } from "../../types/errors.js";
export async function handlerCreateUser(req, res, next) {
    try {
        const { body } = req;
        if (hasEmail(body)) {
            const { email } = body;
            const newUser = await createUser({ email: email });
            if (!newUser) {
                throw new BadRequestError("Error: user already exists");
            }
            res.status(201).json({ ...newUser });
        }
        else {
            throw new BadRequestError("Error: email field required");
        }
    }
    catch (err) {
        next(err);
    }
}
;
function hasEmail(body) {
    return (body &&
        typeof body === 'object' &&
        "email" in body &&
        body.email &&
        (typeof body.email === 'string' ||
            body.email instanceof String));
}
;
