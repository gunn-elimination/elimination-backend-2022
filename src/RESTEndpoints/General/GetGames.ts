import { RESTMethods, RESTHandler } from "../../../types/DisadusTypes";
import { EliminationAPIs } from "../../Helpers/EliminationAPIs";
import { getGames } from "../../Helpers/GamesAPI";
export const getGamesAPI = {
  path: "/games",
  method: RESTMethods.GET,
  sendUser: false,
  run: async (req, res, next, _) => {
    let allGames = await getGames();
    if (!req.query.dev) {
      allGames = allGames.filter((game) => !game.dev);
    }
    res.status(200).send(allGames);
  },
} as RESTHandler;
export default getGamesAPI;
