import { APIGatewayProxyEvent, APIGatewayProxyStructuredResultV2 } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';
import { Driver } from './f1.interfaces';
const TABLE_NAME = 'beeg-yoshi-f1';
const dynamo = new DynamoDB.DocumentClient();

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyStructuredResultV2> => {
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

    drivers.sort((a, b) => a.rank - b.rank);

    const response = {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'OPTIONS,GET',
      },
      body: JSON.stringify(drivers),
    };

    return response;
  }

  throw new Error('Unable to retrieve drivers');
};
