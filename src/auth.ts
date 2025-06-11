import bcrypt from "bcrypt";

process.loadEnvFile(".env")

export async function hashPassword(password: string) {
    const saltRounds = process.env.SALT_ROUNDS;
    if (saltRounds) {
        const salt = await bcrypt.genSalt(parseInt(saltRounds))
        return await bcrypt.hash(password, salt);
    }
}

export async function checkPasswordHash(password: string, hash: string) {
    return await bcrypt.compare(password, hash)
}

export function hasEmailAndPassword(body: any): body is { email: string; password: string; } {
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
}
;
