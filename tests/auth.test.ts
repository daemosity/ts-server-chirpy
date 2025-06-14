import { describe, it, expect, beforeAll } from "vitest";
import { makeJWT, validateJWT, hashPassword, checkPasswordHash, getBearerToken } from "../src/auth";
import { request } from "express";

describe("JWT Validation",  () => {
    const rightSecret = "boardgames";
    const wrongSecret = "wrongSecret";
    const userId = "userExample";
    const secondsTilExpired = 2;
    const expiredTime = 0;

    let unexpiredToken: string;
    let expiredToken: string;
    beforeAll(async() => {
        unexpiredToken = await makeJWT(userId, secondsTilExpired, rightSecret);
        expiredToken = await makeJWT(userId, expiredTime, rightSecret);
    })
    
    it("should validate a token within the time limit and rightSecret", async () => {
        const result = await validateJWT(unexpiredToken, rightSecret);
        expect(result).toBe(userId);
    });
    
    it("should throw an error after exp time with token and rightSecret", async () => {
        const promise = Promise.reject(setTimeout(async () => {
            const result = await validateJWT(unexpiredToken, rightSecret);
            
        }));
        await expect(promise).rejects.toThrowError();
    });
    
    it("should throw an error after exp time with token and rightSecret", async () => {
        const promise = async () => await validateJWT(expiredToken, rightSecret)
        await expect(promise).rejects.toThrowError(/Unauthorized/);
    });
    
    it("should throw an error if wrong secret is used", async () => {
        const promise = async () => await validateJWT(unexpiredToken, wrongSecret)
        await expect(promise).rejects.toThrowError(/Unauthorized/);
    });
});

describe("Retrieve Bearer Token", () => {
    const tokenString = "tokenStringExample";
    
    it("Should return the correct token", () => {
        const req = request;
        req.headers.authorization = `Bearer ${tokenString}`;
        const result = getBearerToken(req);
        expect(result).toBe(tokenString);
    })
    
    it("Show throw an error if not in correct format", () => {
        const wrongAuthReq = request;
        wrongAuthReq.headers.authorization = tokenString;
        expect(() => getBearerToken(wrongAuthReq)).toThrowError(/incorrect/);
    })
});

describe("Password Hashing", () => {
  const password1 = "correctPassword123!";
  const password2 = "anotherPassword456!";
  let hash1: string;
  let hash2: string;

  beforeAll(async () => {
    hash1 = await hashPassword(password1);
    hash2 = await hashPassword(password2);
  });

  it("should return true for the correct password", async () => {
    const result = await checkPasswordHash(password1, hash1);
    expect(result).toBe(true);
  });
});