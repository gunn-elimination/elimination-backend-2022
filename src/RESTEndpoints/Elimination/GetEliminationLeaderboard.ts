import { RESTMethods, RESTHandler } from "../../../types/DisadusTypes";
import { EliminationAPIs } from "../../Helpers/EliminationAPIs";
export const GetEliminatioonLeaderboard = {
  path: "/elimination/game/:gameID/top",
  method: RESTMethods.GET,
  sendUser: true,
  run: async (req, res, next, user) => {
    const gameID = req.params.gameID;
    const limit = Math.min(Number(req.query.limit) || 75, 75);

    if (!gameID || !user) {
      return res.status(400).send("Bad Request");
    }
    res.status(200).send(await EliminationAPIs.leaderboard(gameID, limit));
  },
} as RESTHandler;
export default GetEliminatioonLeaderboard;
