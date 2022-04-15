import { APIGatewayProxyEvent, APIGatewayProxyStructuredResultV2 } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';
import { QueryInput } from 'aws-sdk/clients/dynamodb';

const TABLE_NAME = 'beeg-yoshi-f1';
const dynamo = new DynamoDB.DocumentClient();

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyStructuredResultV2> => {
  const params = {
    TableName: TABLE_NAME,
    IndexName: 'ScoresIndex',
    ScanIndexForward: false,
    KeyConditionExpression: 'pk=:pk',
    ExpressionAttributeValues: {
      ':pk': 'PREDICTION',
    },
  } as QueryInput;

  const result = await dynamo.query(params).promise();
  const standings = result.Items.map(prediction => {
    return {
      discord: prediction.sk,
      country: prediction.country,
      name: prediction.name,
      score: prediction.score,
    };
  });

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
