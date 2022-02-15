import { RESTMethods, RESTHandler } from "../../../types/DisadusTypes";
import { EliminationAPIs } from "../../Helpers/EliminationAPIs";
import { getGames } from "../../Helpers/GamesAPI";
export const getGamesAPI = {
  path: "/games",
  method: RESTMethods.GET,
  sendUser: false,
  run: async (req, res, next, user) => {
    const communityID = req.params.communityID;
    if (!communityID) {
      return res.status(400).send("Bad Request");
    }
    res.status(200).send(await getGames());
  },
} as RESTHandler;
export default getGamesAPI;
