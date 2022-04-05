export interface CalculateScoresRequest {
  discordId: string;
  save?: boolean;
  transactionId?: string;
}

export interface CalculateScoresResponse {
  score: number;
  dnf?: Driver;
  overtake?: Driver;
  rankings: FullRanking[];
}

export interface PredictionRecord {
  discord: string;
  name: string;
  overtake: string;
  dnf: string;
  score: number;
  country: string;
}

export interface FullRanking {
  discord: string;
  driverId: string;
  name: string;
  team: string;
  country: string;
  predictionRank: number;
  rank: number;
  score: number;
}

export interface Driver {
  code: string;
  name: string;
  team: string;
  rank: number;
  country: string;
}

export interface SpecialDrivers {
  dnf: Driver;
  overtake: Driver;
}
