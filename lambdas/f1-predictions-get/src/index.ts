import { APIGatewayProxyEvent, APIGatewayProxyStructuredResultV2 } from 'aws-lambda';
import { Lambda } from 'aws-sdk';
import { InvocationRequest } from 'aws-sdk/clients/lambda';

const lambda = new Lambda();

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyStructuredResultV2> => {
  console.log(JSON.stringify(event));

  const discordId = decodeURIComponent(event.pathParameters.discordId);

  const scoresResult = await invokeScoresLambda(discordId);

  const response = {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'OPTIONS,GET',
    },
    body: scoresResult.Payload.toString(),
  } as APIGatewayProxyStructuredResultV2;

  return response;
};

function invokeScoresLambda(discordId: string) {
  const payload = {
    discordId,
  };

  const params = {
    FunctionName: 'f1-calculate-scores-dev',
    InvocationType: 'RequestResponse',
    Payload: JSON.stringify(payload),
  } as InvocationRequest;

  return lambda.invoke(params).promise();
}
