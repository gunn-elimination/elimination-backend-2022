import { RESTMethods, RESTHandler } from "../../../types/DisadusTypes";
import TetLib from "../../Helpers/TetLib";
import { getUserByEmail, getUserByID } from "../../Helpers/UserAPIs";
import nodemailer from "nodemailer";
import { env } from "../../../env";
import { buildEmail } from "../../Helpers/BuildEmail";
export const Signup = {
  path: "/signup",
  method: RESTMethods.POST,
  sendUser: false,
  run: async (req, res, next, _) => {
    res.status(400).send("Signup is disabled");
    return;
    const data = {
      email: req.body.email as string,
      password: req.body.password as string,
      firstName: req.body.firstName as string,
      lastName: req.body.lastName as string,
      redirectURL: req.body.redirectURL as string,
      createdBy: req.body.createdBy as string,
    };
    if (
      !data.firstName ||
      !data.lastName ||
      !data.email ||
      !data.password ||
      !data.redirectURL ||
      !data.createdBy
    ) {
      //log missing data
      const missing = [];
      if (!data.firstName) missing.push("firstName");
      if (!data.lastName) missing.push("lastName");
      if (!data.email) missing.push("email");
      if (!data.password) missing.push("password");
      if (!data.redirectURL) missing.push("redirectURL");
      if (!data.createdBy) missing.push("createdBy");
      return res.status(400).send(`Missing ${missing.join(", ")}`);
    }
    const emailExists = await getUserByEmail(data.email);
    if (emailExists) {
      return res.status(409).send("Email already exists");
    }
    if (!/@pausd.us/.test(data.email)) {
      return res.status(400).send("Email not whitelisted");
    }
    const unverifiedUserExists = await MongoDB.db("UserData")
      .collection("unverifiedUsers")
      .findOne({
        email: data.email,
      });
    if (unverifiedUserExists) {
      return res.status(409).send("Email already exists in unverifiedUsers");
    }
    const verificationNonce = TetLib.genID(46);
    MongoDB.db("UserData")
      .collection("unverifiedUsers")
      .insertOne({ ...data, verificationNonce })
      .then(async () => {
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
            to: data.email,
            subject: "Verify your email",
            text: `
            Hello ${data.firstName} ${data.lastName},
            Please verify your email by clicking the link below:
            https://api.gunnelimination.com/verify/${verificationNonce}
          `,
            html: buildEmail(
              `https://api.gunnelimination.com/verify/${verificationNonce}`,
              data.firstName
            ),
          });
        res.status(200).send("OK");
      })
      .catch(() => {
        res.status(500).send("Internal Server Error");
      });
  },
} as RESTHandler;
export default Signup;
