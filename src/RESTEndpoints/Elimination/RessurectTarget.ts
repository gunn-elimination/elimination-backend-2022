import { RESTMethods, RESTHandler } from "../../../types/DisadusTypes";
import { EliminationAPIs } from "../../Helpers/EliminationAPIs";
export const GetUserSelf = {
  path: "/elimination/game/:gameID/user/:userID/resurrect",
  method: RESTMethods.POST,
  sendUser: true,
  run: async (req, res, next, user) => {
    const { gameID, userID } = req.params;
    if (!gameID || !userID || !user || !user.admin) {
      return res.status(400).send("Bad Request. invalid user, or not admin");
    }
    const result = await EliminationAPIs.revive(
      gameID,
      userID,
      user.userID,
    );
    if (result === true) {
      res.status(200).send("Resurrected");
    } else {
      res.status(400).send(result);
    }
  },
} as RESTHandler;
export default GetUserSelf;
