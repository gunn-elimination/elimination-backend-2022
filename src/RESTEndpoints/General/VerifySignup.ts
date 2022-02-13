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
  redirectURL?: string;
}
export const GetGame = {
  path: "/verify/:verificationNonce",
  method: RESTMethods.GET,
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
    const redirectURL = user.redirectURL;
    delete user.verificationNonce;
    delete user.redirectURL;
    user.userID = user.email.split("@")[0].toUpperCase();
    const response = await createUser(user as unknown as User);
    if (response.success) {
      await MongoDB.db("UserData")
        .collection("unverifiedUsers")
        .findOneAndDelete({
          verificationNonce: nonce,
        });
      const token = await Encryptions.issueUserToken(user.userID).catch(
        (er) => {
          console.log(er);
        }
      );
      console.log(token, user);
      res.redirect(`${redirectURL}?token=${token}`);
      return;
    }
    return res.status(500).send(response.message);
  },
} as RESTHandler;
export default GetGame;
