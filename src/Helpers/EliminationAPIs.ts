import {
  EliminationKillFeed,
  EliminationKillType,
  EliminationUserData,
} from "../../types/EliminationTypes";
import { GameInfo, GameType } from "../../types/MinigameTypes";
import SocketEventManager from "../Utils/SocketEventManager";
import { generateID } from "./Functions";
import { getGameFromID, getParticipants } from "./GamesAPI";
const createEliminationParticipants = async (info: GameInfo) => {
  const participantsCollection = await MongoDB.db(
    "EliminationUserData"
  ).createCollection(info.id);
  await participantsCollection.createIndexes([
    {
      key: {
        userID: "hashed",
      },
      unique: true,
      name: "userID",
    },
    {
      key: {
        kills: -1,
      },
      name: "kills",
    },
  ]);
};
const createEliminationKillFeed = async (info: GameInfo) => {
  const killFeedCollection = await MongoDB.db(
    "EliminationKillFeeds"
  ).createCollection(info.id);
  await killFeedCollection.createIndex({
    at: -1,
  });
};

export const initializeEliminationGame = async (info: GameInfo) =>
  Promise.all([
    createEliminationKillFeed(info),
    createEliminationParticipants(info),
  ])
    .then(() => true)
    .catch(() => false);

const leaderboard = async (gameID: string, limit: number) => {
  let gameInfo = await getGameFromID(gameID);
  if (!gameInfo) {
    return [];
  }
  const lb = await MongoDB.db("EliminationUserData")
    .collection(gameID)
    .find({})
    .sort({ kills: -1 })
    .limit(limit)
    .toArray();
  return lb.map((p) => ({
    userID: p.userID,
    kills: p.kills,
    eliminated: p.eliminated,
    eliminatedAt: p.eliminatedAt,
    eliminatedBy: p.eliminatedBy,
  }));
};
const getEliminationParticipant = (gameID: string, userID: string) =>
  MongoDB.db("EliminationUserData")
    .collection(gameID)
    .findOne({ userID: userID }) as Promise<EliminationUserData | null>;
const updateEliminationParticipant = async (
  gameID: string,
  userID: string,
  data: Partial<EliminationUserData>
) => {
  await MongoDB.db("EliminationUserData")
    .collection(gameID)
    .updateOne({ userID: userID }, { $set: data });
  return true;
};
const getEliminationKillFeed = async (
  gameID: string,
  limit: number = 30,
  before?: number
) => {
  let gameInfo = await getGameFromID(gameID);
  if (!gameInfo) {
    return null;
  }
  return (await MongoDB.db("EliminationKillFeeds")
    .collection(gameID)
    .find(before ? { at: { $lt: before } } : {})
    .sort({ at: -1 })
    .limit(limit)
    .toArray()) as unknown as EliminationKillFeed[];
};

const eliminateParticipant = async (
  gameID: string,
  userID: string,
  targetID: string,
  secret: string,
  adminKill?: string
) => {
  const game = await getGameFromID(gameID);
  if (!game) {
    return {error: "Game not found"};
  }
  if (game.game !== GameType.Elimination) {
    return {error: "Game is not an elimination game"};
  }
  if (game.start > Date.now()) {
    return {error: "Game has not started yet"};
  }
  if (game.end < Date.now()) {
    return {error: "Game has ended"};
  }
  const participant = await getEliminationParticipant(gameID, userID);
  if (!participant) {
    return {error: "Elimination participant not found"};
  }
  if (participant.targetID !== targetID && !adminKill) {
    return {error: "Target ID does not match"};
  }
  const target = await getEliminationParticipant(gameID, targetID);
  if (!target) {
    return {error: "Target participant not found"};
  }
  if (target.secret !== secret && !adminKill) {
    return {error:"Kill code does not match"};
  }
  if (participant.eliminated && !adminKill) {
    return {error: "You have already been eliminated"};
  }
  if (target.eliminated && !adminKill) {
    return {error:"Target has already been eliminated"};
  }
  await updateEliminationParticipant(gameID, targetID, {
    eliminated: true,
    eliminatedAt: Date.now(),
    eliminatedBy: userID,
  });
  await updateEliminationParticipant(gameID, userID, {
    kills: participant.kills + 1,
    targetID: target.targetID,
  });
  const eliminationRecord = {
    target: targetID,
    entity: adminKill || userID,
    type: adminKill ? EliminationKillType.ForceKill : EliminationKillType.Kill,
    at: Date.now(),
  };
  await MongoDB.db("EliminationKillFeeds")
    .collection(gameID)
    .insertOne(eliminationRecord);
  SocketEventManager.broadcastEvent(
    `all`,
    "eliminationKill",
    {
      kill: eliminationRecord,
      game,
      user: {
        userID: userID,
        kills: participant.kills + 1,
      },
      target: {
        userID: targetID,
        kills: target.kills,
        eliminated: true,
      },
    }
  );
  SocketEventManager.broadcastEvent(
    `userID_${userID}`,
    "eliminationUpdateSelf",
    {
      user: participant,
      game,
    }
  );
  SocketEventManager.broadcastEvent(
    `userID_${targetID}`,
    "eliminationUpdateSelf",
    {
      user: target,
      game,
    }
  );
  return true;
};
export const EliminationAPIs = {
  leaderboard,
  getEliminationParticipant,
  updateEliminationParticipant,
  getEliminationKillFeed,
  eliminateParticipant,
  initializeEliminationGame,
};
