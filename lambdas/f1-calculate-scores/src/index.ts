import { initConnection, getPrediction, getRankings, getSpecialDrivers, updatePredictionScore } from './dbService';
import { CalculateScoresRequest, CalculateScoresResponse } from './f1.interfaces';

export const handler = async (event: CalculateScoresRequest): Promise<CalculateScoresResponse> => {
  console.log(JSON.stringify(event));
  const conn = await initConnection();
  await conn.beginTransaction();

  const prediction = await getPrediction(event.discordId, conn);

  if (prediction) {
    const rankings = await getRankings(event.discordId, conn);

    const totalScore = rankings.map(ranking => ranking.score).reduce((prev, curr) => prev + curr, 0);

    const response = {
      score: totalScore,
      rankings,
    } as CalculateScoresResponse;

    if (event.save) {
      console.log(`Updating prediction score for ${event.discordId}`);
      await updatePredictionScore(event.discordId, totalScore, conn);
      return response;
    }

    console.log(`Obtaining special selections for ${event.discordId}`);
    const specialDrivers = await getSpecialDrivers(prediction.dnf, prediction.overtake, conn);
    response.dnf = specialDrivers.dnf;
    response.overtake = specialDrivers.overtake;
    return response;
  }

  return null;
};
