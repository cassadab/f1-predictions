import { batchUpdate, getPredictions, getUpdateParams } from './dbService';

export const handler = async (event: any): Promise<void> => {
  const drivers = event.standings;

  const driverMap: { [key: string]: number } = {};

  for (let i = 0; i < drivers.length; i++) {
    // we assume list is already in proper order of standings
    driverMap[drivers[i].code] = i + 1;
  }

  const predictions = await getPredictions();

  const updateParams = predictions.map(prediction => {
    return getUpdateParams(
      prediction.discord,
      calculateScore(prediction.rankings, driverMap),
    );
  });

  console.log('Updating prediction scores');
  await batchUpdate(updateParams);
};

function calculateScore(
  rankings: string[],
  driverMap: { [key: string]: number },
) {
  let score = 0;
  rankings.forEach((ranking, index) => {
    score += 0 - Math.abs(index + 1 - driverMap[ranking]);
  });

  return score;
}
