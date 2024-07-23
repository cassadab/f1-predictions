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
    const [score, diffs] = calculateScore(prediction.rankings, driverMap);
    return getUpdateParams(prediction.discord, score, diffs);
  });

  console.log('Updating prediction scores');
  await batchUpdate(updateParams);
};

// Returns both an overall score and a map of the diff for each driver
function calculateScore(
  rankings: string[],
  driverMap: { [key: string]: number },
): [number, { [key: string]: number }] {
  const scoreDiffs: { [key: string]: number } = {};

  let overallScore = 0;
  rankings.forEach((ranking, index) => {
    const diff = 0 - Math.abs(index + 1 - driverMap[ranking]);
    overallScore += diff;
    scoreDiffs[ranking] = diff;
  });
  return [overallScore, scoreDiffs];
}
