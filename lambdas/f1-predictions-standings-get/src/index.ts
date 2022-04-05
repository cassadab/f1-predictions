import { APIGatewayProxyEvent, APIGatewayProxyStructuredResultV2 } from 'aws-lambda';
import { getStandings, initConnection } from './dbService';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyStructuredResultV2> => {
  console.log(JSON.stringify(event));

  const conn = await initConnection();
  const standings = await getStandings(conn);

  await conn.end();

  const response = {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'OPTIONS,GET',
    },
    body: JSON.stringify(standings),
  };

  return response as APIGatewayProxyStructuredResultV2;
};
