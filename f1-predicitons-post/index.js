const AWS = require('aws-sdk');
const rdsDataService = new AWS.RDSDataService();

exports.handler = async (event) => {
    const body = JSON.parse(event.body);
    const overwrite = await predictionExists(body);

    const transaction = await rdsDataService.beginTransaction({
        secretArn: process.env.SECRET_ARN,
        resourceArn: process.env.CLUSTER_ARN,
        database: 'f1_predictions',
    }).promise();

    if (overwrite) {
        console.log(`Prediction already exists for ${body.discord}. Overwriting`);
        await removeRankings(body, transaction.transactionId);
        await updatePrediction(body, transaction.transactionId);
    } else {
        await insertPrediction(body, transaction.transactionId);
    }

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
    console.log(`Inserting prediction for ${body.discord}`);
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
    console.log(`Inserting rankings for ${body.discord}`);
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

async function predictionExists(body) {
    const sqlParams = {
        secretArn: process.env.SECRET_ARN,
        resourceArn: process.env.CLUSTER_ARN,
        sql: 'SELECT discord from predictions WHERE discord=:discord',
        database: 'f1_predictions',
        parameters: [
            { name: 'discord', value: { stringValue: body.discord } }
        ]
    };
    const result = await rdsDataService.executeStatement(sqlParams).promise();
    console.log(`Predictions get: ${JSON.stringify(result)}`);
    return result.records.length > 0;
}


async function removeRankings(body, transactionId) {
    console.log(`Removing existing rankings for ${body.discord}`);
    const sqlParams = {
        secretArn: process.env.SECRET_ARN,
        resourceArn: process.env.CLUSTER_ARN,
        sql: 'DELETE FROM rankings WHERE prediction_id=:discord',
        database: 'f1_predictions',
        transactionId: transactionId,
        parameters: [
            { name: 'discord', value: { stringValue: body.discord } }
        ]
    };
    await rdsDataService.executeStatement(sqlParams).promise();
}

function updatePrediction(body, transactionId) {
    console.log(`Updating prediction for ${body.discord}`);
    return rdsDataService.executeStatement({
        secretArn: process.env.SECRET_ARN,
        resourceArn: process.env.CLUSTER_ARN,
        database: 'f1_predictions',
        transactionId,
        sql: 'UPDATE predictions SET dnf=:dnf, overtake=:overtake WHERE discord=:discord',
        parameters: [
            { name: 'discord', value: { stringValue: body.discord } },
            { name: 'dnf', value: { longValue: body.dnf } },
            { name: 'overtake', value: { longValue: body.overtake } },
        ]
    }).promise();
}