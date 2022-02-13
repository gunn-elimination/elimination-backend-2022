import { RESTMethods, RESTHandler, User } from "../../../types/DisadusTypes";
import TetLib from "../../Helpers/TetLib";
import {
  createUser,
  getUserByEmail,
  getUserByID,
} from "../../Helpers/UserAPIs";
import nodemailer from "nodemailer";
import { env } from "../../../env";
export const GetGame = {
  path: "/verify/:verificationNonce",
  method: RESTMethods.POST,
  sendUser: false,
  run: async (req, res, next, _) => {
    const nonce = req.params.verificationNonce;
    if (!nonce) {
      return res.status(400).redirect("Bad Request");
    }
    const user = await MongoDB.db("UserData")
      .collection("unverifiedUsers")
      .findOne({
        verificationNonce: nonce,
      });
    if (!user) {
      return res.status(404).send("User not found");
    }
    delete user.verificationNonce;

    const response = await createUser(user as unknown as User);
    if (response.success) {
      return res.status(200).send(user);
    }
    return res.status(500).send(response.message);
  },
} as RESTHandler;
export default GetGame;
