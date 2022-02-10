import { RESTMethods, RESTHandler } from "../../../types/DisadusTypes";
import { GameType } from "../../../types/MinigameTypes";
import { EliminationAPIs } from "../../Helpers/EliminationAPIs";
import { createGame } from "../../Helpers/GamesAPI";
import { getGameFromID } from "../../Helpers/GamesAPI";
import SocketEventManager from "../../Utils/SocketEventManager";
export const CreateGame = {
  path: "/createGame/",
  method: RESTMethods.POST,
  sendUser: true,
  run: async (req, res, next, user) => {
    const game = {
      game: req.body.game as GameType,
      end: req.body.end as number,
      name: req.body.name as string,
    };
    if (!game) {
      res.status(400).send("Bad Request");
      return;
    }
    if (!user.admin) {
      res.status(403).send("Forbidden");
      return;
    }
    SocketEventManager.broadcastEvent(
      "all",
      "gameCreated",
      await createGame(game)
    );
    res.status(204).send();
  },
} as RESTHandler;
export default CreateGame;
