import { RESTMethods, RESTHandler } from "../../../types/DisadusTypes";
import { EliminationAPIs } from "../../Helpers/EliminationAPIs";
import { getGameFromID, updateGameInfo } from "../../Helpers/GamesAPI";
import nFetch from "../../Utils/fetch";
import SocketEventManager from "../../Utils/SocketEventManager";
export const GetUserSelf = {
  path: "/elimination/game/:gameID/admin/start",
  method: RESTMethods.POST,
  sendUser: true,
  run: async (req, res, next, user) => {
    const { gameID } = req.params;
    if (!gameID || !user) {
      return res.status(400).send("Bad Request");
    }
    const game = await getGameFromID(gameID);

    if (!game) {
      return res.status(400).send("Invalid Game ID");
    }
    if (!user.admin) {
      return res.status(403).send("Forbidden");
    }
    const result = await EliminationAPIs.initializeEliminationGame(game);
    const updatedGame = {
      ...game,
      start: Date.now(),
    };
    await updateGameInfo(game.id, {
      start: updatedGame.start,
    });
    SocketEventManager.broadcastEvent("all", "gameStarted", {
      gameInfo: updatedGame,
    });
    SocketEventManager.broadcastEvent("all", "gameUpdated", {
      gameInfo: updatedGame,
    });
    res.status(200).send(result);
  },
} as RESTHandler;
export default GetUserSelf;
