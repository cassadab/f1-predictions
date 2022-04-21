import { batchUpdate, getDrivers, getPredictions, getUpdateParams } from './dbService';

export const handler = async (event: any): Promise<void> => {
  const drivers = await getDrivers();

  const driverMap: { [key: string]: number } = {};
  drivers.forEach(driver => (driverMap[driver.code] = driver.rank));

  const predictions = await getPredictions();

  const updateParams = predictions.map(prediction => {
    return getUpdateParams(prediction.discord, calculateScore(prediction.rankings, driverMap));
  });

  console.log('Updating prediction scores');
  await batchUpdate(updateParams);
};

function calculateScore(rankings: string[], driverMap: { [key: string]: number }) {
  let score = 0;
  rankings.forEach((ranking, index) => {
    score += 0 - Math.abs(index + 1 - driverMap[ranking]);
  });

  return score;
}
