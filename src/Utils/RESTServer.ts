import cors from "cors";
import express from "express";
import { readdirSync } from "fs";
import { lstat, readdir } from "fs/promises";
import { env } from "../../env";
import { User, RESTHandler } from "../../types/DisadusTypes";
import SocketServer from "./SocketServer";
import { API_DOMAIN } from "./constants";
import nFetch from "./fetch";
import { getUserByID } from "../Helpers/UserAPIs";
import { Encryptions } from "../Helpers/Encryptions";
const importAllHandlers = async (path: string, server: express.Application) => {
  await Promise.all(
    (
      await readdir(path)
    ).map(async (file) => {
      console.log(`Importing ${file}`);
      if ((await lstat(`${path}/${file}`)).isDirectory()) {
        return importAllHandlers(`${path}/${file}`, server);
      }
      if (!(file.endsWith(".ts") || file.endsWith(".js"))) {
        return;
      }
      import(`${path}/${file}`)
        .then((module) => {
          const handler = module.default as RESTHandler;
          if (!handler) {
            return console.log(`${file} is not a REST handler`);
          }
          console.log(handler);
          let user = null as User | null;
          server[handler.method](handler.path, async (req, res, next) => {
            if (handler.sendUser) {
              if (!req.headers.authorization)
                return res.status(401).send("Unauthorized");
              const tokenInfo = await Encryptions.decrypt(
                req.headers.authorization!
              );
              user = (await getUserByID(
                tokenInfo.data.userID!
              )) as unknown as User;
            }
            handler.run(req, res, next, user || undefined);
          });
          console.log(`Loaded ${file}`);
        })
        .catch((err) => {
          console.log(err);
        });
    })
  );
};
export const RESTServer = (): express.Application => {
  const server = express();
  server.use(express.json());
  server.use(express.urlencoded({ extended: true }));
  server.use(cors());
  console.log(
    "Importing REST Handlers",
    readdirSync(`${process.cwd()}/src/RESTEndpoints`)
  );
  importAllHandlers(`${process.cwd()}/src/RESTEndpoints`, server);
  const socketServer = new SocketServer(
    server.listen(env.port || 443, () => {
      console.log(`Listening on port ${env.port || 443}`);
    })
  );
  return server;
};
