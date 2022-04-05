import { APIGatewayProxyEvent, APIGatewayProxyStructuredResultV2 } from 'aws-lambda';
import { getPrediction, getRankings, initConnection } from './dbService';
import { PredictionsGetResponse, Ranking } from './predictions-get.interfaces';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyStructuredResultV2> => {
  console.log(JSON.stringify(event));

  const conn = await initConnection();

  const discordId = decodeURIComponent(event.pathParameters.discordId);

  const prediction = await getPrediction(discordId, conn);
  const rankings = (await getRankings(discordId, conn)) as Ranking[];

  const result = {
    ...prediction,
    rankings,
  } as PredictionsGetResponse;
  await conn.end();

  const response = {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'OPTIONS,GET',
    },
    body: JSON.stringify(result),
  } as APIGatewayProxyStructuredResultV2;
  return response;
};
