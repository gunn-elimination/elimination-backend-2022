import cors from "cors";
import express from "express";
import { readdirSync, readFileSync } from "fs";
import { lstat, readdir } from "fs/promises";
import { env } from "../../env";
import { User, RESTHandler } from "../../types/DisadusTypes";
import SocketServer from "./SocketServer";
import { API_DOMAIN } from "./constants";
import nFetch from "./fetch";
import { getUserByID } from "../Helpers/UserAPIs";
import { Encryptions } from "../Helpers/Encryptions";
import https from "https";
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
              ).catch((er) => {});
              if (tokenInfo) {
                user = (await getUserByID(
                  tokenInfo.data.userID!
                )) as unknown as User;
              } else {
                return res.status(401).send("Unauthorized");
              }
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
  if (env?.webserver) {
    const httpsServer = https.createServer(
      {
        //@ts-ignore
        key: readFileSync(env.webserver?.keyPath),
        //@ts-ignore
        cert: readFileSync(env.webserver?.certPath),
      },
      server
    );
    new SocketServer(
      httpsServer.listen(env.port, () => {
        console.log(`Secure HTTP Server started on port ${env.port}`);
      })
    );
  } else {
    console.log(`HTTP Server running on port ${env.port}`);
    new SocketServer(server.listen(env.port));
  }
  return server;
};
