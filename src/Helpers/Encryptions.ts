import jwt from "jsonwebtoken";
import { env } from "../../env";
export enum UserTokenTypes {
  USER = 0,
  OAUTH = 1,
  PLUGIN = 2,
  APP = 3,
}
export type AppID = "Disadus" | "Gunn.One" | "WATT" | "Standalone";
export class Encryptions {
  /**
   * Signs a payload with the JWT secret
   * @param {string|object|Buffer} payload
   * @return {Promise<String>}
   */
  static encrypt(payload: string | object | Buffer) {
    return new Promise((res, rej) =>
      jwt.sign(
        payload,
        env.jwtSecret,
        { algorithm: "RS512" },
        (er: any, encrypted: unknown) => (er ? rej(er) : res(encrypted))
      )
    );
  }
  /**
   * Decrypts a payload with the JWT secret
   */
  static decrypt(encryptedPayload: string) {
    return new Promise((res, rej) =>
      jwt.verify(
        encryptedPayload.replace(/^(Bearer|App) /, ""),
        env.jwtSecret,
        { algorithms: ["RS512"], ignoreExpiration: true },
        (er, decrypted) => (er ? rej(er) : res(decrypted as any))
      )
    ) as Promise<{
      data: {
        tokenType: UserTokenTypes;
        userID?: string;
        appID?: AppID;
      };
    }>;
  }
  /**
   * Issues a JWT token with the userID. Expires in 2 weeks or whatever specified in seconds
   * @param {string} userID
   * @param {number} expiration
   * @return {Promise<string>}
   */
  static issueUserToken(userID: any, expiration = 1209600) {
    let payload = {
      data: {
        tokenType: UserTokenTypes.USER,
        userID: userID,
      },
      exp: Math.floor(Date.now() / 1000) + expiration,
    };
    return this.encrypt(payload);
  }
  static issueAppToken(appID: string, expiration = 1209600) {
    let payload = {
      data: {
        tokenType: UserTokenTypes.APP,
        appID,
      },
      exp: Math.floor(Date.now() / 1000) + expiration,
    };
    return this.encrypt(payload) as Promise<string>;
  }
}
/**
 * @typedef {Object} UserPayload
 * @property {string} userID
 * @property {number} tokenType
 */
