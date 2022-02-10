import { RESTMethods, RESTHandler } from "../../../types/DisadusTypes";
import { GameType } from "../../../types/MinigameTypes";
import { EliminationAPIs } from "../../Helpers/EliminationAPIs";
import { createGame, updateGameInfo } from "../../Helpers/GamesAPI";
import { getGameFromID } from "../../Helpers/GamesAPI";
import SocketEventManager from "../../Utils/SocketEventManager";
export const CreateGame = {
  path: "/game/:gameID/update",
  method: RESTMethods.POST,
  sendUser: true,
  run: async (req, res, next, user) => {
    const game = {
      end: req.body.end as number,
      start: req.body.start as number,
    };
    const gameID = req.params.gameID;
    if (!game) {
      res.status(400).send("Bad Request");
      return;
    }
    if (!user?.admin) {
      res.status(403).send("Forbidden");
      return;
    }
    SocketEventManager.broadcastEvent(
      "all",
      "gameCreated",
      await updateGameInfo(gameID, game)
    );
    res.status(204).send();
  },
} as RESTHandler;
export default CreateGame;
