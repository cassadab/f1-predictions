export interface PredictionsGetResponse {
  discord: string;
  name: string;
  country: string;
  score: number;
  dnf: string;
  overtake: string;
  rankings: Ranking[];
}

export interface Ranking {
  predictionRank: number;
  driver: Driver;
  score: number;
}

export interface Driver {
  code: string;
  name: string;
  team: string;
  rank: number;
  country: string;
}
