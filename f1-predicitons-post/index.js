const AWS = require('aws-sdk');
const rdsDataService = new AWS.RDSDataService();

exports.handler = async (event) => {
    const body = JSON.parse(event.body);
    
    const transaction = await rdsDataService.beginTransaction({
        secretArn: process.env.SECRET_ARN,
        resourceArn: process.env.CLUSTER_ARN,
        database: 'f1_predictions',
    }).promise();

    console.log(`Transaction: ${transaction.transactionId}`);
    
    await insertPrediction(body, transaction.transactionId);
    console.log('Done inserting prediction');
    await Promise.all(insertRankings(body, transaction.transactionId));

    console.log('Commiting transaction');
    await rdsDataService.commitTransaction({
        secretArn: process.env.SECRET_ARN,
        resourceArn: process.env.CLUSTER_ARN,
        transactionId: transaction.transactionId,
    }).promise();

    const response = {
        statusCode: 201,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "OPTIONS,PUT"
        },
        body: JSON.stringify(body),
    };
    
    return response;
};

async function insertPrediction(body, transactionId) {
    console.log('Inserting prediction');
    await rdsDataService.executeStatement({
        secretArn: process.env.SECRET_ARN,
        resourceArn: process.env.CLUSTER_ARN,
        database: 'f1_predictions',
        transactionId: transactionId,
        sql: 'INSERT INTO predictions (discord,name,country,dnf,overtake) VALUES(:discord,:name,:country,:dnf,:overtake)',
        parameters: [
        { name: 'discord', value: { stringValue: body.discord } },
        { name: 'name', value: { stringValue: body.name } },
        { name: 'country', value: { stringValue: body.country } },
        { name: 'dnf', value: { longValue: body.dnf } },
        { name: 'overtake', value: { longValue: body.overtake } },
      ]
    }).promise();
}

function insertRankings(body, transactionId) {
    console.log('Inserting rankings');
    return body.rankings.map((ranking, index) => {
        console.log(ranking);
        return rdsDataService.executeStatement({
            secretArn: process.env.SECRET_ARN,
            resourceArn: process.env.CLUSTER_ARN,
            database: 'f1_predictions',
            transactionId,
            sql: 'INSERT INTO rankings (prediction_id,driver,rank) VALUES(:prediction_id,:driver,:rank)',
            parameters: [
            { name: 'prediction_id', value: { stringValue: body.discord } },
            { name: 'driver', value: { longValue: ranking } },
            { name: 'rank', value: { longValue: index + 1 } },
          ]
        }).promise();
    });
}
