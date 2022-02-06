import {
  RESTMethods,
  RESTHandler,
  Community,
} from "../../../types/DisadusTypes";
import { EliminationAPIs } from "../../Helpers/EliminationAPIs";
import { getGameFromID, updateGameInfo } from "../../Helpers/GamesAPI";
import nFetch from "../../Utils/fetch";
import SocketEventManager from "../../Utils/SocketEventManager";
export const GetUserSelf = {
  path: "/elimination/game/:gameID/admin/start",
  method: RESTMethods.GET,
  sendUser: true,
  run: async (req, res, next, user) => {
    const { gameID, userID } = req.params;
    if (!gameID || !userID || !user) {
      return res.status(400).send("Bad Request");
    }
    const game = await getGameFromID(gameID);

    if (!game) {
      return res.status(400).send("Invalid Game ID");
    }
    const community = (await nFetch(
      `https://api.disadus.app/community/${game?.community}`
    ).then((x) => x.json())) as Community;
    if (!community) {
      return res.status(400).send("Invalid Community with Game");
    }
    if (!community.admins.includes(user.id)) {
      return res.status(400).send("User is not authorized to start this game");
    }
    const result = await EliminationAPIs.initializeEliminationGame(game);
    const updatedGame = {
      ...game,
      start: Date.now(),
    };
    await updateGameInfo(game.id, {
      start: updatedGame.start,
    });
    SocketEventManager.broadcastEvent(community.id, "gameStarted", {
      gameInfo: updatedGame,
    });
    res.status(200).send(result);
  },
} as RESTHandler;
export default GetUserSelf;
