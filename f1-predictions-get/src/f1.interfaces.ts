export interface PredictionRecord {
    discord: string,
    name: string,
    overtake: string,
    dnf: string,
    score: number,
}

export interface FullRanking {
    discord: string,
    driverId: string,
    name: string,
    team: string,
    country: string,
    predictionRank: number,
    rank: number,
}

export interface Driver {
    code: string,
    name: string,
    team: string,
    rank: number,
    country: string,
}

export interface SpecialDrivers {
    dnf: Driver,
    overtake: Driver,
}