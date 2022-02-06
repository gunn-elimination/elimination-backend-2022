import { RESTMethods, RESTHandler } from "../../../types/DisadusTypes";
import { EliminationAPIs } from "../../Helpers/EliminationAPIs";
export const GetEliminationKillFeed = {
  path: "/elimination/game/:gameID/kills",
  method: RESTMethods.GET,
  sendUser: true,
  run: async (req, res, next, user) => {
    const { gameID } = req.params;
    const limit = Math.min(Number(req.query.limit) || 75, 75);
    const before = Number(req.query.before) || 0;

    if (!gameID || !user) {
      return res.status(400).send("Bad Request");
    }
    res.status(200).send(await EliminationAPIs.getEliminationKillFeed(gameID, limit));
  },
} as RESTHandler;
export default GetEliminationKillFeed;