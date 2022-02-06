import { GameInfo } from "../../types/MinigameTypes";
import { generateID } from "./Functions";

export const getGameFromID = (id: string) =>
  MongoDB.db("Games")
    .collection("gameInfo")
    .findOne({ id: id }) as Promise<GameInfo | null>;

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
};

export const getCommunityGames = (community: string) =>
  MongoDB.db("Games")
    .collection("gameInfo")
    .find({ community: community })
    .toArray() as unknown as Promise<GameInfo[]>;
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
