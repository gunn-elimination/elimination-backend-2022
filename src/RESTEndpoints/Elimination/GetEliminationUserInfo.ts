import { RESTMethods, RESTHandler } from "../../../types/DisadusTypes";
import { EliminationAPIs } from "../../Helpers/EliminationAPIs";
export const GetElimUserInfo = {
  path: "/elimination/game/:gameID/user/:id",
  method: RESTMethods.GET,
  run: async (req, res, next) => {
    const userID = req.params.id;
    const gameID = req.params.gameID;
    if (!gameID || !userID) {
      return res.status(400).send("Bad Request");
    }
    const participant = await EliminationAPIs.getEliminationParticipant(
      gameID,
      userID
    );

    delete participant!.secret;
    delete participant!.targetID;
    res.status(200).send(participant);
  },
} as RESTHandler;
export default GetElimUserInfo;
