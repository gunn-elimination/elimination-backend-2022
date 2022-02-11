import { RESTMethods, RESTHandler, User } from "../../../types/DisadusTypes";
import { Encryptions } from "../../Helpers/Encryptions";
import { createUser, getUserByID } from "../../Helpers/UserAPIs";
export const GetGame = {
  path: "/createUser",
  method: RESTMethods.POST,
  sendUser: false,
  run: async (req, res, next, _) => {
    const authInfo = req.headers.authorization;
    if (!authInfo || !authInfo.startsWith("App ")) {
      return res.status(401).send("Unauthorized");
    }
    const token = authInfo.substring(4);
    const tokenInfo = await Encryptions.decrypt(token).catch(() => {});
    if (!tokenInfo) {
      return res.status(401).send("Unauthorized");
    }
    const {
      data: { appID },
    } = tokenInfo;
    if (!appID) {
      return res.status(401).send("Unauthorized");
    }
    /*
    {"_id":{"$oid":"61ff707133c07a29b7346230"},"userID":"TET00","username":"teto","firstName":"John","lastName":"Li","email":"tet@tet.moe","createdBy":"Disadus","admin":true,"pfp":"https://disadus.app/logo.png"}
    */
    const {
      userID,
      username,
      firstName,
      lastName,
      email,
      admin,
      pfp,
      password,
    } = req.body;
    const fields = [
      userID,
      username,
      firstName,
      lastName,
      email,
      pfp,
      password,
    ];
    const missingFields = fields.filter((field) => !field);
    if (missingFields.length > 0) {
      return res
        .status(400)
        .send(`Missing Fields: ${missingFields.join(", ")}`);
    }
    const user = await getUserByID(userID);
    if (user) {
      return res.status(409).send("User Already Exists");
    }
    const newUser = {
      userID,
      username,
      firstName,
      lastName,
      email,
      admin,
      pfp,
      createdBy: appID,
      password,
    } as User;
    res.status(200).json(await createUser(newUser));
  },
} as RESTHandler;
export default GetGame;
