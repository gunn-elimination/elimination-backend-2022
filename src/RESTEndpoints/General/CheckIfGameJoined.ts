import { RESTMethods, RESTHandler } from "../../../types/DisadusTypes";
import {
  getGameFromID,
  getParticipant,
  joinGame,
} from "../../Helpers/GamesAPI";
export const JoinCommunityGame = {
  path: "/game/:gameID/joined",
  method: RESTMethods.GET,
  sendUser: true,
  run: async (req, res, next, user) => {
    const gameID = req.params.gameID;
    if (user && (await getParticipant(gameID, user.userID))) {
      return res.status(200).send({
        joined: true,
      });
    }
    res.status(200).send({
      joined: false,
    });
  },
} as RESTHandler;
export default JoinCommunityGame;
