import { DynamoDB } from 'aws-sdk';
import { QueryInput, TransactWriteItem } from 'aws-sdk/clients/dynamodb';
import { Driver } from './f1.interfaces';

const TABLE_NAME = 'beeg-yoshi-f1';
const dynamo = new DynamoDB.DocumentClient();

async function getDrivers(): Promise<Driver[]> {
  console.log('Retrieving drivers');
  const params = {
    TableName: TABLE_NAME,
    IndexName: 'TypeScoreIndex',
    KeyConditionExpression: 'entityType=:et',
    ExpressionAttributeValues: {
      ':et': 'DRIVER23',
    },
    ScanIndexForward: false,
  } as QueryInput;

  const result = await dynamo.query(params).promise();
  if (result.Items) {
    const drivers = result.Items.map(driver => {
      const code = driver.pk as string;
      return {
        code: code.split('|')[1],
        name: driver.name,
        team: driver.team,
        score: driver.score,
        country: driver.country,
      } as Driver;
    });
    return drivers;
  }
}

async function getPredictions() {
  console.log('Retrieving predictions');
  const params = {
    TableName: TABLE_NAME,
    IndexName: 'TypeScoreIndex',
    KeyConditionExpression: 'entityType=:et',
    ExpressionAttributeValues: {
      ':et': 'PREDICTION23',
    },
  } as QueryInput;

  const result = await dynamo.query(params).promise();
  if (result.Items) {
    const predictions = result.Items.map(prediction => {
      return {
        discord: prediction.discord,
        rankings: prediction.rankings,
      };
    });
    return predictions;
  }
}

function getUpdateParams(discord: string, score: number): TransactWriteItem {
  return {
    Update: {
      TableName: TABLE_NAME,
      Key: {
        pk: `PREDICTION|${discord}`,
        sk: '2023',
      },
      UpdateExpression: 'SET #s = :s',
      ExpressionAttributeNames: {
        '#s': 'score',
      },
      ExpressionAttributeValues: {
        ':s': score,
      },
    },
  } as TransactWriteItem;
}

function batchUpdate(items: TransactWriteItem[]) {
  return dynamo.transactWrite({ TransactItems: items }).promise();
}

export { getDrivers, getPredictions, getUpdateParams, batchUpdate };
