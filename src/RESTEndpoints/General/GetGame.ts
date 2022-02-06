import { RESTMethods, RESTHandler } from "../../../types/DisadusTypes";
import { EliminationAPIs } from "../../Helpers/EliminationAPIs";
import { getGameFromID } from "../../Helpers/GamesAPI";
export const GetGame = {
  path: "/game/:gameID",
  method: RESTMethods.GET,
  sendUser: false,
  run: async (req, res, next, user) => {
    const gameID = req.params.gameID;
    if (!gameID) {
      return res.status(400).send("Bad Request");
    }
    res.status(200).send(await getGameFromID(gameID));
  },
} as RESTHandler;
export default GetGame;
