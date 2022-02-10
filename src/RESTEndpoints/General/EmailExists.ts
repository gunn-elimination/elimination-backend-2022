import e from "express";
import { RESTMethods, RESTHandler } from "../../../types/DisadusTypes";
import { getUserByEmail, getUserByID } from "../../Helpers/UserAPIs";
export const GetGame = {
  path: "/emailexists/:email",
  method: RESTMethods.GET,
  sendUser: false,
  run: async (req, res, next, _) => {
    const { email } = req.params;
    if (!email) {
      return res.status(400).send("Bad Request");
    }
    const user = await getUserByEmail(email);
    (user ? res.status(200) : res.status(404)).send(!!user);
  },
} as RESTHandler;
export default GetGame;
