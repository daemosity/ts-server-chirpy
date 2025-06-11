import { Request, Response, NextFunction } from "express";
import { cleanFilth } from "../../filteredWords.js";
import { BadRequestError, NotFoundError } from "../../types/errors.js";
import { NewChirp } from "../../db/schema.js";
import { createChirp, getChirpById, getChirps } from "../../db/queries/chirps.js";


export async function handlerCreateChirp(req: Request, res: Response, next: NextFunction) {
    try {
        const {body, userId} = validateChirp(req.body);

        const cleanedChirp = cleanFilth(body);
        const newChirp = await createChirp(cleanedChirp, userId);
        res.status(201).json(newChirp);

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
        ) &&
        'userId' in chirp &&
        (
            typeof chirp.userId === 'string' ||
            chirp.userId instanceof String
        )
    );
};

function validateChirp(params: any): NewChirp {
    switch (true) {
        case !isChirp(params):
            console.log("not chirp")
            throw new BadRequestError("Invalid JSON format");
        case params.body.length === 0:
            throw new BadRequestError("Chirp must have content");
        case params.body.length > 140:
            throw new BadRequestError("Chirp is too long. Max length is 140");
        default:
            return params
    }
};