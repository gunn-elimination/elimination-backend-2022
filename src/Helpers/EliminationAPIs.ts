import {
  EliminationKillFeed,
  EliminationKillType,
  EliminationUserData,
} from "../../types/EliminationTypes";
import { GameInfo, GameType } from "../../types/MinigameTypes";
import SocketEventManager from "../Utils/SocketEventManager";
import { generateID } from "./Functions";
import { getGameFromID, getParticipants } from "./GamesAPI";
import TetLib from "./TetLib";
import fs from "fs/promises";
const createEliminationParticipants = async (info: GameInfo) => {
  const participantsCollection = await MongoDB.db(
    "EliminationUserData"
  ).createCollection(info.id);
  await participantsCollection.createIndexes([
    {
      key: {
        userID: "hashed",
      },
      name: "userID",
    },
    {
      key: {
        kills: -1,
      },
      name: "kills",
    },
    {
      key: {
        targetID: "hashed",
      },
      name: "targetID",
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
    .then(async () => {
      const participants = await getParticipants(info.id);
      const nouns = await fs
        .readFile("./nouns.txt")
        .then((x) => x.toString().split("\n"));
      //randomize order of participants
      participants.sort(() => Math.random() - 0.5);
      const chooseRandomNoun = () =>
        nouns[Math.floor(Math.random() * nouns.length)];
      const targetObjects = [
        {
          userID: participants[0],
          kills: 0,
          targetID: participants[participants.length - 1],
          //choose 5 random nouns concatenated together by a dash
          secret: [
            chooseRandomNoun(),
            chooseRandomNoun(),
            chooseRandomNoun(),
            chooseRandomNoun(),
            chooseRandomNoun(),
          ]
            .join("-")
            .toUpperCase(),
          eliminated: false,
        } as EliminationUserData,
      ];
      for (let i = 1; i < participants.length; i++) {
        targetObjects.push({
          userID: participants[i],
          kills: 0,
          targetID: participants[i - 1],
          secret: [
            chooseRandomNoun(),
            chooseRandomNoun(),
            chooseRandomNoun(),
            chooseRandomNoun(),
            chooseRandomNoun(),
          ]
            .join("-")
            .toUpperCase(),
          eliminated: false,
        });
      }
      await MongoDB.db("EliminationUserData")
        .collection(info.id)
        .insertMany(targetObjects);
      return true;
    })
    .catch((er) => {
      console.error(er);
      return false;
    });
const shuffle = async (gameID: string) => {
  const game = await getGameFromID(gameID);
  const participants = await MongoDB.db("EliminationUserData")
    .collection(gameID)
    .find({})
    .toArray();
  const shuffled = participants
    .sort(() => Math.random() - 0.5)
    .filter(
      (p) => !p.eliminated && p.userID
    ) as unknown as EliminationUserData[];
  for (let i = 0; i < shuffled.length - 1; i++) {
    shuffled[i].targetID = shuffled[i + 1].userID;
  }
  shuffled[shuffled.length - 1].targetID = shuffled[0].userID;
  await Promise.all(
    shuffled.map((p) => updateEliminationParticipant(gameID, p.userID, p))
  );
  shuffled.map((x) =>
    SocketEventManager.broadcastEvent(
      `userID_${x.userID}`,
      "eliminationUpdateSelf",
      {
        user: x,
        game,
      }
    )
  );
  return shuffled;
};
const revive = async (gameID: string, userID: string, actorID: string) => {
  const participant = await getEliminationParticipant(gameID, userID);
  if (!participant) return false;
  participant.eliminated = false;
  await updateEliminationParticipant(gameID, userID, participant);
  const eliminationRecord = {
    target: userID,
    entity: actorID,
    type: EliminationKillType.Resurrect,
    at: Date.now(),
  };
  const game = await getGameFromID(gameID);
  await MongoDB.db("EliminationKillFeeds")
    .collection(gameID)
    .insertOne(eliminationRecord);
  SocketEventManager.broadcastEvent(`all`, "eliminationKill", {
    kill: eliminationRecord,
    game,
    user: {
      userID: actorID,
    },
    target: {
      userID: participant.targetID,
      eliminated: false,
    },
  });
  SocketEventManager.broadcastEvent(
    `userID_${userID}`,
    "eliminationUpdateSelf",
    {
      user: participant,
      game,
    }
  );
  return true;
};

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
  before?: number,
  forceKills: boolean = false,
) => {
  let gameInfo = await getGameFromID(gameID);
  if (!gameInfo) {
    return null;
  }
  return (await MongoDB.db("EliminationKillFeeds")
    .collection(gameID)
    .find(Object.assign(before ? { at: { $lt: before } } : {}, forceKills? {}:{type: { $ne: EliminationKillType.ForceKill}}))
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
    return { error: "Game not found" };
  }
  if (game.game !== GameType.Elimination) {
    return { error: "Game is not an elimination game" };
  }
  if (game.start > Date.now()) {
    return { error: "Game has not started yet" };
  }
  if (game.end < Date.now()) {
    return { error: "Game has ended" };
  }
  const participant = await getEliminationParticipant(gameID, userID);
  if (!participant) {
    return { error: "Elimination participant not found" };
  }
  if (participant.targetID !== targetID && !adminKill) {
    return { error: "Target ID does not match" };
  }
  const target = await getEliminationParticipant(gameID, targetID);
  if (!target) {
    return { error: "Target participant not found" };
  }
  if (target.secret !== secret && !adminKill) {
    return { error: "Kill code does not match" };
  }
  if (participant.eliminated && !adminKill) {
    return { error: "You have already been eliminated" };
  }
  if (target.eliminated && !adminKill) {
    return { error: "Target has already been eliminated" };
  }
  await updateEliminationParticipant(gameID, targetID, {
    eliminated: true,
    eliminatedAt: Date.now(),
    eliminatedBy: userID,
  });
  let targeterUser = null as null | EliminationUserData;
  if (!adminKill) {
    await updateEliminationParticipant(gameID, userID, {
      kills: participant.kills + 1,
      targetID: target.targetID,
    });
  } else {
    const targeter = (await MongoDB.db("EliminationUserData")
      .collection(gameID)
      .findOne({ targetID })) as any as EliminationUserData;
    if (!targeter) {
      return { error: "Target participant not found" };
    }
    console.log(targeter);
    await updateEliminationParticipant(gameID, targeter.userID, {
      kills: targeter.kills + 1,
      targetID: target.targetID,
    });
    targeterUser = targeter;
  }
  const eliminationRecord = {
    target: targetID,
    entity: adminKill || userID,
    type: adminKill ? EliminationKillType.ForceKill : EliminationKillType.Kill,
    at: Date.now(),
  };
  await MongoDB.db("EliminationKillFeeds")
    .collection(gameID)
    .insertOne(eliminationRecord);
  SocketEventManager.broadcastEvent(`all`, "eliminationKill", {
    kill: eliminationRecord,
    game,
    user: {
      userID: targeterUser?.userID || adminKill,
      kills: participant.kills + 1,
    },
    target: {
      userID: targetID,
      kills: target.kills,
      eliminated: true,
    },
  });
  SocketEventManager.broadcastEvent(
    `userID_${targeterUser?.userID || userID}`,
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
      user: {
        ...target,
        eliminated: true,
        eliminatedAt: Date.now(),
        eliminatedBy: userID,
      },
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
  shuffle,
  revive,
};
