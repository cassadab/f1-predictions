import { Driver } from '../../types/src';
import { DynamoDB } from 'aws-sdk';
import { TransactWriteItem } from 'aws-sdk/clients/dynamodb';

const TABLE_NAME = 'beeg-yoshi-f1';
const dynamo = new DynamoDB.DocumentClient();

export const handler = async (event: any): Promise<void> => {
  await batchUpdate(event.standings);
  console.log('Update complete');
  return event;
};

function buildDynamoParams(standings: Driver[]): TransactWriteItem[] {
  return standings.map(driver => {
    return {
      Update: {
        TableName: TABLE_NAME,
        Key: {
          pk: `${driver.code}`,
          sk: process.env.SEASON,
        },
        UpdateExpression: 'SET score = :s, entityType = :et',
        ExpressionAttributeValues: {
          ':s': driver.score,
          ':et': `DRIVER${process.env.SEASON.substring(2)}`,
        },
      },
    } as TransactWriteItem;
  });
}

function batchUpdate(standings: Driver[]) {
  const items = buildDynamoParams(standings);
  console.log('Updating driver standings');
  return dynamo.transactWrite({ TransactItems: items }).promise();
}
