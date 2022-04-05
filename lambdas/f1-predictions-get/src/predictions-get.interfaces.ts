export interface PredictionsGetResponse {
  discord: string;
  name: string;
  country: string;
  score: number;
  rankings: Ranking[];
}

export interface Ranking {
  predictionRank: string;
  driver: string;
  country: string;
  score: string;
  driverStanding: string;
}
