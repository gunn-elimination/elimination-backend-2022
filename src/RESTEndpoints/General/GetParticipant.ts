import { RESTMethods, RESTHandler } from "../../../types/DisadusTypes";
import { EliminationAPIs } from "../../Helpers/EliminationAPIs";
import {
  getGameFromID,
  getParticipant,
  getParticipants,
} from "../../Helpers/GamesAPI";
export const GetGame = {
  path: "/game/:gameID/participants/self",
  method: RESTMethods.GET,
  sendUser: true,
  run: async (req, res, next, user) => {
    const gameID = req.params.gameID;
    if (!gameID || !user) {
      return res.status(400).send("Bad Request");
    }
    const participant = await getParticipant(gameID, user.id);
    (participant ? res.status(200) : res.status(404)).send(participant);
  },
} as RESTHandler;
export default GetGame;
