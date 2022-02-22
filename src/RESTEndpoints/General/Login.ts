import { RESTMethods, RESTHandler, User } from "../../../types/DisadusTypes";
import { Encryptions, UserTokenTypes } from "../../Helpers/Encryptions";
import { getUserByEmail, getUserByID } from "../../Helpers/UserAPIs";
import phas from "password-hash-and-salt";
export const Login = {
  path: "/login",
  method: RESTMethods.POST,
  sendUser: false,
  run: async (req, res, next, _) => {
    const loginInfo = {
      email: req.body.email,
      password: req.body.password,
    };
    const authInfo = req.headers.authorization;
    if (!authInfo || !authInfo.startsWith("App ")) {
      if (!loginInfo.email || !loginInfo.password) {
        return res.status(400).send("Bad Request");
      }
      const user = (await getUserByEmail(loginInfo.email)) as unknown as User;
      if (!user) {
        return res.status(404).send("User not found");
      }
      phas(loginInfo.password).verifyAgainst(
        user.password,
        async (err, valid) => {
          if (valid) {
            res.status(200).send(await Encryptions.issueUserToken(user.userID));
            return;
          }
          res.status(401).send("Invalid password");
        }
      );
      return;
    }
    const token = authInfo.substring(4);
    const tokenInfo = await Encryptions.decrypt(token).catch((e) => {
      console.warn(e);
      console.warn(token);
    });
    if (
      (!tokenInfo ||
        tokenInfo.data.tokenType !== UserTokenTypes.APP ||
        !tokenInfo.data.appID) &&
      authInfo.startsWith("App ")
    ) {
      return res
        .status(401)
        .send(`Invalid token, ${JSON.stringify(tokenInfo)}`);
    }
    await getUserByEmail(loginInfo.email)
      .then((user) => {
        Encryptions.issueUserToken((user as unknown as User).userID).then(
          (token) => {
            res.status(200).send(token);
          }
        );
      })
      .catch(() => {
        if (tokenInfo?.data.appID) {
          return res.status(469).send("User Does not Exist");
        }
        res.status(401).send("Unauthorized");
      });
  },
} as RESTHandler;
export default Login;
