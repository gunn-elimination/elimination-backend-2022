import { RESTMethods, RESTHandler } from "../../../types/DisadusTypes";
import { EliminationAPIs } from "../../Helpers/EliminationAPIs";
import { getAnnouncements, getGameFromID } from "../../Helpers/GamesAPI";
export const ListAnnouncements = {
  path: "/game/:gameID/announcements",
  method: RESTMethods.GET,
  sendUser: false,
  run: async (req, res, next, _) => {
    const gameID = req.params.gameID;
    if (!gameID) {
      await next();
      res.status(400).send("Bad Request");
      return;
    }
    res.status(200).send(await getAnnouncements(gameID));
  },
} as RESTHandler;
export default ListAnnouncements;
