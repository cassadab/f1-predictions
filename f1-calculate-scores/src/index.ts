import { RDSDataService } from 'aws-sdk';
import { ExecuteStatementRequest, ExecuteStatementResponse, FieldList } from 'aws-sdk/clients/rdsdataservice';
import {
  PredictionRecord,
  FullRanking,
  Driver,
  SpecialDrivers,
  CalculateScoresRequest,
  CalculateScoresResponse,
} from './f1.interfaces';

const rdsDataService = new RDSDataService();
const DATABASE_NAME = 'f1_predictions';

export const handler = async (event: CalculateScoresRequest): Promise<CalculateScoresResponse> => {
  console.log(JSON.stringify(event));

  const prediction = await getPrediction(event.discordId);

  if (prediction) {
    const rankings = await getRankings(event.discordId);

    const totalScore = rankings.map(ranking => ranking.score).reduce((prev, curr) => prev + curr, 0);

    const response = {
      score: totalScore,
      rankings,
    } as CalculateScoresResponse;

    if (event.save) {
      console.log(`Updating prediction score for ${event.discordId}`);
      await updatePredictionScore(event.discordId, totalScore, event.transactionId);
      return response;
    }

    console.log(`Obtaining special selections for ${event.discordId}`);
    const specialDrivers = await getSpecialDrivers(prediction.dnf, prediction.overtake);
    response.dnf = specialDrivers.dnf;
    response.overtake = specialDrivers.overtake;
    return response;
  }

  return null;
};

async function getPrediction(discordId: string): Promise<PredictionRecord> {
  console.log(`Obtaining prediction record for ${discordId}`);
  const params = {
    secretArn: process.env.SECRET_ARN,
    resourceArn: process.env.CLUSTER_ARN,
    database: DATABASE_NAME,
    sql: `SELECT discord, name, country, dnf, overtake FROM predictions
          WHERE discord=:discord`,
    parameters: [{ name: 'discord', value: { stringValue: discordId } }],
  } as ExecuteStatementRequest;
  const result = await rdsDataService.executeStatement(params).promise();
  if (!(result.records.length > 0)) {
    console.log(`No prediction found for ${discordId}`);
    return null;
  }
  return parsePrediction(result.records[0]);
}

function parsePrediction(record: FieldList): PredictionRecord {
  return {
    discord: record[0].stringValue,
    name: record[1].stringValue,
    country: record[2].stringValue,
    dnf: record[3].stringValue,
    overtake: record[4].stringValue,
  } as PredictionRecord;
}

async function getRankings(discordId: string): Promise<FullRanking[]> {
  console.log(`Obtaining rankings for ${discordId}`);
  const sqlParams = getRankingsSQLParams(discordId);
  const result = await rdsDataService.executeStatement(sqlParams).promise();
  return result.records.map(record => parseRanking(record));
}

function parseRanking(record: FieldList): FullRanking {
  const predictionRank = record[0].longValue;
  const rank = record[4].longValue;
  const score = 0 - Math.abs(predictionRank - rank);

  return {
    predictionRank,
    driverId: record[1].stringValue,
    name: record[2].stringValue,
    team: record[3].stringValue,
    country: record[5].stringValue,
    score,
  } as FullRanking;
}

function getRankingsSQLParams(discordId: string): ExecuteStatementRequest {
  return {
    secretArn: process.env.SECRET_ARN,
    resourceArn: process.env.CLUSTER_ARN,
    database: DATABASE_NAME,
    sql: `SELECT r.rank as prediction_rank, r.driver, d.name, d.team, d.rank, d.country 
          FROM rankings r
          INNER JOIN drivers d
          ON r.driver=d.code
          WHERE prediction_id=:discord
          ORDER BY prediction_rank;`,
    parameters: [{ name: 'discord', value: { stringValue: discordId } }],
  } as ExecuteStatementRequest;
}

async function getSpecialDrivers(dnf: string, overtake: string): Promise<SpecialDrivers> {
  const params = {
    secretArn: process.env.SECRET_ARN,
    resourceArn: process.env.CLUSTER_ARN,
    database: DATABASE_NAME,
    sql: `SELECT code, name, team, rank, country FROM drivers
          WHERE code in (:dnf, :overtake)`,
    parameters: [
      { name: 'dnf', value: { stringValue: dnf } },
      { name: 'overtake', value: { stringValue: overtake } },
    ],
  } as ExecuteStatementRequest;
  const result = await rdsDataService.executeStatement(params).promise();
  const drivers = result.records.map(record => parseDriver(record));
  const overtakeDriver = drivers.find(driver => driver.code == overtake);
  const dnfDriver = drivers.find(driver => driver.code == dnf);
  return {
    overtake: overtakeDriver,
    dnf: dnfDriver,
  } as SpecialDrivers;
}

function parseDriver(record: FieldList): Driver {
  return {
    code: record[0].stringValue,
    name: record[1].stringValue,
    team: record[2].stringValue,
    rank: record[3].longValue,
    country: record[4].stringValue,
  } as Driver;
}

function updatePredictionScore(
  discordId: string,
  score: number,
  transactionId: string,
): Promise<ExecuteStatementResponse> {
  const params = {
    secretArn: process.env.SECRET_ARN,
    resourceArn: process.env.CLUSTER_ARN,
    database: DATABASE_NAME,
    transactionId,
    sql: 'UPDATE predictions SET score=:score WHERE discord=:discord',
    parameters: [
      { name: 'discord', value: { stringValue: discordId } },
      { name: 'score', value: { longValue: score } },
    ],
  } as ExecuteStatementRequest;

  return rdsDataService.executeStatement(params).promise();
}
