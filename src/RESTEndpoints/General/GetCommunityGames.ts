import { RESTMethods, RESTHandler } from "../../../types/DisadusTypes";
import { EliminationAPIs } from "../../Helpers/EliminationAPIs";
import { getGames } from "../../Helpers/GamesAPI";
export const getGamesAPI = {
  path: "/games",
  method: RESTMethods.GET,
  sendUser: false,
  run: async (req, res, next, _) => {
    res.status(200).send(await getGames());
  },
} as RESTHandler;
export default getGamesAPI;
