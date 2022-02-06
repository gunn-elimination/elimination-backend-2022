export type EliminationSettings = {
  allowMidgameJoin: boolean;
  showAvatars: boolean;
  showNames: boolean;
  showScoreboard: boolean;
};
export type EliminationUserData = {
  eliminated: boolean;
  eliminatedAt?: number;
  eliminatedBy?: string;
  userID: string;
  targetID?: string;
  secret?: string;
  kills: number;
};
export enum EliminationKillType {
  Kill = "kill",
  Resurrect = "resurrect",
  Surrender = "surrender",
  ForceKill = "forceKill",
  
}
export type EliminationKillFeed = {
  target: string;
  entity: string;
  type: EliminationKillType;
  at: number;
};
