import { RESTMethods, RESTHandler, User } from "../../../types/DisadusTypes";
import TetLib from "../../Helpers/TetLib";
import {
  createUser,
  getUserByEmail,
  getUserByID,
} from "../../Helpers/UserAPIs";
import nodemailer from "nodemailer";
import { env } from "../../../env";
import { Encryptions } from "../../Helpers/Encryptions";
interface UnverifiedUser extends User {
  verificationNonce?: string;
}
export const GetGame = {
  path: "/verify/:verificationNonce",
  method: RESTMethods.POST,
  sendUser: false,
  run: async (req, res, next, _) => {
    const nonce = req.params.verificationNonce;
    if (!nonce) {
      return res.status(400).redirect("Bad Request");
    }
    const user = (await MongoDB.db("UserData")
      .collection("unverifiedUsers")
      .findOne({
        verificationNonce: nonce,
      })) as unknown as UnverifiedUser;
    if (!user) {
      return res.status(404).send("User not found");
    }
    delete user.verificationNonce;
    user.userID = user.email.split("@")[0].toUpperCase();
    const response = await createUser(user as unknown as User);
    if (response.success) {
      return res
        .status(200)
        .send(await Encryptions.issueUserToken(user.userID));
    }
    return res.status(500).send(response.message);
  },
} as RESTHandler;
export default GetGame;
