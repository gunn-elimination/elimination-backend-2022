import { RESTMethods, RESTHandler } from "../../../types/DisadusTypes";
import { EliminationAPIs } from "../../Helpers/EliminationAPIs";
export const GetUserSelf = {
  path: "/elimination/game/:gameID/user/:userID/eliminate",
  method: RESTMethods.POST,
  sendUser: true,
  run: async (req, res, next, user) => {
    const { gameID, userID } = req.params;
    const eliminationCode = req.body.eliminationCode;
    if (!gameID || !userID || !user || !eliminationCode) {
      return res.status(400).send("Bad Request");
    }
    const result = await EliminationAPIs.eliminateParticipant(
      gameID,
      user.id,
      userID,
      eliminationCode
    );
    if (result === true) {
      res.status(200).send("Eliminated");
    } else {
      res.status(400).send(result);
    }
  },
} as RESTHandler;
export default GetUserSelf;
