import { RESTMethods, RESTHandler } from "../../../types/DisadusTypes";
import { EliminationAPIs } from "../../Helpers/EliminationAPIs";
import {
  createAnnouncement,
  getAnnouncements,
  getGameFromID,
  getGames,
} from "../../Helpers/GamesAPI";
export const CreateAnnouncement = {
  path: "/game/:gameID/announcements",
  method: RESTMethods.POST,
  sendUser: true,
  run: async (req, res, next, user) => {
    if (!user || !user.admin) {
      res.status(401).send("Unauthorized");
      return;
    }
    const gameID = req.params.gameID;
    if (!gameID) {
      await next();
      res.status(400).send("Bad Request");
      return;
    }
    const announcement = req.body.message;
    if (!announcement) {
      res.status(400).send("Bad Request, no message");
      return;
    }
    const game = await getGameFromID(gameID);
    if (!game) {
      res.status(400).send("Bad Request, game not found");
      return;
    }
    const result = await createAnnouncement(game, announcement, user.userID);
    if (result) {
      res.status(200).send("Announcement created");
    } else {
      res.status(400).send(result);
    }
  },
} as RESTHandler;
export default CreateAnnouncement;
