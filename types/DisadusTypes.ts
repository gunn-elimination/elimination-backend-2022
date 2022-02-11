import { NextFunction, Request, Response } from "express";
import { Socket } from "socket.io";

export type RESTHandler = {
  path: string;
  method: RESTMethods;
  sendUser: boolean;
  run: (
    req: Request,
    res: Response,
    next: NextFunction,
    user?: User
  ) => void | Promise<void>;
};

export interface SocketHandler {
  event: string;
  run: (socket: Socket, identity: () => string, ...data: any) => void;
}

export enum RESTMethods {
  GET = "get",
  POST = "post",
  PUT = "put",
  DELETE = "delete",
}
export type User = {
  userID: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  admin: boolean;
  createdBy: "Disadus" | "Gunn.One" | "WATT" | "Standalone";
  password: string;
};
