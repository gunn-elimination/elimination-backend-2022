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
    user?: DisadusUser
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
export interface DisadusPublicUser {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  bio: string;
  pfp: string;
  premiumUntil: number;
  staffLevel: number;
  tester: boolean;
}

export interface DisadusUser extends DisadusPublicUser {
  communities: string[];
  primaryCommunity: string;
  community: {
    [key: string]: {
      courses: {
        [key: string]: number;
      };
      schoology: boolean;
    };
  };
  isAdmin: boolean;
  theme: number;
  devMode: boolean;
  pluginMode: boolean;
}
export type Community = {
  name: string;
  description: string;
  image: string;
  id: string;
  members: string[];
  admins: string[];
  memberIDs: string[];
  adminIDs: string[];
  creator: string;
  createdAt: string;
  colors: {
    primary: string;
    secondary: string;
  };
  provider: "schoology";
  vanitybg?: string;
  verified?: boolean;
  plugins?: string[];
};
