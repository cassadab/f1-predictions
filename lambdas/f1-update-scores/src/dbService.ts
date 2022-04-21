import { DynamoDB } from 'aws-sdk';
import { TransactWriteItem } from 'aws-sdk/clients/dynamodb';
import { Driver } from './f1.interfaces';

const TABLE_NAME = 'beeg-yoshi-f1';
const dynamo = new DynamoDB.DocumentClient();

async function getDrivers(): Promise<Driver[]> {
  console.log('Retrieving drivers');
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
    return drivers;
  }
}

async function getPredictions() {
  console.log('Retrieving drivers');
  const params = {
    TableName: TABLE_NAME,
    KeyConditionExpression: 'pk=:pk',
    ExpressionAttributeValues: {
      ':pk': 'PREDICTION',
    },
  };

  const result = await dynamo.query(params).promise();
  if (result.Items) {
    const predictions = result.Items.map(prediction => {
      return {
        discord: prediction.sk,
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
        pk: 'PREDICTION',
        sk: discord,
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
