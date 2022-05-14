export interface Driver {
  code: string;
  name: string;
  team: string;
  rank: number;
  country: string;
}

export interface PollUpdatesResponse {
  update: boolean;
  standings?: Driver[],
}
