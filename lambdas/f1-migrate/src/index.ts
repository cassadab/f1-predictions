import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  QueryCommand,
  PutCommand,
} from '@aws-sdk/lib-dynamodb';
import { Driver } from '../../types/src';

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
      ':pk': 'DRIVER',
    },
  };
  const queryResult = await ddbDocClient.send(new QueryCommand(params));

  const drivers = queryResult.Items.map(driver => {
    return {
      code: driver.sk,
      name: driver.name,
      team: driver.team,
      country: driver.country,
      score: 0,
      type: 'DRIVER22',
      season: '2022',
    } as Driver;
  });

  const updatePromises: Promise<any>[] = [];

  drivers.forEach(driver => {
    const item: any = driver;

    item['pk'] = driver.code;
    delete item['code'];

    item['sk'] = driver.season;
    delete item['season'];

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
