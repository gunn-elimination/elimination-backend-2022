import { RESTMethods, RESTHandler } from "../../../types/DisadusTypes";
import { EliminationAPIs } from "../../Helpers/EliminationAPIs";
export const ShuffleTargets = {
  path: "/elimination/game/:gameID/shuffle",
  method: RESTMethods.POST,
  sendUser: true,
  run: async (req, res, next, user) => {
    const { gameID } = req.params;
    if (!gameID || !user || !user.admin) {
      return res.status(400).send("Bad Request. invalid user, or not admin");
    }
    await EliminationAPIs.shuffle(gameID);
    res.status(200).send("Shuffled");
  },
} as RESTHandler;
export default ShuffleTargets;
