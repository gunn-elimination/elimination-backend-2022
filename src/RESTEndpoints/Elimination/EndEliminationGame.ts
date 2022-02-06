import { RESTMethods, RESTHandler } from "../../../types/DisadusTypes";
import { EliminationAPIs } from "../../Helpers/EliminationAPIs";
import { getGameFromID } from "../../Helpers/GamesAPI";
export const GetUserSelf = {
  path: "/elimination/game/:gameID/admin/end",
  method: RESTMethods.POST,
  sendUser: true,
  run: async (req, res, next, user) => {
    const { gameID, userID } = req.params;
    const eliminationCode = req.body.eliminationCode;
    if (!gameID || !userID || !user || !eliminationCode) {
      return res.status(400).send("Bad Request");
    }
    const game = await getGameFromID(gameID);
    if (!game) {
      return res.status(400).send("Invalid Game ID");
    }
    const result = await EliminationAPIs.initializeEliminationGame(game);
    res.status(200).send(result);
  },
} as RESTHandler;
export default GetUserSelf;
