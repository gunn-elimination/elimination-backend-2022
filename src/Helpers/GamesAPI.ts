import { GameAnnouncement, GameInfo } from "../../types/MinigameTypes";
import SocketEventManager from "../Utils/SocketEventManager";
import { generateID } from "./Functions";
import TetLib from "./TetLib";

export const getGameFromID = (id: string) =>
  MongoDB.db("Games")
    .collection("gameInfo")
    .findOne({ id: id }) as Promise<GameInfo | null>;
export const getGames = () =>
  MongoDB.db("Games")
    .collection("gameInfo")
    .find({})
    .toArray() as unknown as Promise<GameInfo[]>;
export const createGame = async (info: Partial<GameInfo>) => {
  const newGame = {
    ...info,
    id: generateID(15),
  } as GameInfo;
  let unique = await getGameFromID(newGame.id);
  let iter = 0;
  while (unique) {
    newGame.id = generateID(15 + iter);
    unique = await getGameFromID(newGame.id);
    iter++;
  }
  MongoDB.db("Games")
    .collection("gameInfo")
    .insertOne(newGame)
    .then(() => newGame);
  return newGame;
};
export const deleteGame = (id: string) =>
  MongoDB.db("Games")
    .collection("gameInfo")
    .deleteOne({ id: id })
    .then(() => true);
export const updateGameInfo = (id: string, info: Partial<GameInfo>) =>
  MongoDB.db("Games")
    .collection("gameInfo")
    .updateOne({ id: id }, { $set: info })
    .then(() => true);
export const getParticipants = (gameID: string) => {
  return MongoDB.db("Games")
    .collection("gameParticipants")
    .find({ id: gameID })
    .toArray()
    .then((p) => p.map((p) => p.userID)) as Promise<string[]>;
};
export const getParticipant = (gameID: string, userID: string) =>
  MongoDB.db("Games")
    .collection("gameParticipants")
    .findOne({ id: gameID, userID: userID }) as Promise<{
    id: string;
    userID: string;
  } | null>;

export const joinGame = async (gameID: string, userID: string) => {
  MongoDB.db("Games")
    .collection("gameParticipants")
    .insertOne({ id: gameID, userID: userID })
    .then(() => true);
};
export const leaveGame = (gameID: string, userID: string) =>
  MongoDB.db("Participants")
    .collection("gameParticipants")
    .deleteOne({ id: gameID, userID: userID })
    .then(() => true);
export const getAnnouncements = (gameID: string) =>
  MongoDB.db("Games")
    .collection("gameAnnouncements")
    .find({ game: gameID })
    .toArray() as unknown as Promise<GameAnnouncement[]>;
const insertAnnouncement = (announcement: GameAnnouncement) =>
  MongoDB.db("Games")
    .collection("gameAnnouncements")
    .insertOne(announcement)
    .then(() => announcement);
export const createAnnouncement = (
  game: GameInfo,
  announcement: string,
  userID: string
) =>
  insertAnnouncement({
    game: game.id,
    time: Date.now(),
    message: announcement,
    userID,
  }).then((announcement) => {
    SocketEventManager.broadcastEvent("all", "gameAnnouncement", {
      game,
      announcement,
    });
    return announcement;
  });
