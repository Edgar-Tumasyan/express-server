import { IScore } from "./score.interface";

export interface IScoreData {
  createData: Omit<IScore, "id">[];
  updateData: Omit<IScore, "id">[];
}

export type ScoreResult = Omit<IScore, "id">;
