import { RESTMethods, RESTHandler } from "../../../types/DisadusTypes";
import { EliminationAPIs } from "../../Helpers/EliminationAPIs";
export const GetElimUserSelf = {
  path: "/elimination/game/:gameID/user/@me/",
  method: RESTMethods.GET,
  sendUser: true,
  run: async (req, res, next, user) => {
    const gameID = req.params.gameID;
    if (!gameID || !user) {
      return res.status(400).send("Bad Request");
    }
    res
      .status(200)
      .send(await EliminationAPIs.getEliminationParticipant(gameID, user.id));
  },
} as RESTHandler;
export default GetElimUserSelf;
