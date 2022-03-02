import { env } from "../../env";
import { RESTMethods, RESTHandler, User } from "../../types/DisadusTypes";
import { buildEmail } from "../Helpers/BuildEmail";
import TetLib from "../Helpers/TetLib";
import { getUserByEmail } from "../Helpers/UserAPIs";
import nodemailer from "nodemailer";
export const Signup = {
  path: "/forgot-password",
  method: RESTMethods.POST,
  sendUser: false,
  run: async (req, res, next, _) => {
    const { email, redirectURL } = req.body;
    if (!email || !redirectURL) {
      return res.status(400).send(`Missing email or redirectURL`);
    }
    const unverifiedUserExists = await MongoDB.db("UserData")
      .collection("resetPasswords")
      .findOne({
        email,
      });
    if (unverifiedUserExists) {
      return res.status(409).send("Email already exists");
    }
    const verificationNonce = TetLib.genID(128);
    const emailExists = (await getUserByEmail(email)) as any as User;
    if (!emailExists) {
      return res.status(409).send("Email does not exist");
    }
    const emailData = {
      email,
      userID: emailExists.userID,
      redirectURL,
      verificationNonce,
    };
    await MongoDB.db("UserData")
      .collection("resetPasswords")
      .insertOne(emailData);
    await nodemailer
      .createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: env.email.email,
          pass: env.email.password,
        },
      })
      .sendMail({
        from: `Gunn Elimination <support@gunnelimination.com>`,
        to: emailExists.email,
        subject: "Reset your password",
        text: `
            Hello ${emailExists.firstName} ${emailExists.lastName},
            Please reset your password by clicking the link below:
            ${redirectURL}?token=${verificationNonce}
          `,
      });
    res.status(200).send("OK");
  },
} as RESTHandler;
export default Signup;
