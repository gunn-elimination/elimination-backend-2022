import { Server, Socket, ServerOptions } from "socket.io";
import https from "https";
import { readdir } from "fs/promises";
import { lstatSync } from "fs";
import { SocketHandler, User } from "../../types/DisadusTypes";
import nFetch from "./fetch";
import { API_DOMAIN } from "./constants";
import { getUserByID } from "../Helpers/UserAPIs";
import { Encryptions } from "../Helpers/Encryptions";
export type WebRequest = {
  url: string;
  method: string;
};
// export type WebResponder = (req: WebRequest, res: WebResponse) => void | Promise<void>;
export class SocketServer {
  socketServer: Server;
  sockets: Map<string, Socket> = new Map();
  socketIdentities: Map<string, string> = new Map();
  socketEvents: Map<string, SocketHandler> = new Map();
  ready?: boolean = false;
  static self: SocketServer;
  constructor(httpsServer?: https.Server | Express.Application) {
    const options = {
      cors: {
        origin: "*",
      },
    } as Partial<ServerOptions>;
    this.socketServer = httpsServer
      ? new Server(httpsServer, options)
      : new Server(httpsServer, options);
    this.socketServer.on("connection", async (socket: Socket) => {
      if (!socket.handshake.headers.authorization)
        return socket.disconnect(true);
      this.sockets.set(socket.id, socket);
      const tokenInfo = await Encryptions.decrypt(
        socket.handshake.headers.authorization!
      ).catch((er) => {});
      if (!tokenInfo || tokenInfo.data.appID) return socket.disconnect(true);
      this.socketIdentities.set(socket.id, tokenInfo.data.userID!);
      (async () => {
        const userInfo = await getUserByID(tokenInfo.data.userID!);
        if (userInfo) {
          socket.join(`all`);
          socket.join(`userID_${userInfo.userID}`);
          socket.emit("userInfo", userInfo);
        }
      })();
      this.attachPathsToSocket(socket);
    });
    this.socketEvents = new Map();
    this.intializeSocketEvents();
    console.log("Socket Server Initialized");
    SocketServer.self = this;
  }
  async intializeSocketEvents() {
    const addPath = async (path: string) => {
      await Promise.all(
        (
          await readdir(path)
        ).map(async (file) => {
          if (lstatSync(`${path}/${file}`).isDirectory()) {
            return addPath(`${path}/${file}`);
          }
          if (!file.endsWith(".ts") && !file.endsWith(".js")) {
            return;
          }
          import(`${path}/${file}`).then((module) => {
            const handler = module.default as SocketHandler;
            if (!handler) {
              return console.log(`${file} is not a socket handler`);
            }
            this.socketEvents.set(handler.event, handler);
            console.log(`Socket Event ${handler.event} added`);
          });
        })
      );
    };
    // await addPath(`${__dirname}/SocketHandlers`);
    console.log("Socket Paths Initialized");
    this.ready = true;
  }
  attachPathsToSocket(socket: Socket) {
    console.log(
      "Attaching Paths to Socket",
      Array.from(this.socketEvents.values()).map((x) => x.event)
    );
    socket.removeAllListeners();
    socket.on("disconnect", () => {
      this.sockets.delete(socket.id);
      this.socketIdentities.delete(socket.id);
    });
    this.socketEvents.forEach((handler) => {
      socket.on(handler.event, (...data) => {
        handler.run(
          socket,
          () => this.socketIdentities.get(socket.id) || "",
          ...data
        );
      });
      console.log(`Socket Event ${handler.event} added`);
    });
  }
}
export default SocketServer;
