import { DynamoDB } from 'aws-sdk';
import { QueryInput, TransactWriteItem } from 'aws-sdk/clients/dynamodb';

const TABLE_NAME = 'beeg-yoshi-f1';
const dynamo = new DynamoDB.DocumentClient();

async function getPredictions() {
  console.log('Retrieving predictions');
  const params = {
    TableName: TABLE_NAME,
    IndexName: 'TypeScoreIndex',
    KeyConditionExpression: 'entityType=:et',
    ExpressionAttributeValues: {
      ':et': `PREDICTION${process.env.SEASON.substring(2)}`,
    },
  } as QueryInput;

  const result = await dynamo.query(params).promise();
  if (result.Items) {
    const predictions = result.Items.map(prediction => {
      return {
        discord: prediction.pk,
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
        pk: `${discord}`,
        sk: process.env.SEASON,
      },
      ConditionExpression: 'entityType = :et',
      UpdateExpression: 'SET score = :s',
      ExpressionAttributeValues: {
        ':s': score,
        ':et': `PREDICTION${process.env.SEASON.substring(2)}`,
      },
    },
  } as TransactWriteItem;
}

function batchUpdate(items: TransactWriteItem[]) {
  return dynamo.transactWrite({ TransactItems: items }).promise();
}

export { getPredictions, getUpdateParams, batchUpdate };
