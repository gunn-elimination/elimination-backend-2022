import { RESTMethods, RESTHandler } from "../../../types/DisadusTypes";
import { getUserByID } from "../../Helpers/UserAPIs";
export const GetGame = {
  path: "/users/:userID",
  method: RESTMethods.GET,
  sendUser: false,
  run: async (req, res, next, _) => {
    const { userID } = req.params;
    if (!userID) {
      return res.status(400).send("Bad Request");
    }
    const user = await getUserByID(userID);
    (user ? res.status(200) : res.status(404)).send(user);
  },
} as RESTHandler;
export default GetGame;
