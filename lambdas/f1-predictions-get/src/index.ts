import { APIGatewayProxyEvent, APIGatewayProxyStructuredResultV2 } from 'aws-lambda';
import { getPrediction, initConnection } from './dbService';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyStructuredResultV2> => {
  console.log(JSON.stringify(event));

  const conn = await initConnection();

  const discordId = decodeURIComponent(event.pathParameters.discordId);

  const prediction = await getPrediction(discordId, conn);
  await conn.end();

  const response = {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'OPTIONS,GET',
    },
    body: JSON.stringify(prediction),
  } as APIGatewayProxyStructuredResultV2;
  return response;
};
