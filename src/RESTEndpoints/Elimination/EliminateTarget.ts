import { RESTMethods, RESTHandler } from "../../../types/DisadusTypes";
import { EliminationAPIs } from "../../Helpers/EliminationAPIs";
export const GetUserSelf = {
  path: "/elimination/game/:gameID/user/:userID/eliminate",
  method: RESTMethods.POST,
  sendUser: true,
  run: async (req, res, next, user) => {
    const { gameID, userID } = req.params;
    const eliminationCode = (req.body.eliminationCode as string).toUpperCase();
    if (!gameID || !userID || !user || !eliminationCode) {
      return res.status(400).send("Bad Request");
    }
    if (req.query.force && user.admin) {
      const result = await EliminationAPIs.eliminateParticipant(
        gameID,
        user.userID,
        userID,
        eliminationCode,
        user.userID
      );
      if (result === true) {
        res.status(200).send("Eliminated");
      } else {
        res.status(400).send(result);
      }
      return;
    }
    const result = await EliminationAPIs.eliminateParticipant(
      gameID,
      user.userID,
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
