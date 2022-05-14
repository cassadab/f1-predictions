export interface StandingsResponse {
  MRData: MRData;
}

export interface MRData {
  StandingsTable: StandingsTable;
}

export interface StandingsTable {
  StandingsLists: StandingsList[];
}

export interface StandingsList {
  DriverStandings: DriverStanding[];
}

export interface DriverStanding {
  position: string;
  Driver: ApiDriver;
}

export interface ApiDriver {
  code: string;
}
