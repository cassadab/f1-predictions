import { APIGatewayProxyEvent, APIGatewayProxyStructuredResultV2 } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';
import { GetItemInput } from 'aws-sdk/clients/dynamodb';
import { Driver, PredictionsGetResponse, Ranking } from './predictions-get.interfaces';

const TABLE_NAME = 'beeg-yoshi-f1';
const dynamo = new DynamoDB.DocumentClient();

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyStructuredResultV2> => {
  const discordId = decodeURIComponent(event.pathParameters.discordId);
  console.log(`Getting prediction for ${discordId}`);

  const params = {
    TableName: TABLE_NAME,
    Key: {
      pk: 'PREDICTION',
      sk: discordId,
    },
  } as GetItemInput;
  const result = await dynamo.get(params).promise();
  const item = result.Item;
  if (item) {
    const drivers = await getDrivers();
    const rankings = parseRankings(drivers, item.rankings);

    const prediction = {
      discord: item.sk,
      name: item.name,
      country: item.country,
      dnf: item.dnf,
      overtake: item.overtake,
      score: item.score,
      rankings,
    } as PredictionsGetResponse;

    const response = {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'OPTIONS,GET',
      },
      body: JSON.stringify(prediction),
    } as APIGatewayProxyStructuredResultV2;
    return response;
  }

  throw new Error('Prediction not found');
};

async function getDrivers(): Promise<Driver[]> {
  console.log('Retrieving drivers');
  const params = {
    TableName: TABLE_NAME,
    KeyConditionExpression: 'pk=:pk',
    ExpressionAttributeValues: {
      ':pk': 'DRIVER',
    },
  };

  const result = await dynamo.query(params).promise();
  if (result.Items) {
    const drivers = result.Items.map(driver => {
      return {
        code: driver.sk,
        name: driver.name,
        team: driver.team,
        rank: driver.standing,
        country: driver.country,
      } as Driver;
    });
    return drivers;
  }

  throw new Error('Unable to retrieve drivers');
}

function parseRankings(drivers: Driver[], rankings: string[]): Ranking[] {
  console.log('Parsing rankings');
  const driverMap: { [key: string]: Driver } = {};
  drivers.forEach(driver => (driverMap[driver.code] = driver));

  return rankings.map((code, index) => {
    const predictionRank = index + 1;
    const driver = driverMap[code];
    const score = 0 - Math.abs(predictionRank - driver.rank);

    return {
      predictionRank,
      driver,
      score,
    } as Ranking;
  });
}
