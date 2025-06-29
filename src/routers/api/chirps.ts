import { Request, Response, NextFunction } from "express";
import { cleanFilth } from "../../filteredWords.js";
import { BadRequestError, ForbiddenError, NotFoundError, UnauthorizedError } from "../../types/errors.js";
import { NewChirp } from "../../db/schema.js";
import { createChirp, deleteChirp, getChirpById, getChirps } from "../../db/queries/chirps.js";
import { getBearerToken, validateJWT } from "../../auth.js";
import { getConfig } from "../../config.js";


export async function handlerCreateChirp(req: Request, res: Response, next: NextFunction) {
    const {serverSecret} = await getConfig();
    try {
        const token = await getBearerToken(req);
        const userId = await validateJWT(token, serverSecret);
        const {body} = await validateChirp(req.body);

        const cleanedChirp = await cleanFilth(body);
        const newChirp = await createChirp(cleanedChirp, userId);
        res.status(201).json(newChirp);

    } catch (err) {
        next(err);
    }
};

export async function handlerDeleteChirp(req: Request, res: Response, next: NextFunction) {
    const {serverSecret} = await getConfig();
    try {
        const token = await getBearerToken(req);
        const userId = await validateJWT(token, serverSecret);
        const chirpId = req.params.chirpID;
        const chirp = await getChirpById(chirpId);
        if (!chirp) {
            throw new NotFoundError("Chirp not found");
        }
        if (chirp.userId !== userId) {
            throw new ForbiddenError("Unauthorized: request denied");
        }

        const deletedChirp = await deleteChirp(chirpId);
        
        res.status(204).end();

    } catch (err) {
        next(err);
    }
};

export async function handlerGetChirps(_: Request, res: Response, next: NextFunction) {
    try {
        const chirps = await getChirps();
        res.status(200).json(chirps);

    } catch (err) {
        next(err);
    }
};

export async function handlerGetChirpById(req: Request, res: Response, next: NextFunction) {
    try {
        const {chirpID} = req.params;
        if (!chirpID) {
            throw new NotFoundError("no matching chirp found")
        }
        
        const chirp = await getChirpById(chirpID);
        if (!chirp) {
            throw new NotFoundError("no matching chirp found");
        }
        res.status(200).json(chirp);

    } catch (err) {
        next(err);
    }
};

function isChirp(chirp: any): chirp is NewChirp {
    return (
        chirp &&
        typeof chirp === 'object' &&
        'body' in chirp &&
        (
            typeof chirp.body === 'string' ||
            chirp.body instanceof String
        )
    );
};

function validateChirp(params: any): NewChirp {
    switch (true) {
        case !isChirp(params):
            throw new BadRequestError("Invalid JSON format");
        case params.body.length === 0:
            throw new BadRequestError("Chirp must have content");
        case params.body.length > 140:
            throw new BadRequestError("Chirp is too long. Max length is 140");
        default:
            return params
    }
};