import jwt from "jsonwebtoken";
import { env } from "../env";
import { PluginIntent } from "../RESTAPI/plugins/PluginOAuth";
export enum UserTokenTypes {
  USER = 0,
  OAUTH = 1,
  PLUGIN = 2,
}
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
        (er, encrypted) => (er ? rej(er) : res(encrypted))
      )
    );
  }
  /**
   * Decrypts a payload with the JWT secret
   * @param {string} encryptedPayload
   * @return {Promise<string|object|Buffer>}
   */
  static decrypt(encryptedPayload: string) {
    return new Promise((res, rej) =>
      jwt.verify(
        encryptedPayload,
        env.jwtSecret,
        { algorithms: ["RS512"], ignoreExpiration: true },
        (er, decrypted) => (er ? rej(er) : res(decrypted))
      )
    );
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
  static issueAccessToken(
    userID: string,
    intents: PluginIntent[],
    expiration = 1209600
  ) {
    let payload = {
      data: {
        tokenType: UserTokenTypes.PLUGIN,
        userID: userID,
        intents: intents,
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
