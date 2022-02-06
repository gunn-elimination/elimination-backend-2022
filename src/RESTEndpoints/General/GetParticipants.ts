import { RESTMethods, RESTHandler } from "../../../types/DisadusTypes";
import { EliminationAPIs } from "../../Helpers/EliminationAPIs";
import { getGameFromID, getParticipants } from "../../Helpers/GamesAPI";
export const GetGame = {
  path: "/game/:gameID/participants",
  method: RESTMethods.GET,
  sendUser: true,
  run: async (req, res, next, user) => {
    const gameID = req.params.gameID;
    if (!gameID || !user) {
      return res.status(400).send("Bad Request");
    }
    res.status(200).send(await getParticipants(gameID));
  },
} as RESTHandler;
export default GetGame;
