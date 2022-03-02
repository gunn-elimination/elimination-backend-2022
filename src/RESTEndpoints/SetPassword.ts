import { RESTMethods, RESTHandler, User } from "../../types/DisadusTypes";
import phas from "password-hash-and-salt";
interface UnverifiedUser extends User {
  verificationNonce?: string;
  redirectURL?: string;
}
export const GetGame = {
  path: "/set-password",
  method: RESTMethods.POST,
  sendUser: false,
  run: async (req, res, next, _) => {
    const { password, token } = req.body;
    if (!password || !token) {
      return res.status(400).redirect("Bad Request");
    }
    const user = (await MongoDB.db("UserData")
      .collection("resetPasswords")
      .findOne({
        verificationNonce: token,
      })) as unknown as UnverifiedUser;
    if (!user) {
      return res.status(404).send("User not found");
    }
    const newpass = await new Promise((res, rej) =>
      phas(password).hash((err, hash) => {
        if (err) rej(err);
        res(hash);
      })
    );
    await MongoDB.db("UserData")
      .collection("users")
      .updateOne({ userID: user.userID }, { $set: { password: newpass } });
    await MongoDB.db("UserData").collection("resetPasswords").findOneAndDelete({
      verificationNonce: token,
    });
    res.status(200).send("Password changed");
    return;
  },
} as RESTHandler;
export default GetGame;
