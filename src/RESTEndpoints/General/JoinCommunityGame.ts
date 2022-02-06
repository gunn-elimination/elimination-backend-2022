import { RESTMethods, RESTHandler } from "../../../types/DisadusTypes";
import {
  getGameFromID,
  getParticipant,
  joinGame,
} from "../../Helpers/GamesAPI";
export const JoinCommunityGame = {
  path: "/game/:gameID/join",
  method: RESTMethods.POST,
  sendUser: true,
  run: async (req, res, next, user) => {
    const gameID = req.params.gameID;
    if (!gameID || !user) {
      return res.status(400).send("Bad Request");
    }
    if (!(await getGameFromID(gameID))) {
      return res.status(404).send("Game not found");
    }
    if (await getParticipant(gameID, user.id)) {
      return res.status(400).send("Already in game");
    }
    await joinGame(gameID, user.id);
    res.status(200).send("Joined game");
  },
} as RESTHandler;
export default JoinCommunityGame;
