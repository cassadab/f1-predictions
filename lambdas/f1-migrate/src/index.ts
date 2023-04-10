import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  QueryCommand,
  PutCommand,
} from '@aws-sdk/lib-dynamodb';
import { Prediction } from '../../types/src';

const TableName = 'beeg-yoshi-f1';

const marshallOptions = {
  removeUndefinedValues: true, // false, by default.
};

const translateConfig = { marshallOptions };
const dynamoClient = new DynamoDBClient({ region: 'us-east-1' });
const ddbDocClient = DynamoDBDocumentClient.from(dynamoClient, translateConfig);

export const handler = async (event: any): Promise<void> => {
  const params = {
    TableName,
    Select: 'ALL_ATTRIBUTES',
    KeyConditionExpression: 'pk=:pk',
    ExpressionAttributeValues: {
      ':pk': 'PREDICTION',
    },
  };
  const queryResult = await ddbDocClient.send(new QueryCommand(params));

  const predictions = queryResult.Items.map(prediction => {
    return {
      discord: prediction.sk,
      country: prediction.country,
      dnf: prediction.dnf,
      overtake: prediction.overtake,
      rankings: prediction.rankings,
      score: prediction.score,
      season: '2022',
      entityType: 'PREDICTION22',
    } as Prediction;
  });

  const updatePromises: Promise<any>[] = [];

  predictions.forEach(prediction => {
    const item: any = prediction;

    item['pk'] = `PREDICTION|${prediction.discord}`;
    item['sk'] = '2022';

    console.log(item);
    const params = {
      TableName,
      Item: item,
    };

    const command = new PutCommand(params);
    updatePromises.push(ddbDocClient.send(command));
  });

  await Promise.all(updatePromises);
};
