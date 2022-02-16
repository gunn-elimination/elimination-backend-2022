import { EliminationSettings } from "./EliminationTypes";

export enum GameType {
  Elimination = "elimination",
  oop = ""
}
export type GameInfo = {
  game: GameType;
  start: number;
  end: number;
  id: string;
  name: string;
  description: string;
  
};
export type GameSettings = EliminationSettings;