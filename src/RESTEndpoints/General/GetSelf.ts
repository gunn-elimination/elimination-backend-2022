import { RESTMethods, RESTHandler } from "../../../types/DisadusTypes";
import { getUserByID } from "../../Helpers/UserAPIs";
export const getSelf = {
  path: "/users/@me",
  method: RESTMethods.GET,
  sendUser: true,
  run: async (req, res, next, user) => {
    if (!user) res.status(404).send("User not found");
   res.status(200).send(user);
  },
} as RESTHandler;
export default getSelf;
